"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Upload, ChevronLeft, Save, Home, Layers, Building2 } from "lucide-react";
import Link from "next/link";
import styles from "./add.module.css";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["land", "house", "commercial"]),
  price: z.string().min(3, "Price is required"),
  location: z.string().min(3, "Location is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddListingPage() {
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "house" // Default selection
    }
  });

  const selectedType = watch("type");

  useEffect(() => {
    const supabase = createClient();
    const fetchAgentId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: agentData } = await supabase.from("agents").select("uid").eq("uid", session.user.id).single();
      if (agentData) setAgentId(agentData.uid);
    };
    fetchAgentId();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error("You can upload a maximum of 5 photos.");
      return;
    }
    setPhotoFiles(files);
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  const onSubmit = async (data: FormData) => {
    if (photoFiles.length === 0) {
      toast.error("Please upload at least one photo.");
      return;
    }
    if (!agentId) {
      toast.error("Auth error. Please login again.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload photos (Mocked or real API depending on backend)
      const photoUrls = await Promise.all(
        photoFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
          if (!uploadRes.ok) throw new Error("Image upload failed");
          const uploadData = await uploadRes.json();
          return uploadData.url;
        })
      );

      // 2. Save Listing
      const supabase = createClient();
      const { error } = await supabase.from("listings").insert({
        ...data,
        agentId,
        photos: photoUrls,
        verified: true
      });
      if (error) throw error;

      toast.success("Property posted successfully!");
      router.push("/"); // Redirect back to home to see the listing
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to post property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "2rem 1rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/agent/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
          <ChevronLeft size={16} /> Back
        </Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Post your property</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
        
        {/* Step 1: Category */}
        <div>
          <span className={styles.inputLabel}>Property Type</span>
          <div className={styles.typeSelector}>
            <div 
              className={`${styles.typeCard} ${selectedType === "house" ? styles.active : ""}`}
              onClick={() => setValue("type", "house")}
            >
              <Home size={28} />
              <span>House / Apt</span>
            </div>
            <div 
              className={`${styles.typeCard} ${selectedType === "land" ? styles.active : ""}`}
              onClick={() => setValue("type", "land")}
            >
              <Layers size={28} />
              <span>Land / Plot</span>
            </div>
            <div 
              className={`${styles.typeCard} ${selectedType === "commercial" ? styles.active : ""}`}
              onClick={() => setValue("type", "commercial")}
            >
              <Building2 size={28} />
              <span>Commercial</span>
            </div>
          </div>
        </div>

        {/* Step 2: Photos */}
        <div className={styles.inputGroup} style={{ padding: "1rem" }}>
          <span className={styles.inputLabel}>Add Photos</span>
          <label className={styles.uploadArea}>
            <Upload size={32} color="var(--primary)" style={{ marginBottom: "0.5rem" }}/>
            <span style={{ fontWeight: 600 }}>Tap to add photos</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>First photo will be the cover</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={handlePhotoChange} 
              style={{ display: "none" }}
            />
          </label>
          
          {photoPreviews.length > 0 && (
            <div className={styles.photoPreviewContainer}>
              {photoPreviews.map((src, i) => (
                <img key={i} src={src} alt="preview" className={styles.photoPreview} />
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Details */}
        <div className={styles.inputGroup}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className={styles.inputLabel}>Title</span>
            <input 
              {...register("title")} 
              placeholder="e.g. 3 Bedroom House in Kira" 
              className={styles.minimalInput}
            />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <span className={styles.inputLabel}>Price (UGX)</span>
            <input 
              {...register("price")} 
              type="number"
              placeholder="e.g. 50000000" 
              className={styles.minimalInput}
            />
            {errors.price && <p className="error-text">{errors.price.message}</p>}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <span className={styles.inputLabel}>Location</span>
            <input 
              {...register("location")} 
              placeholder="e.g. Kira, Wakiso" 
              className={styles.minimalInput}
            />
            {errors.location && <p className="error-text">{errors.location.message}</p>}
          </div>

          <div>
            <span className={styles.inputLabel}>Description (Optional)</span>
            <input 
              {...register("description")} 
              placeholder="Any extra details?" 
              className={styles.minimalInput}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", borderRadius: "var(--radius)" }}>
          {loading ? "Posting..." : "Post Property"}
        </button>
      </form>
    </div>
  );
}
