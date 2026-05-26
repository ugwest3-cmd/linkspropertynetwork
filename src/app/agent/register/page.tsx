"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ChevronRight } from "lucide-react";
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
        options: { data: { full_name: data.name } },
      });
      if (authError) throw authError;

      const user = authData.user;
      if (!user) {
        toast.success("Please check your email to confirm, or login if you already have an account.");
        router.push("/agent/login");
        return;
      }

      const slug =
        data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now().toString().slice(-4);

      const { error: dbError } = await supabase.from("agents").insert({
        name: data.name,
        email: data.email,
        uid: user.id,
        slug,
        status: "approved",
        plan: "free",
      });
      if (dbError) throw dbError;

      toast.success("Registration successful! Welcome to your dashboard.");
      router.push("/agent/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("already registered")) {
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
          <h1 className={styles.title}>Join as an Agent</h1>
          <p className={styles.subtitle}>Start posting properties in seconds. It&apos;s free and instant.</p>

          {/* Google button */}
          <button onClick={handleGoogleSignIn} className={styles.googleBtn}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
            Continue with Google
          </button>

          <div className={styles.divider}><span>OR</span></div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input {...register("name")} placeholder="e.g. David Ssemakula" className={styles.input} />
              {errors.name && <p className={styles.errorText}>{errors.name.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input {...register("email")} type="email" placeholder="e.g. david@email.com" className={styles.input} />
              {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <input {...register("password")} type="password" placeholder="Create a secure password" className={styles.input} />
              {errors.password && <p className={styles.errorText}>{errors.password.message}</p>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Creating Account…" : <span className={styles.submitInner}>Sign Up <ChevronRight size={17} /></span>}
            </button>
          </form>

          <p className={styles.terms}>
            By registering, you agree to our{" "}
            <Link href="/terms" className={styles.link}>Terms</Link> and{" "}
            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>.
          </p>
          <p className={styles.footer}>
            Already have an account?{" "}
            <Link href="/agent/login" className={styles.link}>Log In</Link>
          </p>
        </div>
      </div>
    </>
  );
}
