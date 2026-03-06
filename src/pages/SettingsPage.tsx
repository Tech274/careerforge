import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth, PLANS, PlanKey } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Settings, CreditCard, LogOut, Check, Loader2, Crown, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const planFeatures: Record<PlanKey, string[]> = {
  free: ["1 resume", "2 templates", "Limited AI rewriting", "Basic ATS checker"],
  pro: ["Unlimited resumes", "All templates", "AI rewriting (all modes)", "ATS checker", "LinkedIn optimization"],
  premium: ["Everything in Pro", "Application tracker", "Advanced AI features", "Priority support"],
};

export default function SettingsPage() {
  const { user, plan, subscriptionEnd, signOut, refreshSubscription } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const handleCheckout = async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("No checkout URL");
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Could not open billing portal");
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Settings
          </h1>
        </motion.div>

        {/* Account */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
              <Badge variant="secondary" className="capitalize">{plan} Plan</Badge>
            </div>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground">
                Renews on {new Date(subscriptionEnd).toLocaleDateString()}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              {plan !== "free" && (
                <Button variant="outline" size="sm" onClick={handlePortal} className="gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" /> Manage Subscription
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={refreshSubscription} className="gap-1.5">
                Refresh Status
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-destructive">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-foreground">Dark Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark themes</p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" /> Subscription Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => {
              const isCurrent = plan === key;
              return (
                <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={`shadow-card relative ${isCurrent ? "border-primary ring-1 ring-primary" : ""}`}>
                    {isCurrent && (
                      <Badge className="absolute -top-2.5 left-4 brand-gradient border-0">Current Plan</Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="font-display">{p.name}</CardTitle>
                      <CardDescription>
                        {p.price === 0 ? "Free" : `$${p.price}/mo`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ul className="space-y-2">
                        {planFeatures[key].map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-accent shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      {!isCurrent && p.priceId && (
                        <Button
                          onClick={() => handleCheckout(p.priceId!)}
                          disabled={checkoutLoading !== null}
                          className="w-full brand-gradient border-0 mt-2"
                        >
                          {checkoutLoading === p.priceId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            `Upgrade to ${p.name}`
                          )}
                        </Button>
                      )}
                      {isCurrent && (
                        <Button disabled variant="outline" className="w-full mt-2">
                          Current Plan
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
