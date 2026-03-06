import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ResumeData, TemplateName, emptyResumeData, calculateStrengthScore } from '@/types/resume';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SavedResume {
  id: string;
  title: string;
  data: ResumeData;
  template: TemplateName;
  updated_at: string;
}

interface ResumeVersion {
  id: string;
  version_number: number;
  resume_data: ResumeData;
  template: string;
  created_at: string;
}

interface ResumeContextType {
  resumeData: ResumeData;
  template: TemplateName;
  strengthScore: number;
  currentResumeId: string | null;
  savedResumes: SavedResume[];
  versions: ResumeVersion[];
  loading: boolean;
  saving: boolean;
  updateResumeData: (data: Partial<ResumeData>) => void;
  setTemplate: (t: TemplateName) => void;
  resetResume: () => void;
  saveResume: (title?: string) => Promise<void>;
  loadResume: (id: string) => void;
  deleteResume: (id: string) => Promise<void>;
  createNewResume: () => void;
  refreshResumes: () => Promise<void>;
  loadVersion: (version: ResumeVersion) => void;
  refreshVersions: () => Promise<void>;
  duplicateResume: (id: string) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData);
  const [template, setTemplate] = useState<TemplateName>('modern');
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateResumeData = useCallback((data: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...data }));
  }, []);

  const resetResume = useCallback(() => {
    setResumeData(emptyResumeData);
    setCurrentResumeId(null);
    setTemplate('modern');
    setVersions([]);
  }, []);

  const refreshResumes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setSavedResumes((data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        data: r.data as ResumeData,
        template: r.template as TemplateName,
        updated_at: r.updated_at,
      })));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshVersions = useCallback(async () => {
    if (!user || !currentResumeId) { setVersions([]); return; }
    try {
      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('resume_id', currentResumeId)
        .eq('user_id', user.id)
        .order('version_number', { ascending: false })
        .limit(20);
      if (error) throw error;
      setVersions((data || []).map((v: any) => ({
        id: v.id,
        version_number: v.version_number,
        resume_data: v.resume_data as ResumeData,
        template: v.template,
        created_at: v.created_at,
      })));
    } catch {
      // silent
    }
  }, [user, currentResumeId]);

  const saveResume = useCallback(async (title?: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const resumeTitle = title || resumeData.personalInfo.name || 'Untitled Resume';
      if (currentResumeId) {
        // Save version before updating
        const currentVersions = versions;
        const nextVersion = currentVersions.length > 0 ? currentVersions[0].version_number + 1 : 1;
        await supabase.from('resume_versions').insert({
          resume_id: currentResumeId,
          user_id: user.id,
          version_number: nextVersion,
          resume_data: resumeData as any,
          template,
        } as any);

        const { error } = await supabase
          .from('resumes')
          .update({ data: resumeData as any, template, title: resumeTitle, updated_at: new Date().toISOString() })
          .eq('id', currentResumeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('resumes')
          .insert({ user_id: user.id, data: resumeData as any, template, title: resumeTitle })
          .select('id')
          .single();
        if (error) throw error;
        setCurrentResumeId(data.id);
        // Save initial version
        await supabase.from('resume_versions').insert({
          resume_id: data.id,
          user_id: user.id,
          version_number: 1,
          resume_data: resumeData as any,
          template,
        } as any);
      }
      toast.success('Resume saved!');
      await refreshResumes();
      await refreshVersions();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [user, resumeData, template, currentResumeId, refreshResumes, refreshVersions, versions]);

  const loadResume = useCallback((id: string) => {
    const found = savedResumes.find(r => r.id === id);
    if (found) {
      setResumeData(found.data);
      setTemplate(found.template);
      setCurrentResumeId(found.id);
    }
  }, [savedResumes]);

  const loadVersion = useCallback((version: ResumeVersion) => {
    setResumeData(version.resume_data);
    setTemplate(version.template as TemplateName);
    toast.success(`Restored version ${version.version_number}`);
  }, []);

  const deleteResume = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) throw error;
      if (currentResumeId === id) resetResume();
      toast.success('Resume deleted');
      await refreshResumes();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete');
    }
  }, [currentResumeId, resetResume, refreshResumes]);

  const createNewResume = useCallback(() => {
    resetResume();
  }, [resetResume]);

  const duplicateResume = useCallback(async (id: string) => {
    if (!user) return;
    const source = savedResumes.find(r => r.id === id);
    if (!source) return;
    try {
      const { data, error } = await supabase
        .from('resumes')
        .insert({ user_id: user.id, data: source.data as any, template: source.template, title: `${source.title} (Copy)` })
        .select('id')
        .single();
      if (error) throw error;
      toast.success('Resume duplicated!');
      await refreshResumes();
      setResumeData(source.data);
      setTemplate(source.template);
      setCurrentResumeId(data.id);
    } catch (e: any) {
      toast.error(e.message || 'Failed to duplicate');
    }
  }, [user, savedResumes, refreshResumes]);

  useEffect(() => {
    if (user) refreshResumes();
    else {
      setSavedResumes([]);
      setCurrentResumeId(null);
    }
  }, [user, refreshResumes]);

  // Refresh versions when resume changes
  useEffect(() => {
    if (currentResumeId) refreshVersions();
  }, [currentResumeId, refreshVersions]);

  const strengthScore = calculateStrengthScore(resumeData);

  return (
    <ResumeContext.Provider value={{
      resumeData, template, strengthScore, currentResumeId, savedResumes, versions, loading, saving,
      updateResumeData, setTemplate, resetResume, saveResume, loadResume, deleteResume, createNewResume, refreshResumes,
      loadVersion, refreshVersions, duplicateResume,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}
