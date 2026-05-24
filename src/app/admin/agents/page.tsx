"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { UserCheck, ExternalLink } from "lucide-react";
import styles from "../table.module.css";

type Agent = {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  areasServed: string;
  bio: string;
  socialLink: string;
  nin: string;
  ninPhotoURL?: string;
  plan: string;
  status: string;
  slug: string;
};

export default function AgentsPage() {
  const [items, setItems] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      const supabase = createClient();
      try {
        const { data } = await supabase
          .from("agents")
          .select("*")
          .order("createdAt", { ascending: false });
        setItems((data || []) as Agent[]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const updateStatus = async (uid: string, status: string) => {
    setUpdatingId(uid);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("agents").update({ status }).eq("uid", uid);
      if (error) throw error;
      setItems((prev) => prev.map((v) => (v.uid === uid ? { ...v, status } : v)));
      toast.success(`Agent ${status}`);
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteAgent = async (uid: string) => {
    if (!confirm("Are you sure you want to permanently delete this agent and all their listings?")) return;
    setUpdatingId(uid);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("agents").delete().eq("uid", uid);
      if (error) throw error;
      setItems((prev) => prev.filter((v) => v.uid !== uid));
      toast.success("Agent deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1><UserCheck size={22} /> Agents</h1>
          <p>{items.length} applications</p>
        </div>
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Areas</th>
                <th>Plan</th>
                <th>Social</th>
                <th>NIN</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.uid}>
                  <td>
                    <div className={styles.bold}>{v.name}</div>
                    <div className={styles.sub}>{v.email}</div>
                  </td>
                  <td>
                    <a href={`https://wa.me/256${v.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(v.name)}%2C%20your%20agent%20application%20has%20been%20reviewed`} target="_blank" rel="noopener noreferrer" className={styles.waLink}>
                      {v.phone}
                    </a>
                  </td>
                  <td>{v.areasServed}</td>
                  <td><span className={`badge badge-${v.plan === "paid" ? "verified" : "new"}`}>{v.plan}</span></td>
                  <td>
                    <a href={v.socialLink} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                      <ExternalLink size={14} /> View
                    </a>
                  </td>
                  <td>
                    <div className={styles.sub}>{v.nin}</div>
                    {v.ninPhotoURL && (
                      <a href={v.ninPhotoURL} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                        <ExternalLink size={14} /> Photo
                      </a>
                    )}
                  </td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {v.status !== "approved" && (
                        <button className={`${styles.actionBtn} ${styles.green}`} onClick={() => updateStatus(v.uid, "approved")} disabled={updatingId === v.uid}>
                          {updatingId === v.uid ? "..." : "Approve"}
                        </button>
                      )}
                      {v.status !== "rejected" && (
                        <button className={`${styles.actionBtn} ${styles.red}`} onClick={() => updateStatus(v.uid, "rejected")} disabled={updatingId === v.uid}>
                          {updatingId === v.uid ? "..." : "Suspend"}
                        </button>
                      )}
                      <button className={`${styles.actionBtn}`} style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => deleteAgent(v.uid)} disabled={updatingId === v.uid}>
                        {updatingId === v.uid ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className={styles.empty}>No agent applications yet.</p>}
        </div>
      )}
    </div>
  );
}
