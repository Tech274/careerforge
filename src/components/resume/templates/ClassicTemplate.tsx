import { ResumeData } from "@/types/resume";

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-serif text-sm leading-relaxed p-8">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-3 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide">{personalInfo.name || "Your Name"}</h1>
        <div className="flex justify-center flex-wrap gap-2 mt-2 text-xs text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-2">Objective</h2>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-3">Work Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <strong>{exp.role}</strong>, <em className="text-gray-600">{exp.company}</em>
                </div>
                <span className="text-xs text-gray-500">{exp.startDate} – {exp.endDate}</span>
              </div>
              <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-2">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="flex justify-between mb-1">
              <span><strong>{edu.degree}</strong>, {edu.institution}</span>
              <span className="text-xs text-gray-500">{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-2">Skills</h2>
          <p className="text-gray-700">{skills.join(", ")}</p>
        </div>
      )}

      {certifications && certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-2">Certifications</h2>
          {certifications.map(c => (
            <div key={c.id} className="text-xs mb-1"><strong>{c.name}</strong>, {c.issuer} — {c.year}</div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-2">Projects</h2>
          {projects.map(p => (
            <div key={p.id} className="mb-1">
              <strong>{p.name}</strong> — <span className="text-gray-600 text-xs">{p.description}</span>
            </div>
          ))}
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="font-bold uppercase text-sm tracking-wide border-b border-gray-200 pb-1 mb-2">Achievements</h2>
          <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
            {achievements.map(a => <li key={a.id}>{a.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
