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

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconBg} style={{ marginBottom: "1rem" }}>
            <LogIn size={28} />
          </div>
          <h1 className={styles.title}>Agent Login</h1>
          <p className={styles.subtitle}>Access your dashboard and listings.</p>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} className={`btn btn-primary ${styles.btn}`}>
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
            Don&apos;t have an account? <Link href="/agent/register" style={{ color: "var(--primary)" }}>Apply here</Link>
          </p>
        </div>
      </div>
    </>
  );
}
