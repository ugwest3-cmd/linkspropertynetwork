"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Clock, ShieldAlert } from "lucide-react";

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      
      if (!user) {
        setLoading(false);
        router.replace("/agent/login");
        return;
      }

      try {
        // Use standard HTTP REST API to completely bypass Firebase SDK WebSocket/Long-Polling bugs
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/linkspropertynetwork-295bf/databases/(default)/documents:runQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "agents" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "uid" },
                  op: "EQUAL",
                  value: { stringValue: user.uid }
                }
              },
              limit: 1
            }
          })
        });

        if (!res.ok) {
          throw new Error("Failed to fetch from REST API");
        }

        const data = await res.json();
        
        if (!isMounted) return;

        // Firestore REST API returns an array of results. If no match, it returns an array with one item having only `readTime`
        if (!data || data.length === 0 || !data[0].document) {
          await auth.signOut();
          setLoading(false);
          router.replace("/agent/login");
          return;
        }

        // Extract fields from Firestore REST API format
        const fields = data[0].document.fields;
        const statusVal = fields.status?.stringValue || "pending";
        
        setStatus(statusVal);
        setLoading(false);
      } catch (err: any) {
        console.error("Setup error:", err);
        if (isMounted) {
          setStatus("error");
          setLoading(false);
        }
      }
    });

    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
        setStatus("timeout");
      }
    }, 8000);

    return () => {
      isMounted = false;
      unsub();
      clearTimeout(timeout);
    };
  }, [router, loading]);

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
