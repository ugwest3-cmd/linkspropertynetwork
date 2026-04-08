import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image src="/logo.png" alt="Links Property Network" width={28} height={28} style={{ objectFit: 'contain' }} />
            Links Property Network
          </div>
          <p>A private, high-trust ecosystem for serious property buyers and pre-screened agents in Uganda.</p>
        </div>

        <div>
          <h4>Services</h4>
          <ul>
            <li><Link href="/verify">Title Verification</Link></li>
            <li><Link href="/find-property">Find a Property</Link></li>
            <li><Link href="/documentation">Documentation Help</Link></li>
            <li><Link href="/agent/register">Agent Tools</Link></li>
          </ul>
        </div>

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
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Links Property Network. All rights reserved.</p>
        <p>Private platform · Not a public marketplace</p>
      </div>
    </footer>
  );
}
