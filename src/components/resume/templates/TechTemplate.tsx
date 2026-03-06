import { ResumeData } from "@/types/resume";

export function TechTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-gray-950 text-gray-200 font-mono text-sm leading-relaxed">
      {/* Header */}
      <div className="px-8 py-8 border-b border-emerald-500/30">
        <p className="text-emerald-400 text-xs mb-1">// developer profile</p>
        <h1 className="text-2xl font-bold text-emerald-400">{personalInfo.name || "Your Name"}</h1>
        <p className="text-gray-400 mt-1">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
          {personalInfo.email && <span className="text-cyan-400">{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {summary && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-2">{">"} README.md</h2>
            <p className="text-gray-400 pl-4 border-l-2 border-gray-700">{summary}</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-2">{">"} tech_stack</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-3">{">"} work_history</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4 pl-4 border-l border-gray-700">
                <h3 className="font-bold text-cyan-400">{exp.role}</h3>
                <p className="text-gray-500 text-xs">{exp.company} | {exp.startDate} – {exp.endDate}</p>
                <ul className="mt-1 text-gray-400 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">$</span>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-2">{">"} projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2 pl-4 border-l border-gray-700">
                <strong className="text-cyan-400">{p.name}</strong>
                {p.url && <span className="text-gray-600 text-xs ml-2">{p.url}</span>}
                <p className="text-xs text-gray-500">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-2">{">"} education</h2>
            {education.map(edu => (
              <div key={edu.id} className="text-xs mb-1 pl-4">
                <span className="text-gray-300">{edu.degree}</span> <span className="text-gray-600">@ {edu.institution} ({edu.year})</span>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-2">{">"} certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1 pl-4 text-gray-400">[✓] {c.name} — {c.issuer} ({c.year})</div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-emerald-400 text-xs font-bold mb-2">{">"} achievements</h2>
            <ul className="text-gray-400 text-xs space-y-0.5 pl-4">
              {achievements.map(a => <li key={a.id}>★ {a.description}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
