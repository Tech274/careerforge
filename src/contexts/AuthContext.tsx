import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// Stripe product/price mapping
export const PLANS = {
  free: { name: "Free", price: 0, priceId: null, productId: null },
  pro: { name: "Pro", price: 14.99, priceId: "price_1T7Pw6FDPLxxcPPNhBk1IbxE", productId: "prod_U5b8XJ8Ob5ja1K" },
  premium: { name: "Premium", price: 29.99, priceId: "price_1T7PwYFDPLxxcPPNCmhboQdA", productId: "prod_U5b8GG2z9v2uUP" },
} as const;

export type PlanKey = keyof typeof PLANS;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  plan: PlanKey;
  subscriptionEnd: string | null;
  isAdmin: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<PlanKey>("free");
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchIsAdmin = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .single();
      setIsAdmin(data?.is_admin === true);
    } catch {
      setIsAdmin(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error || !data) return;
      if (data.subscribed && data.product_id) {
        if (data.product_id === PLANS.premium.productId) setPlan("premium");
        else if (data.product_id === PLANS.pro.productId) setPlan("pro");
        else setPlan("free");
        setSubscriptionEnd(data.subscription_end || null);
      } else {
        setPlan("free");
        setSubscriptionEnd(null);
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => {
          refreshSubscription();
          fetchIsAdmin(session.user.id);
        }, 0);
      } else {
        setPlan("free");
        setSubscriptionEnd(null);
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshSubscription();
        fetchIsAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPlan("free");
    setSubscriptionEnd(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, plan, subscriptionEnd, isAdmin, signUp, signIn, signOut, refreshSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
