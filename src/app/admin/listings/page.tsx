"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { LayoutList, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import styles from "../table.module.css";
import { formatPrice } from "@/lib/constants";

type Listing = {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
  description: string;
  photos: string[];
  agentId: string;
  agentName?: string;
  verified: boolean;
  createdAt: any;
};

export default function AdminListingsPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: listSnap } = await supabase.from("listings").select("*").order("createdAt", { ascending: false });
      const { data: agentsSnap } = await supabase.from("agents").select("*");

      const agentsMap: Record<string, string> = {};
      (agentsSnap || []).forEach((d: any) => { agentsMap[d.uid] = d.name; });

      const listings = (listSnap || []).map((d: any) => ({
        ...d,
        agentName: agentsMap[d.agentId] || "Unknown Agent",
      })) as Listing[];

      setItems(listings);
      setLoading(false);
    };
    fetchData();
  }, []);

  const setVerified = async (id: string, verified: boolean) => {
    setUpdatingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("listings").update({ verified }).eq("id", id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((v) => (v.id === id ? { ...v, verified } : v))
      );
      toast.success(verified ? "Listing published to Marketplace!" : "Listing unpublished.");
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    setUpdatingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((v) => v.id !== id));
      toast.success("Listing deleted successfully");
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1><LayoutList size={22} /> Listings</h1>
          <p>{items.length} total &nbsp;·&nbsp; {items.filter((l) => l.verified).length} published</p>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Listing</th>
                <th>Type</th>
                <th>Location</th>
                <th>Price</th>
                <th>Agent</th>
                <th>Photo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.bold}>{item.title}</div>
                    <div className={styles.sub} style={{ maxWidth: 200 }}>
                      {item.description.slice(0, 60)}...
                    </div>
                  </td>
                  <td><span className={`badge badge-new`}>{item.type}</span></td>
                  <td>{item.location}</td>
                  <td>UGX {formatPrice(item.price)}</td>
                  <td>{item.agentName}</td>
                  <td>
                    {item.photos?.[0] ? (
                      <a href={item.photos[0]} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                        <ExternalLink size={14} /> View
                      </a>
                    ) : (
                      <span className={styles.sub}>None</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${item.verified ? "badge-verified" : "badge-pending"}`}>
                      {item.verified ? "Published" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {!item.verified && (
                        <button
                          className={`${styles.actionBtn} ${styles.green}`}
                          onClick={() => setVerified(item.id, true)}
                          disabled={updatingId === item.id}
                        >
                          <CheckCircle size={14} /> {updatingId === item.id ? "..." : "Publish"}
                        </button>
                      )}
                      {item.verified && (
                        <button
                          className={`${styles.actionBtn} ${styles.red}`}
                          onClick={() => setVerified(item.id, false)}
                          disabled={updatingId === item.id}
                        >
                          <XCircle size={14} /> {updatingId === item.id ? "..." : "Unpublish"}
                        </button>
                      )}
                      <button 
                        className={`${styles.actionBtn}`} 
                        style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5" }} 
                        onClick={() => deleteListing(item.id)} 
                        disabled={updatingId === item.id}
                      >
                        {updatingId === item.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className={styles.empty}>No listings submitted yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
