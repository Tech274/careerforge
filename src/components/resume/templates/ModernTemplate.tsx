import { ResumeData } from "@/types/resume";

export function ModernTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-card text-card-foreground p-8 font-body text-sm leading-relaxed">
      {/* Header */}
      <div className="border-b-2 border-primary pb-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">{personalInfo.name || "Your Name"}</h1>
        <p className="text-primary font-medium text-base">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-2">Summary</h2>
          <p className="text-muted-foreground">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-3">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-foreground">{exp.role}</h3>
                <span className="text-xs text-muted-foreground">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="text-muted-foreground text-xs">{exp.company}</p>
              <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-3">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between mb-1">
              <div>
                <span className="font-semibold text-foreground">{edu.degree}</span>
                <span className="text-muted-foreground"> – {edu.institution}</span>
              </div>
              <span className="text-xs text-muted-foreground">{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span key={s} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-2">Projects</h2>
          {projects.map(p => (
            <div key={p.id} className="mb-2">
              <span className="font-semibold text-foreground">{p.name}</span>
              <p className="text-muted-foreground text-xs">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-primary mb-2">Achievements</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            {achievements.map(a => <li key={a.id}>{a.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
