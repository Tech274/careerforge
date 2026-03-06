import { useResume } from "@/contexts/ResumeContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PersonalInfoEditor() {
  const { resumeData, updateResumeData } = useResume();
  const { personalInfo } = resumeData;

  const update = (field: string, value: string) => {
    updateResumeData({
      personalInfo: { ...personalInfo, [field]: value },
    });
  };

  const fields = [
    { key: "name", label: "Full Name", placeholder: "John Doe" },
    { key: "title", label: "Job Title", placeholder: "Senior Software Engineer" },
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "phone", label: "Phone", placeholder: "+1 (555) 123-4567" },
    { key: "location", label: "Location", placeholder: "New York, NY" },
    { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/johndoe" },
    { key: "portfolio", label: "Portfolio", placeholder: "johndoe.com" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg text-foreground">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">{f.label}</Label>
            <Input
              value={(personalInfo as any)[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              className="bg-background"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
