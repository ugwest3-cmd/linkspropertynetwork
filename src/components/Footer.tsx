"use client";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import styles from "./Footer.module.css";
import { useState } from "react";

export default function Footer() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <footer className={styles.footer}>
      {/* ── Mobile collapsible header bar ── */}
      <div className={styles.mobileBar} onClick={() => setIsOpen((v) => !v)}>
        <div className={styles.mobileBarLogo}>
          <Image src="/logo.png" alt="Links Property Network" width={24} height={24} style={{ objectFit: "contain" }} />
          <span>Links Property Network</span>
        </div>
        <ChevronDown
          size={22}
          strokeWidth={2.5}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </div>

      {/* ── Full footer content (always visible on desktop, collapsible on mobile) ── */}
      <div className={`${styles.footerContent} ${isOpen ? styles.expanded : ""}`}>
        <div className={`container ${styles.grid}`}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Image src="/logo.png" alt="Links Property Network" width={28} height={28} style={{ objectFit: "contain" }} />
              Links Property Network
            </div>
            <p>A private, high-trust ecosystem for serious property buyers and pre-screened agents in Uganda.</p>
          </div>

          {/* Services */}
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link href="/verify">Title Verification</Link></li>
              <li><Link href="/">Property Marketplace</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/find-property">Find a Property</Link></li>
            </ul>
          </div>

          {/* For Agents */}
          <div>
            <h4>For Agents</h4>
            <ul>
              <li><Link href="/agent/register">Agent Registration</Link></li>
              <li><Link href="/agent/login">Agent Login</Link></li>
              <li><Link href="/documentation">Documentation Help</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`https://wa.me/${adminWa}`} target="_blank" rel="noopener noreferrer">
                  <Phone size={14} /> WhatsApp Us
                </a>
              </li>
              <li>
                <a href="mailto:info@linkspropertynetwork.com">
                  <Mail size={14} /> info@linkspropertynetwork.com
                </a>
              </li>
              <li>
                <span><MapPin size={14} /> Kampala, Uganda</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4>Legal</h4>
            <ul style={{ fontSize: "0.85rem", gap: "0.5rem", display: "flex", flexDirection: "column" }}>
              <li><Link href="/terms">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/billing">Billing Policy</Link></li>
              <li><Link href="/candidate-privacy">Candidate Privacy</Link></li>
              <li><Link href="/cookies">Cookie Policy</Link></li>
              <li><Link href="/copyright">Copyright Infringement</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Links Property Network. All rights reserved.</p>
          <p>Uganda&apos;s trusted property verification &amp; agent platform.</p>
        </div>
      </div>
    </footer>
  );
}
