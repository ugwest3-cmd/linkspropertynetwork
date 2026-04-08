import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Users, FileText, TrendingUp, ChevronRight, CheckCircle } from "lucide-react";
import styles from "./Home.module.css";

export default function HomePage() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  const services = [
    {
      icon: <ShieldCheck size={28} />,
      title: "Title Verification",
      desc: "Submit your property details and we verify the title. Get a full report in 1–3 business days.",
      href: "/verify",
      price: "From UGX 50,000",
      color: "#f97316",
    },
    {
      icon: <Users size={28} />,
      title: "Serious Buyer Brokerage",
      desc: "Tell us what you're looking for. We match you with 1–3 pre-screened agents via WhatsApp.",
      href: "/find-property",
      price: "1–5% commission on close",
      color: "#38bdf8",
    },
    {
      icon: <FileText size={28} />,
      title: "Documentation Concierge",
      desc: "Step-by-step legal & admin guidance. We connect you with vetted lawyers and surveyors.",
      href: "/documentation",
      price: "From UGX 200,000",
      color: "#a78bfa",
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Agent Tools",
      desc: "Get a shareable profile page with verified listings and WhatsApp CTA buttons. No website needed.",
      href: "/agent/register",
      price: "From UGX 50,000 / month",
      color: "#22c55e",
    },
  ];

  const trust = [
    "Manual human verification — no automated guesses",
    "Pre-screened agents with verified social presence & NIN",
    "WhatsApp-first communication for instant response",
    "Private platform — serious buyers only",
    "Flat-fee and commission-based transparency",
    "Land Price Intelligence available for premium subscribers",
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroTag}>🇺🇬 Uganda&apos;s Most Trusted Property Platform</div>
            <h1 className={styles.heroTitle}>
              Buy Property in Uganda<br />
              <span className={styles.highlight}>With Full Confidence</span>
            </h1>
            <p className={styles.heroSub}>
              Title verification, legal documentation, and vetted agent matching — all in one private, high-trust network. WhatsApp-first. Manual. Reliable.
            </p>
            <div className={styles.heroCTA}>
              <Link href="/verify" className="btn btn-primary">
                Verify a Title Now <ChevronRight size={18} />
              </Link>
              <a
                href={`https://wa.me/${adminWa}?text=Hello%2C%20I%20want%20to%20find%20a%20property`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
              >
                Chat on WhatsApp
              </a>
            </div>
            <div className={styles.heroStats}>
              <div><strong>50k–300k</strong><span>Verification Fee (UGX)</span></div>
              <div><strong>1–3 days</strong><span>Report turnaround</span></div>
              <div><strong>100%</strong><span>Human verified</span></div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <h2>Our Services</h2>
              <p>Four modules. One trusted platform. Every step of your property journey covered.</p>
            </div>
            <div className={styles.servicesGrid}>
              {services.map((s) => (
                <Link href={s.href} key={s.title} className={styles.serviceCard}>
                  <div className={styles.serviceIcon} style={{ color: s.color, background: `${s.color}15` }}>
                    {s.icon}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className={styles.servicePrice}>{s.price}</div>
                  <div className={styles.serviceLink}>
                    Learn more <ChevronRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className={styles.trustSection}>
          <div className="container">
            <div className={styles.trustGrid}>
              <div>
                <h2>Why Links Property Network?</h2>
                <p className={styles.trustSub}>
                  Real estate fraud in Uganda costs buyers millions every year. We built a system that puts trust, verification, and human review at the center of every deal.
                </p>
                <a
                  href={`https://wa.me/${adminWa}?text=I%20want%20to%20learn%20more%20about%20Links%20Property%20Network`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Talk to Our Team
                </a>
              </div>
              <ul className={styles.trustList}>
                {trust.map((item) => (
                  <li key={item}>
                    <CheckCircle size={18} color="var(--success)" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className={styles.ctaBanner}>
          <div className="container" style={{ textAlign: "center" }}>
            <h2>Ready to start your property journey?</h2>
            <p>Submit a verification request or find property today. Our team responds within hours.</p>
            <div className={styles.heroCTA}>
              <Link href="/verify" className="btn btn-primary">Verify a Title</Link>
              <Link href="/find-property" className="btn btn-outline" style={{ borderColor: "white", color: "white" }}>Find Property</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
