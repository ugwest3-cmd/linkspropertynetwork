"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldCheck, Users, FileText, UserCheck } from "lucide-react";
import styles from "./dashboard.module.css";

type CountsType = { verifications: number; buyers: number; documentation: number; agents: number };

export default function AdminDashboard() {
  const [counts, setCounts] = useState<CountsType>({ verifications: 0, buyers: 0, documentation: 0, agents: 0 });
  const [recentVerifications, setRecentVerifications] = useState<{id: string; buyerName: string; location: string; status: string; createdAt: unknown}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [v, b, d, a] = await Promise.all([
        getDocs(collection(db, "verifications")),
        getDocs(collection(db, "buyerRequests")),
        getDocs(collection(db, "documentationCases")),
        getDocs(collection(db, "agents")),
      ]);
      setCounts({ verifications: v.size, buyers: b.size, documentation: d.size, agents: a.size });

      const recent = await getDocs(query(collection(db, "verifications"), orderBy("createdAt", "desc"), limit(5)));
      setRecentVerifications(recent.docs.map(d => ({ id: d.id, ...d.data() } as {id: string; buyerName: string; location: string; status: string; createdAt: unknown})));
    };
    fetchData();
  }, []);

  const stats = [
    { icon: <ShieldCheck size={22} />, label: "Verifications", count: counts.verifications, color: "#f97316", href: "/admin/verifications" },
    { icon: <Users size={22} />, label: "Buyer Requests", count: counts.buyers, color: "#38bdf8", href: "/admin/buyers" },
    { icon: <FileText size={22} />, label: "Documentation", count: counts.documentation, color: "#a78bfa", href: "/admin/documentation" },
    { icon: <UserCheck size={22} />, label: "Agents", count: counts.agents, color: "#22c55e", href: "/admin/agents" },
  ];

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.sub}>Overview of all platform activity</p>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <a href={s.href} key={s.label} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: `${s.color}18`, color: s.color }}>{s.icon}</div>
            <div>
              <div className={styles.statCount}>{s.count}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </a>
        ))}
      </div>

      <div className={styles.section}>
        <h2>Recent Verification Requests</h2>
        {recentVerifications.length === 0 ? (
          <p className={styles.empty}>No verifications submitted yet.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Buyer Name</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentVerifications.map((v) => (
                <tr key={v.id}>
                  <td>{v.buyerName}</td>
                  <td>{v.location}</td>
                  <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
