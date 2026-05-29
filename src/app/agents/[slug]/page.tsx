import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, CheckCircle, Home, Share2, Layers, Building2, Tag, MessageCircle } from "lucide-react";
import styles from "./agentProfile.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.45 5.556 0 10.076-4.522 10.079-10.077.002-2.693-1.043-5.225-2.943-7.127C16.51 1.5 13.985.454 11.29.454c-5.558 0-10.083 4.524-10.086 10.08-.001 1.761.464 3.478 1.347 4.98L1.57 20.87l5.077-1.716zm12.52-5.682c-.3-.15-1.77-.874-2.03-.972-.26-.097-.45-.15-.64.15-.19.3-.73.97-.9 1.16-.17.19-.34.22-.64.07-1.86-.93-3.03-1.64-4.07-3.46-.28-.48.28-.45.81-1.51.09-.19.05-.35-.02-.5-.08-.15-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.35-.26.28-1 1-1 2.45 0 1.45 1.05 2.85 1.2 3.05.15.2 2.07 3.16 5.01 4.43 1.77.77 2.86.82 3.88.67 1.01-.15 1.77-.67 2.03-1.35.26-.67.26-1.25.18-1.37-.08-.12-.3-.19-.6-.34z" />
  </svg>
);

const TYPE_ICONS = {
  land: <Layers size={15} />,
  house: <Home size={15} />,
  commercial: <Building2 size={15} />,
};

const TYPE_LABELS = {
  land: "Land / Plot",
  house: "House / Apartment",
  commercial: "Commercial",
};

export default async function AgentProfilePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Support both Promise and plain params for different Next.js versions
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  let agent = null;
  let listings: any[] = [];

  try {
    const supabase = await createClient();

    // Fetch Agent
    const { data: agentData, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("slug", slug)
      .eq("status", "approved")
      .single();

    if (agentError || !agentData) {
      notFound();
    }
    
    agent = agentData;

    // Fetch Listings
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*")
      .eq("agentId", agent.uid)
      .eq("verified", true); // only show verified on public profiles
    
    listings = listingsData || [];
  } catch (err) {
    console.error("Error loading agent profile:", err);
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Agent Header */}
          <div className={styles.profileHeader}>
             {agent.photo ? (
               <img src={agent.photo} alt={agent.name} className={styles.profileAvatar} />
             ) : (
               <div className={styles.avatarPlaceholder}>
                  <span className={styles.avatarInitials}>{agent.name.substring(0, 2).toUpperCase()}</span>
               </div>
             )}
             <div className={styles.info}>
                <div className={styles.titleRow}>
                  <h1>{agent.name}</h1>
                  <span className={styles.verifiedBadge}><CheckCircle size={16}/> Verified Agent</span>
                </div>
                <div className={styles.meta}>
                   <span><MapPin size={16}/> {agent.areasServed}</span>
                </div>
                <p className={styles.bio}>{agent.bio}</p>
                <div className={styles.actions}>
                  <a
                    href={`https://wa.me/256${agent.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(agent.name)}%2C%20I%20found%20your%20profile%20on%20Links%20Property%20Network`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                  >
                    <Phone size={18} /> Chat on WhatsApp
                  </a>
                </div>
             </div>
          </div>

          {/* Listings */}
          <div className={styles.listingsSection}>
            <h2>Verified Listings ({listings.length})</h2>
            {listings.length === 0 ? (
               <div className={styles.emptyListings}>
                 <Home size={32} color="var(--text-muted)" />
                 <p>This agent hasn&apos;t added any public listings yet.</p>
               </div>
            ) : (
               <div className={styles.grid}>
                 {listings.map(listing => (
                   <article key={listing.id} className={styles.card}>
                     {/* Image area with floating badge ABOVE it */}
                     <Link href={`/listings/${listing.id}`} className={styles.cardImageWrap}>
                       {/* Badge sits at the top-left, overlapping the image */}
                       <span className={`${styles.typeBadge} ${styles[`type_${listing.type}`]}`}>
                         {TYPE_ICONS[listing.type as keyof typeof TYPE_ICONS] || <Home size={15} />}&nbsp;
                         {TYPE_LABELS[listing.type as keyof typeof TYPE_LABELS] || listing.type}
                       </span>
                       <div className={styles.cardPhoto}>
                         {listing.photos?.[0] ? (
                           <img src={listing.photos[0]} alt={listing.title} loading="lazy" />
                         ) : (
                           <div className={styles.noPhoto}><Home size={40} strokeWidth={1} /></div>
                         )}
                       </div>
                     </Link>

                     {/* Card body */}
                     <div className={styles.cardBody}>
                       <Link href={`/listings/${listing.id}`} className={styles.cardLink}>
                         <h2 className={styles.cardTitle}>{listing.title}</h2>
                         <div className={styles.cardLocation}>
                           <MapPin size={13} /> {listing.location}
                         </div>
                         {listing.description && (
                           <p className={styles.cardDesc}>{listing.description}</p>
                         )}
                       </Link>

                       <hr className={styles.cardDivider} />

                       <div className={styles.cardFooter}>
                         <span className={styles.cardPrice}>
                           <Tag size={15} /> UGX {listing.price}
                         </span>
                         <a
                           href={`https://wa.me/256${agent.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(agent.name)}%2C%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(listing.title)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={styles.enquireBtn}
                         >
                           <WhatsAppIcon size={16} /> WhatsApp
                         </a>
                       </div>
                     </div>
                   </article>
                 ))}
               </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
