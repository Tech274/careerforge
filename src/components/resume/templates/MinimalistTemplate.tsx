import { ResumeData } from "@/types/resume";

export function MinimalistTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, projects, achievements } = data;

  return (
    <div className="bg-card text-card-foreground p-10 font-body text-sm leading-relaxed max-w-[600px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-light tracking-tight text-foreground">{personalInfo.name || "Your Name"}</h1>
        <p className="text-muted-foreground mt-1">{personalInfo.title}</p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && <p className="text-muted-foreground text-center mb-8 italic">{summary}</p>}

      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <p className="font-medium text-foreground">{exp.role} <span className="text-muted-foreground font-normal">at {exp.company}</span></p>
              <p className="text-xs text-muted-foreground">{exp.startDate} – {exp.endDate}</p>
              <ul className="mt-1 text-muted-foreground space-y-0.5">{exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>— {b}</li>)}</ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 text-center">Education</h2>
          {education.map(edu => (<p key={edu.id} className="text-center mb-1"><span className="font-medium text-foreground">{edu.degree}</span> · {edu.institution} · {edu.year}</p>))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 text-center">Skills</h2>
          <p className="text-center text-muted-foreground">{skills.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
