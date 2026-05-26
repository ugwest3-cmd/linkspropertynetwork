"use client";
import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Tag, Share2, Phone, Home, Layers, Building2, User, MessageCircle } from "lucide-react";
import Link from "next/link";
import styles from "./listing.module.css";

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
    return (
      <>
        <Navbar />
        <div style={{ padding: "5rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading property details...
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "5rem", textAlign: "center", color: "var(--text-muted)" }}>
          Property not found.
        </div>
      </>
    );
  }

  const encodedTitle = encodeURIComponent(listing.title);
  const encodedUrl = encodeURIComponent(currentUrl);
  const waContactUrl = agent?.phone
    ? `https://wa.me/256${agent.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(agent?.name || "Agent")}%2C%20I%20am%20interested%20in%20your%20listing%3A%20${encodedTitle}`
    : "#";

  const waShareUrl = `https://wa.me/?text=Check%20out%20this%20property:%20${encodedTitle}%20${encodedUrl}`;
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xShareUrl  = `https://twitter.com/intent/tweet?text=Check%20out%20this%20property:%20${encodedTitle}&url=${encodedUrl}`;

  const TypeIcon = listing.type === "land"
    ? <Layers size={15} />
    : listing.type === "house"
    ? <Home size={15} />
    : <Building2 size={15} />;

  const typeLabel = listing.type === "land"
    ? "Land / Plot"
    : listing.type === "house"
    ? "House / Apartment"
    : "Commercial";

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={`container ${styles.layout}`}>

          {/* ── Left: gallery + info ── */}
          <div className={styles.content}>

            {/* Gallery */}
            {listing.photos && listing.photos.length > 0 && (
              <div className={styles.gallery}>
                <img
                  src={listing.photos[activePhoto]}
                  alt="Property"
                  className={styles.mainPhoto}
                />
                {listing.photos.length > 1 && (
                  <div className={styles.thumbnails}>
                    {listing.photos.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className={`${styles.thumb} ${activePhoto === idx ? styles.thumbActive : ""}`}
                        onClick={() => setActivePhoto(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info card */}
            <div className={styles.infoCard}>
              <h1 className={styles.infoTitle}>{listing.title}</h1>

              {/* Price — visible on desktop, hidden on mobile (shown in sticky bar) */}
              <div className={styles.infoPrice}>
                <Tag size={18} /> UGX {listing.price}
              </div>

              {/* Meta row */}
              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <MapPin size={15} /> {listing.location}
                </span>
                <span className={styles.metaItem}>
                  {TypeIcon} {typeLabel}
                </span>
              </div>

              <hr className={styles.divider} />

              <p className={styles.descLabel}>Description</p>
              <p className={styles.descText}>{listing.description}</p>
            </div>
          </div>

          {/* ── Right: agent + share sidebar ── */}
          <div className={styles.sidebar}>
            {agent && (
              <div className={styles.agentCard}>
                {agent.photo ? (
                  <img src={agent.photo} alt={agent.name} className={styles.agentAvatar} />
                ) : (
                  <div className={styles.agentAvatarPlaceholder}>
                    <User size={30} color="#94a3b8" />
                  </div>
                )}
                <h3>{agent.name}</h3>
                <p className={styles.agentSubtitle}>Verified Agent</p>

                <div className={styles.agentBtns}>
                  <a
                    href={waContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ justifyContent: "center" }}
                  >
                    <Phone size={16} /> Contact on WhatsApp
                  </a>
                  {agent.slug && (
                    <Link
                      href={`/agents/${agent.slug}`}
                      className="btn btn-outline"
                      style={{ justifyContent: "center" }}
                    >
                      View Full Profile
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className={styles.shareCard}>
              <p className={styles.shareTitle}>
                <Share2 size={16} /> Share this property
              </p>
              <div className={styles.shareButtons}>
                <a href={waShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareWa}`}>WhatsApp</a>
                <a href={fbShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareFb}`}>Facebook</a>
                <a href={xShareUrl}  target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareX}`}>X</a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Mobile sticky bottom CTA (price + enquire) ── */}
      {agent && (
        <div className={styles.mobileCta}>
          <span className={styles.mobilePriceLabel}>
            UGX {listing.price}
          </span>
          <a
            href={waContactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileEnquireBtn}
          >
            <MessageCircle size={17} /> Enquire
          </a>
        </div>
      )}

      <Footer />
    </>
  );
}
