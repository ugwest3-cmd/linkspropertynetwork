"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LogIn } from "lucide-react";
import styles from "@/app/admin/login/login.module.css";

export default function AgentLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back!");
      router.push("/agent/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/agent/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google");
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card} style={{ maxWidth: "450px" }}>
          <div className={styles.iconBg} style={{ marginBottom: "1rem" }}>
            <LogIn size={28} />
          </div>
          <h1 className={styles.title}>Agent Login</h1>
          <p className={styles.subtitle} style={{ marginBottom: "2rem" }}>Access your dashboard and listings.</p>

          <button 
            onClick={handleGoogleSignIn} 
            className="btn" 
            style={{ width: "100%", padding: "0.85rem", background: "white", color: "var(--secondary)", border: "1px solid var(--border)", marginBottom: "1.5rem", fontWeight: 600, display: "flex", justifyContent: "center", gap: "0.5rem" }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" height="20" />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ padding: "0 1rem" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                style={{ padding: "0.85rem", borderRadius: "0.5rem" }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                style={{ padding: "0.85rem", borderRadius: "0.5rem" }}
              />
            </div>

            <button type="submit" disabled={loading} className={`btn btn-primary ${styles.btn}`} style={{ padding: "0.85rem", justifyContent: "center", width: "100%" }}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
            Don&apos;t have an account? <Link href="/agent/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Register instantly</Link>
          </p>
        </div>
      </div>
    </>
  );
}
