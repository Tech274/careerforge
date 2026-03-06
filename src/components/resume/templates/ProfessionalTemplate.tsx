import { ResumeData } from "@/types/resume";

export function ProfessionalTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, projects, achievements } = data;

  return (
    <div className="bg-card text-card-foreground font-body text-sm leading-relaxed">
      {/* Header with brand gradient */}
      <div className="brand-gradient px-8 py-6 text-primary-foreground">
        <h1 className="font-display text-2xl font-bold">{personalInfo.name || "Your Name"}</h1>
        <p className="font-medium opacity-90">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-80">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
        </div>
      </div>

      <div className="p-8 space-y-5">
        {summary && (
          <div>
            <h2 className="font-display font-bold text-foreground border-b pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
            <p className="text-muted-foreground">{summary}</p>
          </div>
        )}
        {experience.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground border-b pb-1 mb-3">WORK EXPERIENCE</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between"><h3 className="font-bold text-foreground">{exp.role}</h3><span className="text-xs text-muted-foreground">{exp.startDate} – {exp.endDate}</span></div>
                <p className="text-primary text-xs font-medium">{exp.company}</p>
                <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">{exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground border-b pb-1 mb-2">EDUCATION</h2>
            {education.map(edu => (<div key={edu.id} className="flex justify-between mb-1"><div><span className="font-semibold">{edu.degree}</span> – <span className="text-muted-foreground">{edu.institution}</span></div><span className="text-xs text-muted-foreground">{edu.year}</span></div>))}
          </div>
        )}
        {skills.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground border-b pb-1 mb-2">SKILLS</h2>
            <p className="text-muted-foreground">{skills.join(" • ")}</p>
          </div>
        )}
        {projects.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground border-b pb-1 mb-2">PROJECTS</h2>
            {projects.map(p => (<div key={p.id} className="mb-1"><span className="font-semibold">{p.name}</span><span className="text-muted-foreground"> – {p.description}</span></div>))}
          </div>
        )}
        {achievements.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground border-b pb-1 mb-2">ACHIEVEMENTS</h2>
            <ul className="list-disc list-inside text-muted-foreground">{achievements.map(a => <li key={a.id}>{a.description}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
