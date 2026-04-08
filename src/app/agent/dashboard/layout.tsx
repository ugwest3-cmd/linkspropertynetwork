"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/agent/login");
        return;
      }

      try {
        const q = query(collection(db, "agents"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          auth.signOut();
          router.push("/agent/login");
          return;
        }

        const agentData = snap.docs[0].data();
        setStatus(agentData.status);
      } catch (err) {
        console.error("Error fetching agent status:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
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
            {status === "pending" ? <Clock size={48} color="var(--primary)" style={{ margin: "0 auto 1rem" }}/> : <ShieldAlert size={48} color="var(--danger)" style={{ margin: "0 auto 1rem" }}/>}
            <h2>{status === "pending" ? "Account Pending Review" : "Account Rejected"}</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>
              {status === "pending" 
                ? "Your agent application is currently under review. Our team will notify you via WhatsApp once approved." 
                : "Your agent application could not be approved at this time."}
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
