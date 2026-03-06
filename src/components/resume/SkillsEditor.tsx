import { useResume } from "@/contexts/ResumeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

export function SkillsEditor() {
  const { resumeData, updateResumeData } = useResume();
  const [input, setInput] = useState("");

  const addSkill = () => {
    const skill = input.trim();
    if (skill && !resumeData.skills.includes(skill)) {
      updateResumeData({ skills: [...resumeData.skills, skill] });
      setInput("");
    }
  };

  const removeSkill = (skill: string) => {
    updateResumeData({ skills: resumeData.skills.filter(s => s !== skill) });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg text-foreground">Skills</h3>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
          placeholder="Type a skill and press Enter..."
          className="bg-background"
        />
        <Button onClick={addSkill} size="sm" variant="outline">Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {resumeData.skills.map(skill => (
          <Badge key={skill} variant="secondary" className="gap-1 py-1 px-3">
            {skill}
            <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {resumeData.skills.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
    </div>
  );
}
