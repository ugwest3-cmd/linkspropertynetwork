"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, User } from "lucide-react";
import styles from "./BottomNav.module.css";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === "/" ? styles.active : ""}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      
      <Link href="/find-property" className={`${styles.navItem} ${pathname === "/find-property" ? styles.active : ""}`}>
        <Search size={24} />
        <span>Search</span>
      </Link>

      <Link href="/agent/dashboard/add-listing" className={`${styles.navItem} ${styles.postItem} ${pathname === "/agent/dashboard/add-listing" ? styles.active : ""}`}>
        <div className={styles.postIconWrapper}>
          <PlusSquare size={24} />
        </div>
        <span>Post</span>
      </Link>

      <Link href="/agent/dashboard" className={`${styles.navItem} ${pathname.startsWith("/agent/dashboard") && pathname !== "/agent/dashboard/add-listing" ? styles.active : ""}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
    </div>
  );
}
