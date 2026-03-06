import { ResumeData } from "@/types/resume";

export function ExecutiveTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-900 font-serif text-sm leading-relaxed">
      {/* Header */}
      <div className="bg-gray-900 text-white px-10 py-8 text-center">
        <h1 className="text-3xl font-bold tracking-wide uppercase">{personalInfo.name || "Your Name"}</h1>
        <p className="text-amber-400 text-lg mt-1 tracking-widest uppercase">{personalInfo.title || "Job Title"}</p>
        <div className="flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-300">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      <div className="px-10 py-8 space-y-6">
        {summary && (
          <div className="border-l-4 border-amber-500 pl-4">
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold mb-2">Executive Summary</h2>
            <p className="text-gray-700 italic">{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold border-b-2 border-gray-200 pb-1 mb-4">Professional Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <span className="text-xs text-gray-500">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-amber-700 text-xs font-semibold">{exp.company}</p>
                <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold border-b-2 border-gray-200 pb-1 mb-3">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between mb-1">
                <span><strong>{edu.degree}</strong> — {edu.institution}</span>
                <span className="text-xs text-gray-500">{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold border-b-2 border-gray-200 pb-1 mb-3">Core Competencies</h2>
            <div className="grid grid-cols-3 gap-1 text-xs text-gray-700">
              {skills.map(s => <span key={s}>• {s}</span>)}
            </div>
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold border-b-2 border-gray-200 pb-1 mb-3">Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1"><strong>{c.name}</strong> — {c.issuer} ({c.year})</div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold border-b-2 border-gray-200 pb-1 mb-3">Key Projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2">
                <strong>{p.name}</strong>
                <p className="text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-amber-700 font-bold border-b-2 border-gray-200 pb-1 mb-3">Achievements</h2>
            <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
              {achievements.map(a => <li key={a.id}>{a.description}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
