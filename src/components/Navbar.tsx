"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import styles from "./Navbar.module.css";
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="Links Property Network" width={32} height={32} style={{ objectFit: 'contain' }} />
          Links Property Network
        </Link>

        <ul className={`${styles.links} ${open ? styles.open : ""}`}>
          <li><Link href="/verify" onClick={() => setOpen(false)}>Verify Title</Link></li>
          <li><Link href="/about" onClick={() => setOpen(false)}>About Us</Link></li>
          <li><Link href="/find-property" onClick={() => setOpen(false)}>Find Property</Link></li>
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
