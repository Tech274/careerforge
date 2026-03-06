import { ResumeData } from "@/types/resume";

export function ElegantTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-serif text-sm leading-relaxed p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light tracking-[0.15em] text-gray-900 uppercase">{personalInfo.name || "Your Name"}</h1>
        <div className="w-16 h-px bg-gray-400 mx-auto my-3"></div>
        <p className="text-gray-500 tracking-widest text-sm uppercase">{personalInfo.title || "Job Title"}</p>
        <div className="flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-6 text-center max-w-lg mx-auto">
          <p className="text-gray-600 italic">{summary}</p>
        </div>
      )}

      <div className="w-full h-px bg-gray-200 my-6"></div>

      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between">
                <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                <span className="text-xs text-gray-400 italic">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="text-gray-500 text-xs italic">{exp.company}</p>
              <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-4">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between mb-1">
              <span><em>{edu.degree}</em> — {edu.institution}</span>
              <span className="text-xs text-gray-400">{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Skills</h2>
          <p className="text-center text-gray-600 text-xs">{skills.join("  ·  ")}</p>
        </div>
      )}

      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Certifications</h2>
          {certifications.map(c => (
            <p key={c.id} className="text-center text-xs text-gray-600"><em>{c.name}</em> — {c.issuer} ({c.year})</p>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Projects</h2>
          {projects.map(p => (
            <div key={p.id} className="text-center mb-2">
              <strong className="text-gray-800">{p.name}</strong>
              <p className="text-xs text-gray-500">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Achievements</h2>
          <ul className="text-center text-gray-600 text-xs space-y-1">
            {achievements.map(a => <li key={a.id}>{a.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
