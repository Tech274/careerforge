import { ResumeData } from "@/types/resume";

export function NordicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-stone-50 text-stone-800 font-sans text-sm leading-relaxed p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extralight text-stone-900 tracking-tight">{personalInfo.name || "Your Name"}</h1>
        <p className="text-stone-400 text-lg font-light mt-1">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="w-12 h-0.5 bg-stone-300 mt-4"></div>
      </div>

      {summary && (
        <div className="mb-8">
          <p className="text-stone-500 text-base font-light leading-relaxed">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium mb-4">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-5 grid grid-cols-4 gap-4">
              <div className="col-span-1 text-xs text-stone-400 pt-0.5">
                {exp.startDate}<br />{exp.endDate}
              </div>
              <div className="col-span-3">
                <h3 className="font-medium text-stone-900">{exp.role}</h3>
                <p className="text-stone-400 text-xs">{exp.company}</p>
                <ul className="mt-1 text-stone-600 space-y-0.5 text-xs">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>— {b}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium mb-4">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="grid grid-cols-4 gap-4 mb-2">
              <div className="col-span-1 text-xs text-stone-400">{edu.year}</div>
              <div className="col-span-3">
                <span className="font-medium text-stone-900">{edu.degree}</span>
                <span className="text-stone-400"> — {edu.institution}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium mb-3">Skills</h2>
          <p className="text-stone-600 text-xs leading-relaxed">{skills.join(" · ")}</p>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium mb-3">Projects</h2>
          {projects.map(p => (
            <div key={p.id} className="mb-2">
              <span className="font-medium text-stone-900">{p.name}</span>
              <p className="text-xs text-stone-500">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {certifications && certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium mb-3">Certifications</h2>
          {certifications.map(c => (
            <div key={c.id} className="text-xs text-stone-600 mb-1">{c.name} — {c.issuer} ({c.year})</div>
          ))}
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-medium mb-3">Achievements</h2>
          <ul className="text-stone-600 text-xs space-y-1">
            {achievements.map(a => <li key={a.id}>{a.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
