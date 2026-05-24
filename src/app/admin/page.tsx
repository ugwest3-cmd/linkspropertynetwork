"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Users, FileText, UserCheck } from "lucide-react";
import styles from "./dashboard.module.css";

type CountsType = { verifications: number; buyers: number; documentation: number; agents: number };

export default function AdminDashboard() {
  const [counts, setCounts] = useState<CountsType>({ verifications: 0, buyers: 0, documentation: 0, agents: 0 });
  const [recentVerifications, setRecentVerifications] = useState<{id: string; buyerName: string; location: string; status: string; createdAt: unknown}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const [v, b, d, a] = await Promise.all([
        supabase.from("verifications").select("*", { count: "exact", head: true }),
        supabase.from("buyerRequests").select("*", { count: "exact", head: true }),
        supabase.from("documentationCases").select("*", { count: "exact", head: true }),
        supabase.from("agents").select("*", { count: "exact", head: true }),
      ]);
      setCounts({ 
        verifications: v.count || 0, 
        buyers: b.count || 0, 
        documentation: d.count || 0, 
        agents: a.count || 0 
      });

      const { data: recent } = await supabase
        .from("verifications")
        .select("*")
        .order("createdAt", { ascending: false })
        .limit(5);
        
      setRecentVerifications(recent || []);
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
