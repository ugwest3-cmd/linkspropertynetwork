"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Home, MapPin, CheckCircle, Clock, Copy, Pencil } from "lucide-react";
import styles from "./dashboard.module.css";

type Listing = {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
  photos: string[];
  verified: boolean;
  agentId: string;
  createdAt: any;
};

export default function AgentDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentSlug, setAgentSlug] = useState("");
  const [agentName, setAgentName] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const fetchDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      if (!session) { setLoading(false); return; }

      try {
        const { data: agentData, error: agentError } = await supabase
          .from("agents").select("uid, slug, name")
          .eq("uid", session.user.id).single();

        if (agentError || !agentData) { if (isMounted) setLoading(false); return; }

        if (isMounted) {
          setAgentSlug(agentData.slug || "");
          setAgentName(agentData.name || "Agent");
        }

        const { data: listingsData, error: listingsError } = await supabase
          .from("listings").select("*")
          .eq("agentId", agentData.uid)
          .order("createdAt", { ascending: false });

        if (listingsError) throw listingsError;
        if (isMounted) { setListings((listingsData || []) as Listing[]); setLoading(false); }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) setLoading(false);
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []);

  const deleteListing = async (id: string) => {
    if (!confirm("Remove this listing?")) return;
    setUpdatingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      setListings((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing.");
    } finally {
      setUpdatingId(null);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://linkspropertynetwork.vercel.app/agents/${agentSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.dashWrap}>

      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div>
          <p className={styles.welcomeLabel}>Welcome back 👋</p>
          <h1 className={styles.welcomeName}>{agentName}</h1>
        </div>
        <Link href="/agent/dashboard/add-listing" className={`btn btn-primary ${styles.addBtn}`}>
          <Plus size={18} /> New Listing
        </Link>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statPill}>
          <span className={styles.statNum}>{listings.length}</span>
          <span className={styles.statLbl}>Listings</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statNum}>{listings.filter(l => l.verified).length}</span>
          <span className={styles.statLbl}>Published</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statNum} style={{ color: "var(--success)" }}>Live ✓</span>
          <span className={styles.statLbl}>Profile</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {agentSlug && (
          <button onClick={copyLink} className={styles.qAction}>
            <Copy size={18} />
            <span>{copied ? "Copied!" : "Copy Profile Link"}</span>
          </button>
        )}
        <Link href="/agent/dashboard/profile" className={styles.qAction}>
          <Pencil size={18} />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Listings */}
      <div className={styles.listingsSection}>
        <h2 className={styles.sectionTitle}>My Properties</h2>

        {loading ? (
          <div className={styles.skeletonWrap}>
            {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className={styles.emptyState}>
            <Home size={48} color="#cbd5e1" style={{ margin: "0 auto 1rem" }} />
            <h3>No listings yet</h3>
            <p>Add your first property to get started.</p>
            <Link href="/agent/dashboard/add-listing" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              + Add Listing
            </Link>
          </div>
        ) : (
          <div className={styles.cardList}>
            {listings.map(listing => (
              <div key={listing.id} className={styles.listingCard}>
                <div className={styles.cardPhoto}>
                  {listing.photos?.[0] ? (
                    <img src={listing.photos[0]} alt={listing.title} />
                  ) : (
                    <div className={styles.noPhoto}><Home size={28} strokeWidth={1} /></div>
                  )}
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardTopRow}>
                    <span className={`badge ${listing.verified ? "badge-verified" : "badge-pending"}`}>
                      {listing.verified
                        ? <><CheckCircle size={11} style={{ display: "inline", marginRight: "3px" }} />Published</>
                        : <><Clock size={11} style={{ display: "inline", marginRight: "3px" }} />Pending</>}
                    </span>
                    <span className={styles.cardType}>{listing.type}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{listing.title}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardPrice}>UGX {listing.price}</span>
                    <span className={styles.cardLoc}><MapPin size={12} /> {listing.location}</span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => deleteListing(listing.id)}
                    disabled={updatingId === listing.id}
                  >
                    {updatingId === listing.id ? "Removing..." : "Remove Listing"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
