import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, CheckCircle, Home, Share2, Layers, Building2, Tag, MessageCircle } from "lucide-react";
import styles from "./agentProfile.module.css";
import { formatPrice } from "@/lib/constants";
import { notFound } from "next/navigation";
import Link from "next/link";

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" fillRule="evenodd" clipRule="evenodd" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.473 1.324 4.978L2.012 22l5.197-1.363a9.932 9.932 0 0 0 4.803 1.233c5.506 0 9.988-4.482 9.988-9.988 0-5.506-4.482-9.988-9.988-9.988zm4.848 13.911c-.247.694-1.229 1.265-1.954 1.341-.497.051-1.147.091-3.324-.81-2.784-1.151-4.587-3.987-4.726-4.172-.14-.185-1.127-1.5-1.127-2.861 0-1.361.714-2.029.967-2.296.254-.267.551-.334.736-.334.185 0 .368.002.53.01.171.008.398-.065.623.477.23.555.787 1.916.856 2.055.069.139.115.301.022.486-.092.185-.138.301-.277.463-.139.162-.292.361-.416.483-.139.137-.284.287-.123.564.161.277.719 1.186 1.541 1.918.822.732 1.516.957 1.838 1.096.322.139.507.115.694-.092.185-.208.809-.942 1.023-1.265.215-.324.43-.277.721-.169.292.108 1.85.874 2.172 1.036.322.162.538.243.619.381.081.139.081.809-.166 1.503z" />
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
                           <Tag size={15} /> UGX {formatPrice(listing.price)}
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
