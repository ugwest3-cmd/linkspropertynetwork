"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
  };

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="Links Property Network" width={32} height={32} style={{ objectFit: 'contain' }} />
          Links Property Network
        </Link>

        <ul className={`${styles.links} ${open ? styles.open : ""}`}>
          <li><Link href="/find-property" onClick={() => setOpen(false)}>Find Property</Link></li>
          <li><Link href="/verify" onClick={() => setOpen(false)}>Verify Title</Link></li>
          <li><Link href="/about" onClick={() => setOpen(false)}>About Us</Link></li>
          
          {session && (
            <>
              <li><Link href={session.user?.email?.includes("admin@") ? "/admin" : "/agent/dashboard"} onClick={() => setOpen(false)}>Dashboard</Link></li>
              <li>
                <button onClick={handleSignOut} className={styles.logoutBtn}>
                  <LogOut size={16} /> Sign Out
                </button>
              </li>
            </>
          )}

          <li>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000"}?text=Hello%20Links%20Property%20Network`}
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
