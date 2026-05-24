"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Users, FileText, UserCheck, LogOut, LayoutDashboard, LayoutList } from "lucide-react";
import styles from "./adminLayout.module.css";

const navItems = [
  { href: "/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { href: "/admin/verifications", icon: <ShieldCheck size={18} />, label: "Verifications" },
  { href: "/admin/buyers", icon: <Users size={18} />, label: "Buyer Requests" },
  { href: "/admin/agents", icon: <UserCheck size={18} />, label: "Agents" },
  { href: "/admin/listings", icon: <LayoutList size={18} />, label: "Listings" },
  { href: "/admin/documentation", icon: <FileText size={18} />, label: "Documentation" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user && !window.location.pathname.includes("/admin/login")) {
        router.replace("/admin/login");
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) return <div className={styles.loading}>Loading...</div>;

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="LPN" width={24} height={24} style={{ objectFit: 'contain' }} />
          <span>LPN Admin</span>
        </div>
        <nav className={styles.sideNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className={styles.logout}
          onClick={() => signOut(auth).then(() => router.push("/admin/login"))}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
