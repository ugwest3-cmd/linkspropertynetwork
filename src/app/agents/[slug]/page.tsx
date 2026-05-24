import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, CheckCircle, Home, Image as ImageIcon, Share2 } from "lucide-react";
import styles from "./agentProfile.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";

// Optional: if using App Router with async components
export default async function AgentProfilePage({ params }: { params: { slug: string } }) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
    .eq("agentId", agent.uid);
  
  const listings = listingsData || [];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className="container">
          {/* Agent Header */}
          <div className={styles.profileHeader}>
             <div className={styles.avatarPlaceholder}>
                <span className={styles.avatarInitials}>{agent.name.substring(0, 2).toUpperCase()}</span>
             </div>
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
                   <div key={listing.id} className={styles.listingCard}>
                     <div className={styles.imagePlaceholder}>
                       {listing.photos && listing.photos.length > 0 ? (
                         <img src={listing.photos[0]} alt={listing.title} className={styles.image} />
                       ) : (
                         <ImageIcon size={32} color="#cbd5e1" />
                       )}
                       {listing.verified && <span className={styles.verifiedTag}><CheckCircle size={14}/> Verified</span>}
                     </div>
                     <div className={styles.listingBody}>
                       <div className={styles.listingType}>{listing.type}</div>
                       <h3>{listing.title}</h3>
                       <div className={styles.listingLoc}><MapPin size={14}/> {listing.location}</div>
                       <div className={styles.listingPrice}>{listing.price}</div>
                       <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                         <Link
                           href={`/listings/${listing.id}`}
                           className={`btn btn-outline ${styles.listingBtn}`}
                           style={{ padding: "0.5rem", flexShrink: 0 }}
                           title="Share Property"
                         >
                           <Share2 size={16} />
                         </Link>
                         <a
                            href={`https://wa.me/256${agent.phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hello%20${encodeURIComponent(agent.name)}%2C%20I%20am%20interested%20in%20your%20listing:%20${encodeURIComponent(listing.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`btn btn-outline ${styles.listingBtn}`}
                            style={{ flex: 1, justifyContent: "center" }}
                          >
                            Inquire Details
                          </a>
                       </div>
                     </div>
                   </div>
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
