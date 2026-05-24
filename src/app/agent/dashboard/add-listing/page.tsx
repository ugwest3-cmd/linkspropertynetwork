"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Upload, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import styles from "./add.module.css";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  type: z.enum(["land", "house", "commercial"]),
  price: z.string().min(3, "Price is required"),
  location: z.string().min(3, "Location is required"),
  description: z.string().min(20, "Provide a descriptive breakdown (min 20 chars)"),
});

type FormData = z.infer<typeof schema>;

export default function AddListingPage() {
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    const fetchAgentId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: agentData } = await supabase
        .from("agents")
        .select("uid")
        .eq("uid", session.user.id)
        .single();
        
      if (agentData) {
        setAgentId(agentData.uid);
      }
    };
    
    fetchAgentId();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAgentId(null);
      } else {
        fetchAgentId();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (photoFiles.length === 0) {
      toast.error("Please upload at least one feature photo.");
      return;
    }
    if (photoFiles.length > 3) {
      toast.error("You can upload a maximum of 3 photos.");
      return;
    }
    if (!agentId) {
      toast.error("Auth error. Please login again.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload photos to Cloudinary API Route
      const photoUrls = await Promise.all(
        photoFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!uploadRes.ok) throw new Error("Image upload failed");
          const uploadData = await uploadRes.json();
          return uploadData.url;
        })
      );

      // 2. Save Listing to Supabase
      const supabase = createClient();
      const { error } = await supabase.from("listings").insert({
        ...data,
        agentId,
        photos: photoUrls,
        verified: true
      });
      if (error) throw error;

      toast.success("Listing created and published to the marketplace!");
      router.push("/agent/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "3rem 1rem", maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/agent/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: "2rem" }}>Add New Listing</h1>
        <p style={{ color: "var(--text-muted)" }}>Your listing will go live immediately after submission.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
        <div className={styles.card}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Property Details</h2>
          
          <div className="form-group">
            <label className="label">Listing Title *</label>
            <input {...register("title")} placeholder="e.g. 50x100 Plot in Kira" />
            {errors.title && <p className="error-text">{errors.title.message}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="form-group">
              <label className="label">Property Type *</label>
              <select {...register("type")}>
                <option value="land">Land / Plot</option>
                <option value="house">House / Apartment</option>
                <option value="commercial">Commercial</option>
              </select>
              {errors.type && <p className="error-text">{errors.type.message}</p>}
            </div>
            
            <div className="form-group">
              <label className="label">Price (UGX) *</label>
              <input {...register("price")} placeholder="e.g. 65,000,000" />
              {errors.price && <p className="error-text">{errors.price.message}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Location *</label>
            <input {...register("location")} placeholder="e.g. Kira, Wakiso" />
            {errors.location && <p className="error-text">{errors.location.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Description & Features *</label>
            <textarea {...register("description")} rows={5} placeholder="Describe the property, nearby amenities, private mailo vs leasehold, etc." />
            {errors.description && <p className="error-text">{errors.description.message}</p>}
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Property Media</h2>
          
          <div className="form-group">
            <label className="label">Photos (Up to 3) *</label>
            <label className={styles.uploadArea}>
              <Upload size={24} color="var(--primary)" style={{ marginBottom: "0.5rem" }}/>
              <span style={{ fontWeight: 500 }}>
                {photoFiles.length > 0 ? `${photoFiles.length} photo(s) selected` : "Click to select property images"}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>JPG, PNG up to 5MB</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 3) {
                    toast.error("You can upload a maximum of 3 photos.");
                    setPhotoFiles(files.slice(0, 3));
                  } else {
                    setPhotoFiles(files);
                  }
                }} 
                style={{ display: "none" }}
              />
            </label>
            {photoFiles.length > 0 && (
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {photoFiles.map((file, i) => (
                  <div key={i} style={{ fontSize: "0.8rem", background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
            {loading ? "Publishing..." : <><Save size={18}/> Publish Listing</>}
          </button>
        </div>
      </form>
    </div>
  );
}
