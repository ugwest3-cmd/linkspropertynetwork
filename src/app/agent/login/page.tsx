"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import styles from "./login.module.css";

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
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in with Google");
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.card}>

          {/* Header — no icon bubble */}
          <h1 className={styles.title}>Agent Login</h1>
          <p className={styles.subtitle}>Access your dashboard and listings.</p>

          {/* Google button */}
          <button onClick={handleGoogleSignIn} className={styles.googleBtn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
            Continue with Google
          </button>

          <div className={styles.divider}><span>OR</span></div>

          {/* Email / password form */}
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                className={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          <p className={styles.footer}>
            Don&apos;t have an account?{" "}
            <Link href="/agent/register" className={styles.link}>Register instantly</Link>
          </p>
        </div>
      </div>
    </>
  );
}
