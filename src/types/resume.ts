export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
}

export interface Achievement {
  id: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
}

export type TemplateName = 'modern' | 'professional' | 'minimalist' | 'corporate' | 'executive' | 'creative' | 'elegant' | 'tech' | 'compact' | 'bold' | 'academic' | 'timeline' | 'infographic' | 'simple-two-column' | 'classic' | 'gradient' | 'nordic';

export interface Resume {
  id: string;
  title: string;
  data: ResumeData;
  template: TemplateName;
  strengthScore: number;
  createdAt: string;
  updatedAt: string;
}

export const emptyResumeData: ResumeData = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  achievements: [],
};

export function calculateStrengthScore(data: ResumeData): number {
  let score = 100;
  if (!data.summary.trim()) score -= 10;
  if (data.experience.length < 2) score -= 10;
  if (data.skills.length < 5) score -= 5;
  if (data.education.length === 0) score -= 10;
  if (data.certifications.length === 0) score -= 5;
  if (!data.personalInfo.name.trim()) score -= 10;
  if (!data.personalInfo.email.trim()) score -= 5;
  if (!data.personalInfo.phone.trim()) score -= 5;
  if (data.projects.length === 0) score -= 5;
  if (data.achievements.length === 0) score -= 5;
  return Math.max(0, score);
}
