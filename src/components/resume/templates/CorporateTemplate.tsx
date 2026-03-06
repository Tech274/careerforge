import { ResumeData } from "@/types/resume";

export function CorporateTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, projects, achievements } = data;

  return (
    <div className="bg-card text-card-foreground font-body text-sm leading-relaxed flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-foreground text-background p-6 space-y-5">
        <div>
          <h1 className="font-display text-xl font-bold">{personalInfo.name || "Your Name"}</h1>
          <p className="text-xs opacity-75 mt-1">{personalInfo.title}</p>
        </div>
        <div className="space-y-1 text-xs opacity-80">
          {personalInfo.email && <p>{personalInfo.email}</p>}
          {personalInfo.phone && <p>{personalInfo.phone}</p>}
          {personalInfo.location && <p>{personalInfo.location}</p>}
          {personalInfo.linkedin && <p>{personalInfo.linkedin}</p>}
        </div>
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 opacity-60">Skills</h2>
            <div className="space-y-1">{skills.map(s => <p key={s} className="text-xs">{s}</p>)}</div>
          </div>
        )}
        {education.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 opacity-60">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-2">
                <p className="text-xs font-semibold">{edu.degree}</p>
                <p className="text-xs opacity-75">{edu.institution}</p>
                <p className="text-xs opacity-60">{edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-6 space-y-5">
        {summary && (
          <div>
            <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-2">Profile</h2>
            <p className="text-muted-foreground">{summary}</p>
          </div>
        )}
        {experience.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-3">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4 border-l-2 border-primary pl-3">
                <div className="flex justify-between"><h3 className="font-bold text-foreground text-sm">{exp.role}</h3><span className="text-xs text-muted-foreground">{exp.startDate} – {exp.endDate}</span></div>
                <p className="text-primary text-xs font-medium">{exp.company}</p>
                <ul className="list-disc list-inside mt-1 text-muted-foreground text-xs space-y-0.5">{exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
        {projects.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-2">Projects</h2>
            {projects.map(p => (<div key={p.id} className="mb-1"><span className="font-semibold text-sm">{p.name}</span><p className="text-muted-foreground text-xs">{p.description}</p></div>))}
          </div>
        )}
        {achievements.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-foreground text-sm uppercase tracking-wider mb-2">Achievements</h2>
            <ul className="list-disc list-inside text-muted-foreground text-xs">{achievements.map(a => <li key={a.id}>{a.description}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
