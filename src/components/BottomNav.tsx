"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User, LayoutGrid } from "lucide-react";
import styles from "./BottomNav.module.css";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAgent(true);
    });
  }, []);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${isActive("/") ? styles.active : ""}`}>
        <Home size={22} strokeWidth={isActive("/") ? 2.5 : 1.8} />
        <span>Home</span>
      </Link>

      <Link href="/find-property" className={`${styles.navItem} ${isActive("/find-property") ? styles.active : ""}`}>
        <Search size={22} strokeWidth={isActive("/find-property") ? 2.5 : 1.8} />
        <span>Search</span>
      </Link>

      {/* Post — styled like other items with orange accent */}
      <Link
        href="/agent/dashboard/add-listing"
        className={`${styles.navItem} ${styles.postItem} ${isActive("/agent/dashboard/add-listing") ? styles.active : ""}`}
      >
        <PlusCircle size={22} strokeWidth={2} />
        <span>Post</span>
      </Link>

      {isAgent ? (
        <Link
          href="/agent/dashboard"
          className={`${styles.navItem} ${isActive("/agent/dashboard") && !isActive("/agent/dashboard/add-listing") ? styles.active : ""}`}
        >
          <LayoutGrid size={22} strokeWidth={isActive("/agent/dashboard") ? 2.5 : 1.8} />
          <span>Dashboard</span>
        </Link>
      ) : (
        <Link href="/agent/login" className={`${styles.navItem} ${isActive("/agent/login") ? styles.active : ""}`}>
          <User size={22} strokeWidth={1.8} />
          <span>Sign In</span>
        </Link>
      )}
    </nav>
  );
}
