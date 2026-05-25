"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, ShieldAlert } from "lucide-react";

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    const checkAuthAndAgent = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;
      
      if (!session) {
        setLoading(false);
        router.replace("/agent/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("agents")
          .select("status")
          .eq("uid", session.user.id)
          .single();

        if (!isMounted) return;

        if (error && error.code === 'PGRST116') {
          // Agent record doesn't exist yet (e.g. fresh Google Login)
          // Auto-approve and create it here
          const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Agent";
          const slug = fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString().slice(-4);
          
          const { error: insertError } = await supabase.from("agents").insert({
            uid: session.user.id,
            email: session.user.email,
            name: fullName,
            slug,
            status: "approved",
            plan: "free"
          });

          if (insertError) {
            console.error("Failed to auto-create agent:", insertError);
            if (isMounted) {
              setStatus("error");
              setLoading(false);
            }
            return;
          }

          if (isMounted) {
            setStatus("approved");
            setLoading(false);
          }
          return;
        } else if (error || !data) {
          await supabase.auth.signOut();
          if (isMounted) {
            setLoading(false);
            router.replace("/agent/login");
          }
          return;
        }

        if (isMounted) {
          setStatus(data.status || "pending");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Setup error:", err);
        if (isMounted) {
          setStatus("error");
          setLoading(false);
        }
      }
    };

    checkAuthAndAgent();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !window.location.pathname.includes("/agent/login")) {
        router.replace("/agent/login");
      }
    });

    const timeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
        setStatus((prev) => prev || "timeout");
      }
    }, 8000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (loading) {
    return <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center"}}>Loading Dashboard...</div>;
  }

  if (status !== "approved") {
    return (
      <>
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
            {status === "pending" ? (
              <Clock size={48} color="var(--primary)" style={{ margin: "0 auto 1rem" }}/>
            ) : status === "timeout" ? (
              <ShieldAlert size={48} color="var(--danger)" style={{ margin: "0 auto 1rem" }}/>
            ) : (
              <ShieldAlert size={48} color="var(--danger)" style={{ margin: "0 auto 1rem" }}/>
            )}
            
            <h2>
              {status === "pending" ? "Account Pending Review" : 
               status === "timeout" ? "Connection Timeout" : 
               "Account Rejected or Error"}
            </h2>
            
            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
              {status === "pending" 
                ? "Your agent application is currently under review. Our team will notify you via WhatsApp once approved." 
                : status === "timeout"
                ? "We couldn't connect to the server. Please check your internet or ad-blocker."
                : "Your agent application could not be approved at this time or an error occurred."}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: "var(--background-alt)", minHeight: "calc(100vh - 140px)" }}>
        {children}
      </div>
      <Footer />
    </>
  );
}
