"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import styles from "./Navbar.module.css";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="Links Property Network" width={32} height={32} style={{ objectFit: 'contain' }} />
          Links Property Network
        </Link>

        <ul className={`${styles.links} ${open ? styles.open : ""}`}>
          <li><Link href="/verify" onClick={() => setOpen(false)}>Verify Title</Link></li>
          <li><Link href="/find-property" onClick={() => setOpen(false)}>Find Property</Link></li>
          <li><Link href="/documentation" onClick={() => setOpen(false)}>Documentation</Link></li>
          <li><Link href="/agent/register" onClick={() => setOpen(false)}>Agent Tools</Link></li>
          {user ? (
            <li><Link href="/agent/dashboard" className={styles.dashboardLink} onClick={() => setOpen(false)}><LayoutDashboard size={18}/> Dashboard</Link></li>
          ) : (
            <li><Link href="/agent/login" className={styles.loginLink} onClick={() => setOpen(false)}><LogIn size={18}/> Login</Link></li>
          )}
          <li>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP}?text=Hello%20Links%20Property%20Network`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={() => setOpen(false)}
            >
              Chat on WhatsApp
            </a>
          </li>
        </ul>

        <button className={styles.toggle} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
