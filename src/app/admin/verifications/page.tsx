"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { ShieldCheck, ExternalLink } from "lucide-react";
import styles from "../table.module.css";

type Verification = {
  id: string;
  buyerName: string;
  phone: string;
  location: string;
  sellerName: string;
  sellerPhone?: string;
  titlePhotoURL?: string;
  status: string;
  notes?: string;
  adminNotes?: string;
};

export default function VerificationsPage() {
  const [items, setItems] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  useEffect(() => {
    getDocs(query(collection(db, "verifications"), orderBy("createdAt", "desc")))
      .then((snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Verification))))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "verifications", id), { status });
      setItems((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1><ShieldCheck size={22} /> Title Verifications</h1>
          <p>{items.length} total requests</p>
        </div>
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Seller</th>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td className={styles.bold}>{v.buyerName}</td>
                  <td>
                    <a href={`https://wa.me/256${v.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(v.buyerName)}%2C%20regarding%20your%20title%20verification`} target="_blank" rel="noopener noreferrer" className={styles.waLink}>
                      {v.phone}
                    </a>
                  </td>
                  <td>{v.location}</td>
                  <td>{v.sellerName}</td>
                  <td>
                    {v.titlePhotoURL ? (
                      <a href={v.titlePhotoURL} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                        <ExternalLink size={14} /> View
                      </a>
                    ) : "—"}
                  </td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {v.status !== "verified" && (
                        <button className={`${styles.actionBtn} ${styles.green}`} onClick={() => updateStatus(v.id, "verified")} disabled={updatingId === v.id}>
                          Verify
                        </button>
                      )}
                      {v.status !== "flagged" && (
                        <button className={`${styles.actionBtn} ${styles.red}`} onClick={() => updateStatus(v.id, "flagged")} disabled={updatingId === v.id}>
                          Flag
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className={styles.empty}>No verification requests yet.</p>}
        </div>
      )}
    </div>
  );
}
