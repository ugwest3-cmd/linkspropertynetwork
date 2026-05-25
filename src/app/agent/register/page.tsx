"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import styles from "./register.module.css";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 chars"),
});

type FormData = z.infer<typeof schema>;

export default function AgentRegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.name } }
      });
      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("User creation failed");

      const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString().slice(-4);

      // Auto-approve the agent immediately
      const { error: dbError } = await supabase.from("agents").insert({
        name: data.name,
        email: data.email,
        uid: user.id,
        slug,
        status: "approved",
        plan: "free"
      });
      
      if (dbError) throw dbError;

      toast.success("Registration successful! Welcome to your dashboard.");
      router.push("/agent/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("already registered")) {
        toast.error("This email is already registered. Please login.");
      } else {
        toast.error(err.message || "Something went wrong. Please try again.");
      }
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
      <main className={styles.main}>
        <div className="container" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div className={styles.header} style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className={styles.iconWrap} style={{ justifyContent: "center", display: "flex" }}><TrendingUp size={32} color="var(--primary)" /></div>
            <h1 style={{ marginTop: "1rem" }}>Join as an Agent</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
              Start posting properties in seconds. It's free and instant.
            </p>
          </div>

          <div style={{ background: "white", padding: "2rem", borderRadius: "var(--radius)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid var(--border)" }}>
            
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

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="label">Full Name</label>
                <input {...register("name")} placeholder="e.g. David Ssemakula" style={{ padding: "0.85rem", borderRadius: "0.5rem" }} />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="label">Email Address</label>
                <input {...register("email")} type="email" placeholder="e.g. david@email.com" style={{ padding: "0.85rem", borderRadius: "0.5rem" }} />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="label">Password</label>
                <input {...register("password")} type="password" placeholder="Create a secure password" style={{ padding: "0.85rem", borderRadius: "0.5rem" }} />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "0.85rem", justifyContent: "center" }}>
                {loading ? "Creating Account..." : <>Sign Up <ChevronRight size={18} /></>}
              </button>
            </form>

            <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              By registering, you agree to our <Link href="/terms" style={{ color: "var(--primary)" }}>Terms</Link> and <Link href="/privacy" style={{ color: "var(--primary)" }}>Privacy Policy</Link>.
            </p>
            <p style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
              Already have an account? <Link href="/agent/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Log In</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
