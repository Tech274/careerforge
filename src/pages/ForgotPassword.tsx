import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else setSent(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {sent ? "Check your email for a reset link" : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <Mail className="h-12 w-12 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">
                We sent a reset link to <strong>{email}</strong>. Check your inbox and click the link to set a new password.
              </p>
              <Link to="/auth">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <Button type="submit" className="w-full brand-gradient border-0" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm text-primary hover:underline">Back to Login</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
