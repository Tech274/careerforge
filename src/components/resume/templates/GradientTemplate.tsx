import { ResumeData } from "@/types/resume";

export function GradientTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm leading-relaxed">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white px-8 py-8">
        <h1 className="text-3xl font-bold">{personalInfo.name || "Your Name"}</h1>
        <p className="text-pink-100 text-lg font-light mt-1">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/70">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {summary && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-2">Summary</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-3">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <span className="text-xs text-gray-400">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-fuchsia-500 text-xs font-semibold">{exp.company}</p>
                <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="bg-gradient-to-r from-violet-100 to-pink-100 text-violet-700 px-2.5 py-0.5 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-2">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-1">
                <strong>{edu.degree}</strong> <span className="text-gray-500">— {edu.institution} ({edu.year})</span>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-2">Projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2">
                <strong className="text-fuchsia-600">{p.name}</strong>
                <p className="text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-2">Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1"><strong>{c.name}</strong> — {c.issuer} ({c.year})</div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 font-bold text-xs uppercase tracking-wider mb-2">Achievements</h2>
            <ul className="text-gray-600 text-xs space-y-0.5">
              {achievements.map(a => <li key={a.id}>✨ {a.description}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
