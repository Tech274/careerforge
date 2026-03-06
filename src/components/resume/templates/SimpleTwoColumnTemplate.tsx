import { ResumeData } from "@/types/resume";

export function SimpleTwoColumnTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm leading-relaxed flex min-h-full">
      {/* Left sidebar */}
      <div className="w-1/3 bg-slate-800 text-white p-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold">{personalInfo.name || "Your Name"}</h1>
          <p className="text-slate-300 text-sm">{personalInfo.title || "Job Title"}</p>
        </div>

        <div className="space-y-1 text-xs text-slate-300">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
          {personalInfo.portfolio && <div>{personalInfo.portfolio}</div>}
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-slate-400">Skills</h2>
            <ul className="space-y-1 text-xs">
              {skills.map(s => <li key={s} className="text-slate-200">▸ {s}</li>)}
            </ul>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-slate-400">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-2 text-xs">
                <strong className="text-white">{edu.degree}</strong>
                <p className="text-slate-400">{edu.institution}</p>
                <p className="text-slate-500">{edu.year}</p>
              </div>
            ))}
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-slate-400">Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} className="text-xs mb-1 text-slate-300"><strong>{c.name}</strong> ({c.year})</div>
            ))}
          </div>
        )}

        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold mb-2 text-slate-400">Achievements</h2>
            <ul className="text-xs text-slate-300 space-y-1">
              {achievements.map(a => <li key={a.id}>✦ {a.description}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="w-2/3 p-6 space-y-5">
        {summary && (
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Profile</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <span className="text-xs text-gray-400">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">{exp.company}</p>
                <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">Projects</h2>
            {projects.map(p => (
              <div key={p.id} className="mb-2">
                <strong>{p.name}</strong>
                <p className="text-xs text-gray-600">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
