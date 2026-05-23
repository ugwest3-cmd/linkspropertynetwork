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
  const [debugLog, setDebugLog] = useState<string[]>(["Mounting..."]);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    setDebugLog(l => [...l, "useEffect running"]);
    
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setDebugLog(l => [...l, `onAuthStateChanged fired, user: ${user ? user.uid : "null"}`]);
      
      if (!user) {
        setLoading(false);
        router.replace("/agent/login");
        return;
      }

      try {
        setDebugLog(l => [...l, "Creating query..."]);
        const q = query(collection(db, "agents"), where("uid", "==", user.uid));
        
        setDebugLog(l => [...l, "Attaching onSnapshot..."]);
        const unsubSnap = onSnapshot(q, 
          async (snap) => {
            setDebugLog(l => [...l, `onSnapshot NEXT fired, empty: ${snap.empty}`]);
            if (!isMounted) {
              unsubSnap();
              return;
            }

            if (snap.empty) {
              await auth.signOut();
              unsubSnap();
              setLoading(false);
              router.replace("/agent/login");
              return;
            }

            const agentData = snap.docs[0].data();
            setStatus(agentData.status || "pending");
            setLoading(false);
            unsubSnap();
          },
          (err) => {
            console.error("Error fetching agent status:", err);
            setDebugLog(l => [...l, `onSnapshot ERROR: ${err.message}`]);
            if (isMounted) {
              setStatus("error");
              setLoading(false);
            }
            unsubSnap();
          }
        );
      } catch (err: any) {
        console.error("Setup error:", err);
        setDebugLog(l => [...l, `TRY CATCH ERROR: ${err.message}`]);
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
    return (
      <div style={{ display:"flex", flexDirection:"column", height:"100vh", alignItems:"center", justifyContent:"center"}}>
        <div>Loading Dashboard...</div>
        <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "gray", textAlign: "left" }}>
          {debugLog.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      </div>
    );
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
