"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import styles from "../table.module.css";

type DocCase = {
  id: string;
  buyerName: string;
  phone: string;
  status: string;
  assignedGuide?: string;
  feePaid: boolean;
};

export default function DocumentationAdminPage() {
  const [items, setItems] = useState<DocCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getDocs(query(collection(db, "documentationCases"), orderBy("createdAt", "desc")))
      .then((snap) => setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DocCase))))
      .finally(() => setLoading(false));
  }, []);

  const markCompleted = async (id: string) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "documentationCases", id), { status: "completed" });
      setItems((prev) => prev.map((v) => (v.id === id ? { ...v, status: "completed" } : v)));
      toast.success("Case marked as completed");
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
          <h1><FileText size={22} /> Documentation Cases</h1>
          <p>{items.length} total cases</p>
        </div>
      </div>

      {loading ? <p className={styles.loading}>Loading...</p> : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Phone</th>
                <th>Assigned Guide</th>
                <th>Fee Paid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td className={styles.bold}>{v.buyerName}</td>
                  <td>
                    <a href={`https://wa.me/256${v.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(v.buyerName)}%2C%20update%20on%20your%20documentation`} target="_blank" rel="noopener noreferrer" className={styles.waLink}>
                      {v.phone}
                    </a>
                  </td>
                  <td>{v.assignedGuide || "—"}</td>
                  <td>
                    <span className={`badge ${v.feePaid ? "badge-verified" : "badge-pending"}`}>
                      {v.feePaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td><span className={`badge badge-${v.status === "completed" ? "verified" : "new"}`}>{v.status}</span></td>
                  <td>
                    {v.status !== "completed" && (
                      <button className={`${styles.actionBtn} ${styles.green}`} onClick={() => markCompleted(v.id)} disabled={updatingId === v.id}>
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className={styles.empty}>No documentation cases yet.</p>}
        </div>
      )}
    </div>
  );
}
