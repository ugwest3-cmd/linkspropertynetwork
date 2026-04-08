import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FileText, CheckCircle, ChevronRight, Scale, Ruler } from "lucide-react";
import styles from "./doc.module.css";

const steps = [
  { n: "01", title: "Property Identification", desc: "Work with your agent to identify the exact plot or house. Confirm location, size, and seller identity." },
  { n: "02", title: "Title Verification", desc: "Submit the title to our verification team. Receive a Verified or Flagged report within 1–3 days." },
  { n: "03", title: "Sale Agreement", desc: "A vetted lawyer drafts or reviews the sale agreement between buyer and seller." },
  { n: "04", title: "Land Survey", desc: "A licensed surveyor confirms boundaries and size of the property (especially for land)." },
  { n: "05", title: "Payment & Transfer", desc: "Payment is made per agreement. Transfer documents are signed and submitted to lands office." },
  { n: "06", title: "Title Deed Issuance", desc: "The new title deed is issued in the buyer's name. Congratulations — you're a property owner!" },
];

const professionals = [
  { icon: <Scale size={22} />, label: "Vetted Lawyers", desc: "Registered advocates who specialize in property transfers." },
  { icon: <Ruler size={22} />, label: "Licensed Surveyors", desc: "Certified surveyors to confirm plot dimensions and boundaries." },
];

export default function DocumentationPage() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroIcon}><FileText size={32} /></div>
            <h1>Documentation Concierge</h1>
            <p>We guide you through every step of the Ugandan property buying process — from agreement to title deed — connecting you with vetted lawyers and surveyors.</p>
            <div className={styles.fee}>Flat fee: UGX 200,000 – 800,000 per transaction</div>
          </div>
        </section>

        {/* Steps */}
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <h2>The 6-Step Process</h2>
              <p>We track every step and notify you via WhatsApp at each milestone.</p>
            </div>
            <div className={styles.steps}>
              {steps.map((s) => (
                <div className={styles.step} key={s.n}>
                  <div className={styles.stepNum}>{s.n}</div>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professionals */}
        <section className={styles.proSection}>
          <div className="container">
            <div className={styles.sectionHead}>
              <h2>Our Professional Network</h2>
              <p>Every professional in our network is vetted, registered, and experienced in Ugandan property law.</p>
            </div>
            <div className={styles.proGrid}>
              {professionals.map((p) => (
                <div className={styles.proCard} key={p.label}>
                  <div className={styles.proIcon}>{p.icon}</div>
                  <h3>{p.label}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="container">
            <div className={styles.ctaBox}>
              <div>
                <h2>Ready to start your documentation?</h2>
                <p>Start with a title verification, then activate documentation support from your dashboard.</p>
              </div>
              <div className={styles.ctaBtns}>
                <Link href="/verify" className="btn btn-primary">
                  Verify Title First <ChevronRight size={18} />
                </Link>
                <a
                  href={`https://wa.me/${adminWa}?text=I%20need%20documentation%20help%20for%20my%20property`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                >
                  <CheckCircle size={18} /> Chat With Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
