import { ResumeData } from "@/types/resume";

export function InfographicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm leading-relaxed flex min-h-full">
      {/* Left sidebar */}
      <div className="w-1/3 bg-gradient-to-b from-orange-500 to-red-500 text-white p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold">{personalInfo.name || "Your Name"}</h1>
          <p className="text-orange-100 text-sm mt-1">{personalInfo.title || "Job Title"}</p>
        </div>

        <div className="space-y-1 text-xs text-orange-100">
          {personalInfo.email && <div>✉ {personalInfo.email}</div>}
          {personalInfo.phone && <div>☎ {personalInfo.phone}</div>}
          {personalInfo.location && <div>◎ {personalInfo.location}</div>}
          {personalInfo.linkedin && <div>🔗 {personalInfo.linkedin}</div>}
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-orange-100">Skills</h2>
            <div className="space-y-1.5">
              {skills.map(s => (
                <div key={s}>
                  <span className="text-xs">{s}</span>
                  <div className="w-full h-1.5 bg-white/20 rounded-full mt-0.5">
                    <div className="h-full bg-white/80 rounded-full" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-orange-100">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-2 text-xs">
                <strong>{edu.degree}</strong>
                <p className="text-orange-200">{edu.institution}</p>
                <p className="text-orange-300">{edu.year}</p>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-orange-100">Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1 text-orange-100">
                <strong>{c.name}</strong><br /><span className="text-orange-200">{c.issuer} ({c.year})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="w-2/3 p-6 space-y-5">
        {summary && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">Profile</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-3">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4 flex gap-3">
                <div className="w-1 rounded-full bg-gradient-to-b from-orange-400 to-red-400 shrink-0"></div>
                <div>
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <p className="text-orange-500 text-xs">{exp.company} · {exp.startDate} – {exp.endDate}</p>
                  <ul className="list-disc list-inside mt-1 text-gray-600 text-xs space-y-0.5">
                    {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-2">Projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2">
                <strong className="text-orange-700">{p.name}</strong>
                <p className="text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-2">Achievements</h2>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map(a => (
                <div key={a.id} className="bg-orange-50 rounded p-2 text-xs text-gray-700 border border-orange-100">
                  🏆 {a.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
