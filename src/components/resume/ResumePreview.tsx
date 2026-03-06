import { useResume } from "@/contexts/ResumeContext";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ProfessionalTemplate } from "./templates/ProfessionalTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";
import { CorporateTemplate } from "./templates/CorporateTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { ElegantTemplate } from "./templates/ElegantTemplate";
import { TechTemplate } from "./templates/TechTemplate";
import { CompactTemplate } from "./templates/CompactTemplate";
import { BoldTemplate } from "./templates/BoldTemplate";
import { AcademicTemplate } from "./templates/AcademicTemplate";
import { TimelineTemplate } from "./templates/TimelineTemplate";
import { InfographicTemplate } from "./templates/InfographicTemplate";
import { SimpleTwoColumnTemplate } from "./templates/SimpleTwoColumnTemplate";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { GradientTemplate } from "./templates/GradientTemplate";
import { NordicTemplate } from "./templates/NordicTemplate";
import { TemplateName, ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const templates: Record<TemplateName, React.FC<{ data: any }>> = {
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimalist: MinimalistTemplate,
  corporate: CorporateTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  elegant: ElegantTemplate,
  tech: TechTemplate,
  compact: CompactTemplate,
  bold: BoldTemplate,
  academic: AcademicTemplate,
  timeline: TimelineTemplate,
  infographic: InfographicTemplate,
  "simple-two-column": SimpleTwoColumnTemplate,
  classic: ClassicTemplate,
  gradient: GradientTemplate,
  nordic: NordicTemplate,
};

function buildDocx(data: ResumeData): Document {
  const sections: Paragraph[] = [];

  // Name & Title
  if (data.personalInfo.name) {
    sections.push(new Paragraph({ children: [new TextRun({ text: data.personalInfo.name, bold: true, size: 32 })], alignment: AlignmentType.CENTER }));
  }
  if (data.personalInfo.title) {
    sections.push(new Paragraph({ children: [new TextRun({ text: data.personalInfo.title, size: 24, color: "666666" })], alignment: AlignmentType.CENTER }));
  }

  // Contact line
  const contactParts = [data.personalInfo.email, data.personalInfo.phone, data.personalInfo.location].filter(Boolean);
  if (contactParts.length > 0) {
    sections.push(new Paragraph({ children: [new TextRun({ text: contactParts.join(" | "), size: 20, color: "888888" })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
  }

  // Summary
  if (data.summary) {
    sections.push(new Paragraph({ text: "SUMMARY", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: 22 })], spacing: { after: 200 } }));
  }

  // Experience
  if (data.experience.length > 0) {
    sections.push(new Paragraph({ text: "EXPERIENCE", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    data.experience.forEach(exp => {
      sections.push(new Paragraph({ children: [
        new TextRun({ text: exp.role, bold: true, size: 24 }),
        new TextRun({ text: ` at ${exp.company}`, size: 24 }),
      ]}));
      sections.push(new Paragraph({ children: [new TextRun({ text: `${exp.startDate} - ${exp.endDate}`, size: 20, color: "888888" })], spacing: { after: 100 } }));
      exp.bullets.filter(b => b.trim()).forEach(bullet => {
        sections.push(new Paragraph({ children: [new TextRun({ text: `• ${bullet}`, size: 22 })], indent: { left: 360 } }));
      });
      sections.push(new Paragraph({ spacing: { after: 150 } }));
    });
  }

  // Education
  if (data.education.length > 0) {
    sections.push(new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    data.education.forEach(edu => {
      sections.push(new Paragraph({ children: [
        new TextRun({ text: edu.degree, bold: true, size: 22 }),
        new TextRun({ text: ` — ${edu.institution}`, size: 22 }),
        new TextRun({ text: ` (${edu.year})`, size: 20, color: "888888" }),
      ]}));
    });
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push(new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    sections.push(new Paragraph({ children: [new TextRun({ text: data.skills.join(", "), size: 22 })]}));
  }

  // Certifications
  if (data.certifications?.length > 0) {
    sections.push(new Paragraph({ text: "CERTIFICATIONS", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    data.certifications.forEach(cert => {
      sections.push(new Paragraph({ children: [
        new TextRun({ text: cert.name, bold: true, size: 22 }),
        new TextRun({ text: ` — ${cert.issuer} (${cert.year})`, size: 20, color: "888888" }),
      ]}));
    });
  }

  // Projects
  if (data.projects?.length > 0) {
    sections.push(new Paragraph({ text: "PROJECTS", heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    data.projects.forEach(proj => {
      sections.push(new Paragraph({ children: [
        new TextRun({ text: proj.name, bold: true, size: 22 }),
        proj.url ? new TextRun({ text: ` — ${proj.url}`, size: 20, color: "888888" }) : new TextRun(""),
      ]}));
      if (proj.description) {
        sections.push(new Paragraph({ children: [new TextRun({ text: proj.description, size: 22 })], indent: { left: 360 } }));
      }
    });
  }

  return new Document({ sections: [{ children: sections }] });
}

export function ResumePreview() {
  const { resumeData, template } = useResume();
  const Template = templates[template];
  const resumeRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportPDF = async () => {
    if (!resumeRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const a4Width = 210;
      const a4Height = 297;
      const imgWidth = a4Width;
      const imgHeight = (canvas.height * a4Width) / canvas.width;

      // Multi-page support for content taller than A4
      let position = 0;
      let remainingHeight = imgHeight;

      while (remainingHeight > 0) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
        remainingHeight -= a4Height;
        position += a4Height;
      }

      const name = resumeData.personalInfo.name || "resume";
      pdf.save(`${name.replace(/\s+/g, "_")}_resume.pdf`);
      toast.success("A4 PDF downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const exportDOCX = async () => {
    setExporting(true);
    try {
      const doc = buildDocx(resumeData);
      const blob = await Packer.toBlob(doc);
      const name = resumeData.personalInfo.name || "resume";
      saveAs(blob, `${name.replace(/\s+/g, "_")}_resume.docx`);
      toast.success("DOCX downloaded!");
    } catch (e) {
      console.error(e);
      toast.error("DOCX export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={exporting} variant="outline" className="gap-2">
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Generating..." : "Download"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportPDF} className="gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportDOCX} className="gap-2">
              <FileText className="h-4 w-4" /> Download DOCX
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="bg-muted rounded-xl p-4 h-full overflow-auto">
        <div
          ref={resumeRef}
          className="bg-card rounded-lg shadow-elevated overflow-hidden max-w-[210mm] mx-auto"
          style={{ minHeight: "297mm" }}
        >
          <Template data={resumeData} />
        </div>
      </div>
    </div>
  );
}
