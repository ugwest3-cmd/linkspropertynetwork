"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Upload, User } from "lucide-react";
import Link from "next/link";
import styles from "./profile.module.css";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().min(9, "Phone number is required"),
  areasServed: z.string().min(3, "Please specify areas you serve"),
  bio: z.string().min(10, "Please provide a short bio"),
});

type FormData = z.infer<typeof schema>;

export default function AgentProfileEditor() {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: agentData } = await supabase
        .from("agents")
        .select("*")
        .eq("uid", session.user.id)
        .single();
        
      if (agentData) {
        setAgentId(agentData.uid);
        setExistingPhoto(agentData.photo || "");
        reset({
          name: agentData.name || "",
          phone: agentData.phone || "",
          areasServed: agentData.areasServed || "",
          bio: agentData.bio || "",
        });
      }
    };
    
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    if (!agentId) {
      toast.error("Auth error. Please login again.");
      return;
    }

    setLoading(true);
    let finalPhotoUrl = existingPhoto;

    try {
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Image upload failed");
        const uploadData = await uploadRes.json();
        finalPhotoUrl = uploadData.url;
      }

      const supabase = createClient();
      const { error } = await supabase.from("agents").update({
        ...data,
        photo: finalPhotoUrl
      }).eq("uid", agentId);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      router.push("/agent/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 1rem", maxWidth: "600px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/agent/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: "2rem" }}>Edit Public Profile</h1>
        <p style={{ color: "var(--text-muted)" }}>Update how you appear to buyers on your public link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
        
        <div className="form-group" style={{ marginBottom: "2rem" }}>
          <label className="label">Profile Photo</label>
          <label className={styles.uploadArea}>
            {photoFile ? (
              <img src={URL.createObjectURL(photoFile)} alt="Preview" className={styles.avatarPreview} />
            ) : existingPhoto ? (
              <img src={existingPhoto} alt="Existing" className={styles.avatarPreview} />
            ) : (
              <User size={48} color="#cbd5e1" style={{ marginBottom: "0.5rem" }}/>
            )}
            <span style={{ fontWeight: 500 }}>Click to upload new photo</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>JPG, PNG up to 2MB</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} 
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className="form-group">
          <label className="label">Display Name *</label>
          <input {...register("name")} placeholder="Your full name" />
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">WhatsApp Number *</label>
          <input {...register("phone")} placeholder="e.g. 0700000000" />
          {errors.phone && <p className="error-text">{errors.phone.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">Areas Served *</label>
          <input {...register("areasServed")} placeholder="e.g. Kampala, Kira, Najeera" />
          {errors.areasServed && <p className="error-text">{errors.areasServed.message}</p>}
        </div>

        <div className="form-group">
          <label className="label">Short Bio *</label>
          <textarea {...register("bio")} rows={4} placeholder="Tell buyers about your experience and expertise..." />
          {errors.bio && <p className="error-text">{errors.bio.message}</p>}
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Saving..." : <><Save size={18}/> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
}
