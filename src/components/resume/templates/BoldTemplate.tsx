import { ResumeData } from "@/types/resume";

export function BoldTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight">{personalInfo.name || "Your Name"}</h1>
        <p className="text-blue-200 text-xl font-light mt-1">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-blue-100">
          {personalInfo.email && <span className="bg-white/10 px-3 py-1 rounded-full">{personalInfo.email}</span>}
          {personalInfo.phone && <span className="bg-white/10 px-3 py-1 rounded-full">{personalInfo.phone}</span>}
          {personalInfo.location && <span className="bg-white/10 px-3 py-1 rounded-full">{personalInfo.location}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {summary && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            <p className="text-gray-700">{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-indigo-600 font-extrabold text-lg uppercase mb-3">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="font-bold text-gray-900 text-base">{exp.role}</h3>
                </div>
                <p className="text-indigo-500 text-xs font-semibold ml-5">{exp.company} | {exp.startDate} – {exp.endDate}</p>
                <ul className="list-disc list-inside mt-1 ml-5 text-gray-600 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-indigo-600 font-extrabold text-lg uppercase mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-indigo-600 font-extrabold text-lg uppercase mb-2">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-1">
                <strong>{edu.degree}</strong> <span className="text-gray-500">— {edu.institution} ({edu.year})</span>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-indigo-600 font-extrabold text-lg uppercase mb-2">Projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2">
                <strong className="text-indigo-700">{p.name}</strong>
                <p className="text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-indigo-600 font-extrabold text-lg uppercase mb-2">Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1"><strong>{c.name}</strong> — {c.issuer} ({c.year})</div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-indigo-600 font-extrabold text-lg uppercase mb-2">Achievements</h2>
            <ul className="text-gray-600 text-xs space-y-0.5">
              {achievements.map(a => <li key={a.id}>🏅 {a.description}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
