"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://firestore.googleapis.com/v1/projects/linkspropertynetwork-295bf/databases/(default)/documents:runQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "agents" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "uid" },
                  op: "EQUAL",
                  value: { stringValue: user.uid }
                }
              },
              limit: 1
            }
          })
        });

        if (!res.ok) throw new Error("Failed to fetch agent");
        const data = await res.json();

        if (!data || data.length === 0 || !data[0].document) {
          setLoading(false);
          return;
        }

        const agentDoc = data[0].document;
        // The REST API document name is like projects/.../databases/(default)/documents/agents/{agentId}
        const agentId = agentDoc.name.split("/").pop() as string;
        setAgentSlug(agentDoc.fields.slug?.stringValue || "");

        // Fetch listings
        const listingsRes = await fetch(`https://firestore.googleapis.com/v1/projects/linkspropertynetwork-295bf/databases/(default)/documents:runQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "listings" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "agentId" },
                  op: "EQUAL",
                  value: { stringValue: agentId }
                }
              }
            }
          })
        });

        if (!listingsRes.ok) throw new Error("Failed to fetch listings");
        const listingsData = await listingsRes.json();
        
        const parsedListings: Listing[] = [];
        if (listingsData && listingsData.length > 0 && listingsData[0].document) {
          for (const item of listingsData) {
            if (item.document) {
              const docId = item.document.name.split("/").pop() as string;
              const f = item.document.fields;
              
              parsedListings.push({
                id: docId,
                title: f.title?.stringValue || "",
                type: f.type?.stringValue || "",
                price: f.price?.stringValue || "",
                location: f.location?.stringValue || "",
                description: f.description?.stringValue || "",
                agentId: f.agentId?.stringValue || "",
                photos: f.photos?.arrayValue?.values?.map((v: any) => v.stringValue) || [],
                verified: f.verified?.booleanValue || false,
                createdAt: f.createdAt?.timestampValue || null,
              });
            }
          }
        }
        
        setListings(parsedListings);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    });

    return () => unsub();
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
