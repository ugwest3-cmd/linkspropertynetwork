"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { User, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="Links Property Network" width={28} height={28} style={{ objectFit: 'contain' }} />
          <span>Links Property Network</span>
        </Link>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className={styles.desktopLinks}>
          <Link href="/find-property" className={styles.navLink}>Find Property</Link>
          <Link href="/verify" className={styles.navLink}>Verify Title</Link>
          
          {session ? (
            <Link href={session.user?.email?.includes("admin@") ? "/admin" : "/agent/dashboard"} className={styles.navLink}>
              <User size={18} /> Dashboard
            </Link>
          ) : (
            <Link href="/agent/login" className={styles.navLink}>
              <User size={18} /> Sign In
            </Link>
          )}

          <Link href="/agent/dashboard/add-listing" className={`btn btn-primary ${styles.postBtn}`}>
            <PlusCircle size={18} /> Post your property
          </Link>
        </div>
      </div>
    </nav>
  );
}
