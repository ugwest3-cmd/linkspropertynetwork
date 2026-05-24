"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !window.location.pathname.includes("/admin/login")) {
        router.replace("/admin/login");
      } else if (session && !session.user.email?.includes("admin@") && !window.location.pathname.includes("/admin/login")) {
        // If logged in but not an admin, sign out and redirect
        supabase.auth.signOut();
        router.replace("/admin/login");
      }
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !window.location.pathname.includes("/admin/login")) {
        router.replace("/admin/login");
      } else if (session && !session.user.email?.includes("admin@") && !window.location.pathname.includes("/admin/login")) {
        supabase.auth.signOut();
        router.replace("/admin/login");
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
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
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/admin/login");
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
