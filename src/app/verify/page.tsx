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
import { ShieldCheck, Upload, ChevronRight } from "lucide-react";
import styles from "./verify.module.css";

const schema = z.object({
  buyerName: z.string().min(2, "Full name is required"),
  phone: z.string().min(9, "Enter a valid phone number"),
  location: z.string().min(3, "Property location is required"),
  sellerName: z.string().min(2, "Seller name is required"),
  sellerPhone: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await addDoc(collection(db, "verifications"), {
        ...data,
        titlePhotoURL: null, // Removed field
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSubmitted(true);
      toast.success("Request submitted! We'll contact you shortly.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again or WhatsApp us.");
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
            <ShieldCheck size={48} color="var(--success)" />
            <h2>Request Received!</h2>
            <p>Your title verification request has been submitted. <strong>Please send a clear photo of the property title to our WhatsApp to complete your application.</strong></p>
            <a
              href={`https://wa.me/${adminWa}?text=Hi%2C%20I%20just%20submitted%20a%20title%20verification%20request.%20Here%20is%20the%20photo%20of%20my%20title:`}
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
            <div className={styles.iconWrap}><ShieldCheck size={32} /></div>
            <h1>Title Verification</h1>
            <p>Submit your property details and our team will conduct a thorough title check. You&apos;ll receive a verified or flagged report within 1–3 business days.</p>
            <div className={styles.pricing}>
              <span>Fee: UGX 50,000 – 300,000</span>
              <span>·</span>
              <span>Paid via MTN/Airtel (Pesapal)</span>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGrid}>
              {/* Buyer Info */}
              <div className={styles.formSection}>
                <h3>Your Information</h3>
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input {...register("buyerName")} placeholder="e.g. John Musoke" />
                  {errors.buyerName && <p className="error-text">{errors.buyerName.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Phone Number (WhatsApp) *</label>
                  <input {...register("phone")} placeholder="e.g. 0700 000 000" />
                  {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Property Info */}
              <div className={styles.formSection}>
                <h3>Property Details</h3>
                <div className="form-group">
                  <label className="label">Property Location *</label>
                  <input {...register("location")} placeholder="e.g. Kira, Wakiso District" />
                  {errors.location && <p className="error-text">{errors.location.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Seller&apos;s Name *</label>
                  <input {...register("sellerName")} placeholder="Name of the seller" />
                  {errors.sellerName && <p className="error-text">{errors.sellerName.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Seller&apos;s Phone (optional)</label>
                  <input {...register("sellerPhone")} placeholder="e.g. 0750 000 000" />
                </div>
              </div>
            </div>

            {/* Title Photo Upload Removed */}

            <div className="form-group">
              <label className="label">Additional Notes (optional)</label>
              <textarea {...register("notes")} rows={3} placeholder="Any extra context about this property..." />
            </div>

            <div className={styles.submitRow}>
              <p className={styles.payNote}>
                💳 After submission, our team will send you a Pesapal payment link via WhatsApp before starting verification.
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
