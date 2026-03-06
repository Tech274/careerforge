import { AppLayout } from "@/components/layout/AppLayout";
import { useResume } from "@/contexts/ResumeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { QrCode, Download, Copy, Check, ExternalLink } from "lucide-react";
export default function QRBusinessCard() {
  const { resumeData } = useResume();
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const name = resumeData?.personalInfo?.name || "Your Name";
  const title = resumeData?.personalInfo?.title || "Professional";
  const email = resumeData?.personalInfo?.email || user?.email || "";
  const phone = resumeData?.personalInfo?.phone || "";
  const website = resumeData?.personalInfo?.website || "";
  const skills = (resumeData?.skills || []).slice(0, 6);

  // Build profile URL (using email as username fallback)
  const username = email.split("@")[0] || "profile";
  const profileUrl = `${window.location.origin}/p/${username}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Profile URL copied!");
  };

  const downloadQR = () => {
    const svg = document.querySelector("#qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s/g, "_")}_QR.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("QR code downloaded!");
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff" });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s/g, "_")}_BusinessCard.png`;
      a.click();
      toast.success("Business card downloaded!");
    } catch {
      toast.error("Download failed. Try again.");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <QrCode className="h-8 w-8 text-primary" />
            QR Code & Business Card
          </h1>
          <p className="text-muted-foreground mt-1">Generate a QR code linking to your profile and a downloadable digital business card</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" /> QR Code
              </CardTitle>
              <CardDescription>Scan to open your CareerForge public profile</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-xl border shadow-sm">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={profileUrl}
                  size={200}
                  level="H"
                  includeMargin
                  imageSettings={{
                    src: "",
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                />
              </div>
              <div className="w-full">
                <Label className="text-xs text-muted-foreground">Profile URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={profileUrl} readOnly className="text-xs font-mono" />
                  <Button size="icon" variant="outline" onClick={copyUrl}>
                    {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="outline" asChild>
                    <a href={profileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <Button onClick={downloadQR} variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" /> Download QR Code (SVG)
              </Button>
            </CardContent>
          </Card>

          {/* Business Card Preview */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-lg">Digital Business Card</CardTitle>
              <CardDescription>A professional card with your QR code — perfect for printing or sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Card Preview */}
              <div ref={cardRef} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1.75", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                <div className="absolute inset-0 p-5 flex items-stretch text-white">
                  {/* Left: Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-70 uppercase tracking-wider mb-1">Career Forge</p>
                      <h2 className="text-xl font-bold font-display leading-tight">{name}</h2>
                      <p className="text-sm opacity-80 mt-1">{title}</p>
                    </div>
                    <div className="space-y-1">
                      {email && <p className="text-xs opacity-70">{email}</p>}
                      {phone && <p className="text-xs opacity-70">{phone}</p>}
                      {website && <p className="text-xs opacity-70">{website}</p>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skills.slice(0, 4).map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/20">{s}</span>
                      ))}
                    </div>
                  </div>
                  {/* Right: QR */}
                  <div className="flex items-center pl-4">
                    <div className="bg-white p-2 rounded-lg">
                      <QRCodeSVG value={profileUrl} size={80} level="H" includeMargin={false} />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={downloadCard} className="brand-gradient border-0 w-full gap-2">
                <Download className="h-4 w-4" /> Download Business Card (PNG)
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                💡 Print on the back of your resume for in-person interviews
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-foreground mb-3">How to use your QR code</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-lg">📄</span>
                <div><p className="font-medium text-foreground">On your resume</p><p>Add to footer or sidebar for a digital touch</p></div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">🤝</span>
                <div><p className="font-medium text-foreground">At networking events</p><p>Let recruiters scan and instantly see your profile</p></div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg">📧</span>
                <div><p className="font-medium text-foreground">In email signatures</p><p>Add the profile URL as a hyperlink</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
