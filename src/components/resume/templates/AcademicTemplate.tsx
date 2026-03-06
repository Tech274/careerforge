import { ResumeData } from "@/types/resume";

export function AcademicTemplate({ data }: { data: ResumeData }) {
  const { personalInfo, summary, experience, education, skills, certifications, projects, achievements } = data;

  return (
    <div className="bg-white text-gray-800 font-serif text-sm leading-relaxed p-8">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wide">{personalInfo.name || "Your Name"}</h1>
        <p className="text-gray-600 mt-1">{personalInfo.title || "Job Title"}</p>
        <div className="flex justify-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Education first for academic */}
      {education.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-3">Education</h2>
          {education.map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between">
                <strong>{edu.degree}</strong>
                <span className="text-xs text-gray-500">{edu.year}</span>
              </div>
              <p className="text-gray-600 italic text-xs">{edu.institution}</p>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="mb-5">
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-2">Research Interests / Summary</h2>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-3">Professional Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <strong>{exp.role}</strong>
                <span className="text-xs text-gray-500">{exp.startDate} – {exp.endDate}</span>
              </div>
              <p className="text-gray-600 italic text-xs">{exp.company}</p>
              <ul className="list-disc list-inside mt-1 text-gray-600 space-y-0.5">
                {exp.bullets.filter(b => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-2">Publications / Projects</h2>
          {projects.map(p => (
            <div key={p.id} className="mb-2">
              <strong>{p.name}</strong>
              {p.url && <span className="text-xs text-blue-600 ml-1">[{p.url}]</span>}
              <p className="text-xs text-gray-600">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-2">Technical Skills</h2>
          <p className="text-gray-700 text-xs">{skills.join(", ")}</p>
        </div>
      )}

      {certifications && certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-2">Certifications & Awards</h2>
          {certifications.map(c => (
            <div key={c.id} className="text-xs mb-1"><strong>{c.name}</strong>, {c.issuer} ({c.year})</div>
          ))}
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="font-bold text-sm uppercase border-b border-gray-400 pb-1 mb-2">Honors & Achievements</h2>
          <ul className="list-disc list-inside text-gray-600 text-xs space-y-0.5">
            {achievements.map(a => <li key={a.id}>{a.description}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
