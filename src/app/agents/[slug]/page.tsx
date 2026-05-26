import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, CheckCircle, Home, Share2, Layers, Building2, Tag, MessageCircle } from "lucide-react";
import styles from "./agentProfile.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";

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
  const supabase = await createClient();

  // Fetch Agent
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (agentError || !agent) {
    notFound();
  }

  // Fetch Listings
  const { data: listingsData } = await supabase
    .from("listings")
    .select("*")
    .eq("agentId", agent.uid)
    .eq("verified", true); // only show verified on public profiles
  
  const listings = listingsData || [];

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
                           <MessageCircle size={16} /> Enquire
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
