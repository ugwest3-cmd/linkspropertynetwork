"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Users } from "lucide-react";
import styles from "../table.module.css";

type BuyerRequest = {
  id: string;
  buyerName: string;
  phone: string;
  propertyType: string;
  location: string;
  budget: string;
  specs?: string;
  status: string;
  assignedAgents: string[];
};

export default function BuyersPage() {
  const [items, setItems] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "buyerRequests"), orderBy("createdAt", "desc")))
      .then((snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BuyerRequest))))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "buyerRequests", id), { status });
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
          <h1><Users size={22} /> Buyer Requests</h1>
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
                <th>Type</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Specs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td className={styles.bold}>{v.buyerName}</td>
                  <td>
                    <a href={`https://wa.me/256${v.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(v.buyerName)}%2C%20we%20have%20matched%20you%20with%20an%20agent`} target="_blank" rel="noopener noreferrer" className={styles.waLink}>
                      {v.phone}
                    </a>
                  </td>
                  <td className={styles.capitalize}>{v.propertyType}</td>
                  <td>{v.location}</td>
                  <td>{v.budget}</td>
                  <td className={styles.truncate}>{v.specs || "—"}</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {v.status !== "contacted" && (
                        <button className={`${styles.actionBtn} ${styles.blue}`} onClick={() => updateStatus(v.id, "contacted")} disabled={updatingId === v.id}>
                          Contacted
                        </button>
                      )}
                      {v.status !== "closed" && (
                        <button className={`${styles.actionBtn} ${styles.green}`} onClick={() => updateStatus(v.id, "closed")} disabled={updatingId === v.id}>
                          Closed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className={styles.empty}>No buyer requests yet.</p>}
        </div>
      )}
    </div>
  );
}
