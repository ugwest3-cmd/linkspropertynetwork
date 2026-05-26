"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User, LayoutGrid, ChevronDown } from "lucide-react";
import styles from "./BottomNav.module.css";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const [isAgent, setIsAgent] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAgent(true);
    });
  }, []);

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Backdrop — closes drawer on outside tap */}
      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-up nav drawer */}
      <nav className={`${styles.bottomNav} ${isOpen ? styles.open : ""}`}>
        {/* Drag handle */}
        <div className={styles.handle} />

        <div className={styles.navItems}>
          <Link
            href="/"
            className={`${styles.navItem} ${isActive("/") ? styles.active : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Home size={22} strokeWidth={isActive("/") ? 2.5 : 1.8} />
            <span>Home</span>
          </Link>

          <Link
            href="/find-property"
            className={`${styles.navItem} ${isActive("/find-property") ? styles.active : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <Search size={22} strokeWidth={isActive("/find-property") ? 2.5 : 1.8} />
            <span>Search</span>
          </Link>

          <Link
            href="/agent/dashboard/add-listing"
            className={`${styles.navItem} ${styles.postItem} ${isActive("/agent/dashboard/add-listing") ? styles.active : ""}`}
            onClick={() => setIsOpen(false)}
          >
            <PlusCircle size={22} strokeWidth={2} />
            <span>Post</span>
          </Link>

          {isAgent ? (
            <Link
              href="/agent/dashboard"
              className={`${styles.navItem} ${isActive("/agent/dashboard") && !isActive("/agent/dashboard/add-listing") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <LayoutGrid size={22} strokeWidth={isActive("/agent/dashboard") ? 2.5 : 1.8} />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/agent/login"
              className={`${styles.navItem} ${isActive("/agent/login") ? styles.active : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <User size={22} strokeWidth={1.8} />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Floating toggle button — Jiji chevron style */}
      <button
        className={`${styles.toggleBtn} ${isOpen ? styles.toggleOpen : ""}`}
        onClick={toggle}
        aria-label="Toggle navigation"
      >
        <ChevronDown size={20} strokeWidth={2.5} />
      </button>
    </>
  );
}
