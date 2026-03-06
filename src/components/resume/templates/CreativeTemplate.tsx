import { ResumeData } from "@/types/resume";

export function CreativeTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-purple-600 text-white px-8 py-10">
        <h1 className="text-4xl font-black">{personalInfo.name || "Your Name"}</h1>
        <p className="text-rose-100 text-xl mt-1 font-light">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-rose-200">
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
          {personalInfo.location && <span>◎ {personalInfo.location}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {summary && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-1">About Me</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-3">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4 pl-4 border-l-3 border-rose-300">
                <h3 className="font-bold text-gray-900">{exp.role}</h3>
                <p className="text-rose-500 text-xs font-semibold">{exp.company} · {exp.startDate} – {exp.endDate}</p>
                <ul className="mt-1 text-gray-600 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i} className="flex gap-2"><span className="text-purple-400">→</span>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="bg-gradient-to-r from-rose-100 to-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-1">
                <strong>{edu.degree}</strong> <span className="text-gray-500">— {edu.institution} ({edu.year})</span>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">Projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2">
                <strong className="text-rose-600">{p.name}</strong>
                <p className="text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1">🏆 <strong>{c.name}</strong> — {c.issuer} ({c.year})</div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-purple-600 font-bold text-xs uppercase tracking-wider mb-2">Achievements</h2>
            <ul className="text-gray-600 text-xs space-y-0.5">
              {achievements.map(a => <li key={a.id}>⭐ {a.description}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
