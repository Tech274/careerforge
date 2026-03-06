import { ResumeData } from "@/types/resume";

export function CompactTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-xs leading-snug p-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-300 pb-2 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{personalInfo.name || "Your Name"}</h1>
          <p className="text-gray-500 text-sm">{personalInfo.title || "Job Title"}</p>
        </div>
        <div className="text-right text-gray-500 text-[10px]">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main Content - 2 cols */}
        <div className="col-span-2 space-y-3">
          {summary && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Summary</h2>
              <p className="text-gray-600">{summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-2">Experience</h2>
              {experience.map(exp => (
                <div key={exp.id} className="mb-2">
                  <div className="flex justify-between">
                    <strong className="text-gray-900">{exp.role}</strong>
                    <span className="text-gray-400 text-[10px]">{exp.startDate}–{exp.endDate}</span>
                  </div>
                  <p className="text-gray-500 text-[10px]">{exp.company}</p>
                  <ul className="list-disc list-inside text-gray-600 mt-0.5 space-y-px">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {projects && projects.length > 0 && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Projects</h2>
              {projects.map(p => (
                <div key={p.id} className="mb-1">
                  <strong>{p.name}</strong> <span className="text-gray-500">— {p.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {skills.length > 0 && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Skills</h2>
              <div className="flex flex-wrap gap-1">
                {skills.map(s => (
                  <span key={s} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px]">{s}</span>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Education</h2>
              {education.map(edu => (
                <div key={edu.id} className="mb-1">
                  <strong className="text-gray-800">{edu.degree}</strong>
                  <p className="text-gray-500 text-[10px]">{edu.institution} ({edu.year})</p>
                </div>
              ))}
            </div>
          )}

          {certifications && certifications.length > 0 && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Certifications</h2>
              {certifications.map(c => (
                <div key={c.id} className="text-[10px] mb-0.5">
                  <strong>{c.name}</strong> <span className="text-gray-400">({c.year})</span>
                </div>
              ))}
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div>
              <h2 className="font-bold text-[10px] uppercase tracking-wider text-gray-500 mb-1">Achievements</h2>
              <ul className="text-gray-600 space-y-px">
                {achievements.map(a => <li key={a.id}>• {a.description}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
