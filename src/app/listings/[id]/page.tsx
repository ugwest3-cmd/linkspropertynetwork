"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Tag, Share2, Phone, Home, Layers, Building2, User } from "lucide-react";
import Link from "next/link";
import styles from "./listing.module.css";
import { notFound } from "next/navigation";

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [listing, setListing] = useState<any>(null);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (listingError || !listingData) {
        setLoading(false);
        return;
      }
      
      setListing(listingData);

      const { data: agentData } = await supabase
        .from("agents")
        .select("*")
        .eq("uid", listingData.agentId)
        .single();
        
      setAgent(agentData);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "5rem", textAlign: "center" }}>Loading property details...</div>;
  }

  if (!listing) {
    return <div style={{ padding: "5rem", textAlign: "center" }}>Property not found.</div>;
  }

  const encodedTitle = encodeURIComponent(listing.title);
  const encodedUrl = encodeURIComponent(currentUrl);

  const waShareUrl = `https://wa.me/?text=Check%20out%20this%20property:%20${encodedTitle}%20${encodedUrl}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=Check%20out%20this%20property:%20${encodedTitle}&url=${encodedUrl}`;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.layout}`}>
          
          <div className={styles.content}>
            {listing.photos && listing.photos.length > 0 && (
              <div className={styles.gallery}>
                <img src={listing.photos[activePhoto]} alt="Property" className={styles.mainPhoto} />
                {listing.photos.length > 1 && (
                  <div className={styles.thumbnails}>
                    {listing.photos.map((url: string, idx: number) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt="Thumbnail" 
                        className={`${styles.thumb} ${activePhoto === idx ? styles.thumbActive : ""}`} 
                        onClick={() => setActivePhoto(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={styles.infoCard}>
              <div className={styles.titleRow}>
                <h1>{listing.title}</h1>
                <div className={styles.price}>UGX {listing.price}</div>
              </div>
              
              <div className={styles.meta}>
                <span><MapPin size={16} style={{ display: "inline", marginRight: "4px" }} /> {listing.location}</span>
                <span style={{ textTransform: "capitalize" }}>
                  {listing.type === "land" ? <Layers size={16} style={{ display: "inline", marginRight: "4px" }}/> : listing.type === "house" ? <Home size={16} style={{ display: "inline", marginRight: "4px" }}/> : <Building2 size={16} style={{ display: "inline", marginRight: "4px" }}/>}
                  {listing.type}
                </span>
              </div>

              <h2>Description</h2>
              <p style={{ whiteSpace: "pre-wrap", color: "var(--text-muted)", marginTop: "1rem" }}>{listing.description}</p>
            </div>
          </div>

          <div className={styles.sidebar}>
            {agent && (
              <div className={styles.agentCard}>
                {agent.photo ? (
                  <img src={agent.photo} alt={agent.name} style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#e2e8f0", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={32} color="#94a3b8" />
                  </div>
                )}
                <h3>{agent.name}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>Verified Agent</p>
                
                <a
                  href={`https://wa.me/256${agent.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(agent.name)}%2C%20I%20am%20interested%20in%20your%20listing:%20${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ width: "100%", justifyContent: "center", marginBottom: "0.5rem" }}
                >
                  <Phone size={16} /> Contact on WhatsApp
                </a>
                
                {agent.slug && (
                  <Link href={`/agents/${agent.slug}`} className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                    View Full Profile
                  </Link>
                )}
              </div>
            )}

            <div className={styles.shareCard}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Share2 size={18} /> Share this property</h3>
              <div className={styles.shareButtons}>
                <a href={waShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareWa}`}>WhatsApp</a>
                <a href={fbShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareFb}`}>Facebook</a>
                <a href={xShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareX}`}>X (Twitter)</a>
              </div>
            </div>
          </div>
          
        </div>
      </main>
      <Footer />
    </>
  );
}
