"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, Upload, CheckCircle, ChevronRight } from "lucide-react";
import styles from "./register.module.css";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(9, "Enter your WhatsApp number"),
  email: z.string().email("Valid email required for login"),
  password: z.string().min(6, "Password must be at least 6 chars"),
  areasServed: z.string().min(3, "Enter areas you serve"),
  bio: z.string().min(20, "Tell us a bit about your experience (min 20 chars)"),
  socialLink: z.string().url("Enter a valid URL (WhatsApp group or TikTok)"),
  nin: z.string().min(14, "Enter your full NIN (14 characters)").max(14),
  plan: z.enum(["free", "paid"]),
});

type FormData = z.infer<typeof schema>;

const features = {
  free: ["Public agent profile page", "Up to 5 listings", "WhatsApp CTA buttons", "Basic analytics"],
  paid: ["Everything in Free", "Unlimited listings", "Featured placement", "Advanced analytics & leads", "Priority support"],
};

export default function AgentRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { plan: "free" },
  });

  const selectedPlan = watch("plan");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });

      const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString().slice(-4);

      const { password, ...agentData } = data;

      await addDoc(collection(db, "agents"), {
        ...agentData,
        uid: userCredential.user.uid,
        ninPhotoURL: null, // Removed field
        slug,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      toast.success("Application submitted! We'll review and contact you within 48 hours.");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please login or use a different email.");
      } else {
        toast.error(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className={styles.successWrap}>
          <div className={styles.successCard}>
            <CheckCircle size={48} color="var(--success)" />
            <h2>Application Submitted!</h2>
            <p>Our team will review your application within 48 hours. <strong>Please send a clear photo of your NIN card to our WhatsApp to complete your approval process.</strong></p>
            <a
              href={`https://wa.me/${adminWa}?text=Hi%2C%20I%20just%20applied%20to%20be%20an%20agent.%20Here%20is%20the%20photo%20of%20my%20NIN:`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              Chat With Us on WhatsApp
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.iconWrap}><TrendingUp size={32} /></div>
            <h1>Join as an Agent</h1>
            <p>Get your own shareable property profile page with verified listings and WhatsApp CTA buttons. No website needed.</p>
          </div>

          {/* Plan Selector */}
          <div className={styles.plans}>
            {(["free", "paid"] as const).map((plan) => (
              <label key={plan} className={`${styles.planCard} ${selectedPlan === plan ? styles.planSelected : ""}`}>
                <input type="radio" value={plan} {...register("plan")} style={{ display: "none" }} />
                <div className={styles.planHeader}>
                  <span className={styles.planName}>{plan === "free" ? "Free Plan" : "Paid Plan"}</span>
                  <span className={styles.planPrice}>
                    {plan === "free" ? "Free + ads" : "UGX 100,000 / mo"}
                  </span>
                </div>
                <ul className={styles.planFeatures}>
                  {features[plan].map((f) => (
                    <li key={f}><CheckCircle size={14} /> {f}</li>
                  ))}
                </ul>
              </label>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <h3 className={styles.sectionTitle}>Personal Details</h3>
            <div className={styles.twoCol}>
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input {...register("name")} placeholder="e.g. David Ssemakula" />
                {errors.name && <p className="error-text">{errors.name.message}</p>}
              </div>
              <div className="form-group">
                <label className="label">WhatsApp Number *</label>
                <input {...register("phone")} placeholder="e.g. 0700 000 000" />
                {errors.phone && <p className="error-text">{errors.phone.message}</p>}
              </div>
            </div>
            <div className={styles.twoCol}>
              <div className="form-group">
                <label className="label">Email Address (Login ID) *</label>
                <input {...register("email")} type="email" placeholder="e.g. david@email.com" />
                {errors.email && <p className="error-text">{errors.email.message}</p>}
              </div>
              <div className="form-group">
                <label className="label">Password *</label>
                <input {...register("password")} type="password" placeholder="Create a secure password" />
                {errors.password && <p className="error-text">{errors.password.message}</p>}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Areas You Serve *</label>
              <input {...register("areasServed")} placeholder="e.g. Kampala, Wakiso, Mukono" />
              {errors.areasServed && <p className="error-text">{errors.areasServed.message}</p>}
            </div>
            <div className="form-group">
              <label className="label">Short Bio / Experience *</label>
              <textarea {...register("bio")} rows={3} placeholder="How long have you been in real estate? What areas do you specialize in?" />
              {errors.bio && <p className="error-text">{errors.bio.message}</p>}
            </div>

            <h3 className={styles.sectionTitle}>Verification (Required)</h3>
            <div className="form-group">
              <label className="label">WhatsApp Group Link OR TikTok Page URL *</label>
              <input {...register("socialLink")} placeholder="https://chat.whatsapp.com/... or https://tiktok.com/@yourpage" />
              {errors.socialLink && <p className="error-text">{errors.socialLink.message}</p>}
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                Proof of active social media presence in real estate.
              </p>
            </div>
              <div className="form-group" style={{ width: "100%" }}>
                <label className="label">National ID Number (NIN) *</label>
                <input {...register("nin")} placeholder="CM12345678ABCD" maxLength={14} />
                {errors.nin && <p className="error-text">{errors.nin.message}</p>}
              </div>

            <div className={styles.submitRow}>
              <p className={styles.note}>
                Your application will be reviewed manually within 48 hours. We&apos;ll contact you on WhatsApp.
              </p>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : <>Submit Application <ChevronRight size={18} /></>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
