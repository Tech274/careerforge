import { ResumeData } from "@/types/resume";

export function TimelineTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm leading-relaxed p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-teal-700">{personalInfo.name || "Your Name"}</h1>
        <p className="text-teal-500 text-lg">{personalInfo.title || "Job Title"}</p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.location && <span>• {personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-6 pl-6 border-l-2 border-teal-200">
          <p className="text-gray-600">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-4">Experience</h2>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-teal-200"></div>
            {experience.map(exp => (
              <div key={exp.id} className="mb-5 relative">
                <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-teal-500 border-2 border-white"></div>
                <div className="flex justify-between">
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{exp.startDate} – {exp.endDate}</span>
                </div>
                <p className="text-teal-600 text-xs">{exp.company}</p>
                <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                  {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-4">Education</h2>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-teal-200"></div>
            {education.map(edu => (
              <div key={edu.id} className="mb-3 relative">
                <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-teal-400 border-2 border-white"></div>
                <strong>{edu.degree}</strong> <span className="text-gray-500">— {edu.institution}</span>
                <span className="text-xs text-teal-600 ml-2">({edu.year})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(s => (
              <span key={s} className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">Projects</h2>
          {projects.map(p => (
            <div key={p.id} className="mb-2">
              <strong className="text-teal-700">{p.name}</strong>
              <p className="text-xs text-gray-600">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {certifications && certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">Certifications</h2>
          {certifications.map(c => (
            <div key={c.id} className="text-xs mb-1"><strong>{c.name}</strong> — {c.issuer} ({c.year})</div>
          ))}
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">Achievements</h2>
          <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
            {achievements.map(a => <li key={a.id}>{a.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
