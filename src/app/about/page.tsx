"use client";
import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Users, ChevronRight, CheckCircle, Home, Layers, Building2, MapPin, Tag, MessageCircle, ArrowRight } from "lucide-react";
import styles from "./about.module.css";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.076-4.522 10.079-10.077.002-2.693-1.043-5.225-2.943-7.127C16.51 1.5 13.985.454 11.29.454c-5.558 0-10.083 4.524-10.086 10.08-.001 1.761.464 3.478 1.347 4.98L1.57 20.87l5.077-1.716zm12.52-5.682c-.3-.15-1.77-.874-2.03-.972-.26-.097-.45-.15-.64.15-.19.3-.73.97-.9 1.16-.17.19-.34.22-.64.07-1.86-.93-3.03-1.64-4.07-3.46-.28-.48.28-.45.81-1.51.09-.19.05-.35-.02-.5-.08-.15-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.35-.26.28-1 1-1 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43 1.77.77 2.86.82 3.88.67 1.01-.15 1.77-.67 2.03-1.35.26-.67.26-1.25.18-1.37-.08-.12-.3-.19-.6-.34z" />
  </svg>
);

type Listing = {
  id: string;
  title: string;
  type: "land" | "house" | "commercial";
  price: string;
  location: string;
  description: string;
  photos: string[];
  agentId: string;
  agentName?: string;
  agentPhone?: string;
};

const TYPE_ICONS: Record<string, React.ReactElement> = {
  land: <Layers size={13} />,
  house: <Home size={13} />,
  commercial: <Building2 size={13} />,
};

const TYPE_LABELS: Record<string, string> = {
  land: "Land / Plot",
  house: "House / Apartment",
  commercial: "Commercial",
};

export default function AboutPage() {
  const adminWa = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "256700000000";
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const supabase = createClient();
        const { data: snap } = await supabase
          .from("listings")
          .select("*")
          .eq("verified", true)
          .order("createdAt", { ascending: false })
          .limit(6);

        const { data: agentsSnap } = await supabase.from("agents").select("*");
        const agentsMap: Record<string, any> = {};
        (agentsSnap || []).forEach((d) => { agentsMap[d.uid] = d; });

        const data = (snap || []).map((d: any) => ({
          ...d,
          agentName: agentsMap[d.agentId]?.name || "LPN Agent",
          agentPhone: agentsMap[d.agentId]?.phone || "",
        })) as Listing[];

        setListings(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingListings(false);
      }
    };
    fetchLatest();
  }, []);

  const waLink = (phone: string, title: string) =>
    `https://wa.me/256${phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hi%2C%20I%20saw%20*${encodeURIComponent(title)}*%20on%20Links%20Property%20Network%20and%20I%20am%20interested.`;

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
              <Link href="/" className="btn btn-primary">
                Browse Properties <ChevronRight size={18} />
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

        {/* === LIVE MARKETPLACE PREVIEW === */}
        <section className={styles.marketSection}>
          <div className="container">
            <div className={styles.marketHeader}>
              <div>
                <span className={styles.marketBadge}>🏡 Live Listings</span>
                <h2>Latest Properties</h2>
                <p>Fresh listings from our verified agent network. Updated in real-time.</p>
              </div>
              <Link href="/" className={`btn btn-outline ${styles.seeAllBtn}`}>
                See All Properties <ArrowRight size={16} />
              </Link>
            </div>

            {loadingListings ? (
              <div className={styles.skeletonGrid}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className={styles.noListings}>
                <p>No listings yet — check back soon or <Link href="/">visit the marketplace</Link>.</p>
              </div>
            ) : (
              <div className={styles.listingsGrid}>
                {listings.map((l) => (
                  <article key={l.id} className={styles.listingCard}>
                    <div className={styles.listingPhoto}>
                      {l.photos?.[0] ? (
                        <img src={l.photos[0]} alt={l.title} />
                      ) : (
                        <div className={styles.noPhoto}><Home size={36} strokeWidth={1} /></div>
                      )}
                      <span className={`${styles.typeBadge} ${styles[`type_${l.type}`]}`}>
                        {TYPE_ICONS[l.type]} {TYPE_LABELS[l.type]}
                      </span>
                    </div>
                    <div className={styles.listingBody}>
                      <h3>{l.title}</h3>
                      <div className={styles.listingMeta}>
                        <span><MapPin size={12} /> {l.location}</span>
                      </div>
                      <p className={styles.listingDesc}>{l.description.slice(0, 90)}{l.description.length > 90 ? "..." : ""}</p>
                      <div className={styles.listingFooter}>
                        <span className={styles.price}><Tag size={13} /> UGX {l.price}</span>
                        <a
                          href={waLink(l.agentPhone || "", l.title)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`btn btn-whatsapp ${styles.waBtn}`}
                        >
                          <WhatsAppIcon size={14} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {listings.length > 0 && (
              <div className={styles.marketFooterCTA}>
                <Link href="/" className="btn btn-primary">
                  View All Listings <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Services */}
        <section className="section">
          <div className="container">
            <div className={styles.sectionHead}>
              <h2>Our Services</h2>
              <p>Everything you need for a safe property transaction in Uganda.</p>
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
            <p>Browse listings, verify a title, or find a property today.</p>
            <div className={styles.heroCTA}>
              <Link href="/" className="btn btn-primary">Browse Marketplace</Link>
              <Link href="/verify" className="btn btn-outline" style={{ borderColor: "white", color: "white" }}>Verify a Title</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
