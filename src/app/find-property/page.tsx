"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, ChevronRight, CheckCircle } from "lucide-react";
import styles from "./find.module.css";

const schema = z.object({
  buyerName: z.string().min(2, "Full name is required"),
  phone: z.string().min(9, "Enter a valid phone number"),
  propertyType: z.string().min(1, "Select a property type"),
  location: z.string().min(3, "Enter a preferred location"),
  budget: z.string().min(1, "Budget is required"),
  specs: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function FindPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await addDoc(collection(db, "buyerRequests"), {
        ...data,
        status: "new",
        assignedAgents: [],
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      toast.success("Request submitted! We'll match you with agents shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please WhatsApp us directly.");
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
            <h2>We Got Your Request!</h2>
            <p>Our team will review your specifications and match you with 1–3 pre-screened agents. Expect a WhatsApp message from us within 24 hours.</p>
            <a
              href={`https://wa.me/${adminWa}?text=Hi%2C%20I%20just%20submitted%20a%20property%20search%20request`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              Follow up on WhatsApp
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
            <div className={styles.iconWrap}><Users size={32} /></div>
            <h1>Find Your Property</h1>
            <p>Tell us exactly what you&apos;re looking for. We match you with 1–3 pre-screened agents who will contact you via WhatsApp.</p>
            <div className={styles.pricing}>
              <span>Commission on close: 1–5% of deal value</span>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <h3 className={styles.sectionTitle}>Your Information</h3>
            <div className={styles.twoCol}>
              <div className="form-group">
                <label className="label">Full Name *</label>
                <input {...register("buyerName")} placeholder="e.g. Sarah Nakato" />
                {errors.buyerName && <p className="error-text">{errors.buyerName.message}</p>}
              </div>
              <div className="form-group">
                <label className="label">Phone (WhatsApp) *</label>
                <input {...register("phone")} placeholder="e.g. 0780 000 000" />
                {errors.phone && <p className="error-text">{errors.phone.message}</p>}
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Property Specifications</h3>
            <div className="form-group">
              <label className="label">Property Type *</label>
              <select {...register("propertyType")}>
                <option value="">Select type...</option>
                <option value="land">Land / Plot</option>
                <option value="house">House / Apartment</option>
                <option value="commercial">Commercial Property</option>
              </select>
              {errors.propertyType && <p className="error-text">{errors.propertyType.message}</p>}
            </div>

            <div className={styles.twoCol}>
              <div className="form-group">
                <label className="label">Preferred Location *</label>
                <input {...register("location")} placeholder="e.g. Entebbe Road, Kampala" />
                {errors.location && <p className="error-text">{errors.location.message}</p>}
              </div>
              <div className="form-group">
                <label className="label">Budget (UGX) *</label>
                <input {...register("budget")} placeholder="e.g. 50,000,000" />
                {errors.budget && <p className="error-text">{errors.budget.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Additional Specs (size, features, etc.)</label>
              <textarea {...register("specs")} rows={3} placeholder="e.g. 50x100 plot, borehole, near school, gated area..." />
            </div>

            <div className={styles.submitRow}>
              <p className={styles.note}>
                We review requests manually and notify you within 24 hours via WhatsApp.
              </p>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Submitting..." : <>Submit Request <ChevronRight size={18} /></>}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
