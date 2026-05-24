"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Home, MapPin, CheckCircle } from "lucide-react";
import styles from "./dashboard.module.css";

type Listing = {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
  description: string;
  photos: string[];
  verified: boolean;
  agentId: string;
  createdAt: any;
};

export default function AgentDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentSlug, setAgentSlug] = useState("");

  useEffect(() => {

    let isMounted = true;
    const supabase = createClient();

    const fetchDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: agentData, error: agentError } = await supabase
          .from("agents")
          .select("uid, slug")
          .eq("uid", session.user.id)
          .single();

        if (agentError || !agentData) {
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) setAgentSlug(agentData.slug || "");

        const { data: listingsData, error: listingsError } = await supabase
          .from("listings")
          .select("*")
          .eq("agentId", agentData.uid)
          .order("createdAt", { ascending: false });

        if (listingsError) throw listingsError;
        
        if (isMounted) {
          setListings((listingsData || []) as Listing[]);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="container" style={{ padding: "3rem 1rem" }}>
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>My Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage your listings and profile.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          {agentSlug && (
            <a href={`/agents/${agentSlug}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              View Public Page
            </a>
          )}
          <Link href="/agent/dashboard/add-listing" className="btn btn-primary">
            <Plus size={18} /> Add New Listing
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Active Listings</h3>
          <div className={styles.statValue}>{listings.length}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Verified Listings</h3>
          <div className={styles.statValue}>{listings.filter(l => l.verified).length}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Public Profile</h3>
          <div className={styles.statValue} style={{ color: "var(--success)", fontSize: "1.2rem", marginTop: "0.5rem"}}>Live</div>
        </div>
      </div>

      <h2 style={{ marginTop: "3rem", marginBottom: "1.5rem" }}>Your Properties</h2>
      
      {loading ? (
        <p>Loading properties...</p>
      ) : listings.length === 0 ? (
        <div className={styles.emptyState}>
          <Home size={48} color="#cbd5e1" style={{ margin: "0 auto 1rem" }}/>
          <h3>No listings yet</h3>
          <p>Get started by adding your first property to your portfolio.</p>
          <Link href="/agent/dashboard/add-listing" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-flex" }}>
            Create Listing
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Property</th>
                <th>Price</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(listing => (
                <tr key={listing.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{listing.title}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{listing.type}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{listing.price}</td>
                  <td><MapPin size={14} style={{ display: "inline", marginRight: "4px"}}/>{listing.location}</td>
                  <td>
                    {listing.verified ? (
                      <span className="badge badge-verified"><CheckCircle size={12} style={{ display: "inline", marginRight: "4px"}}/> Verified</span>
                    ) : (
                      <span className="badge badge-pending">Pending Review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
