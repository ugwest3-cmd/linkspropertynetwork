"use client";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Tag, Home, Layers, Building2, SlidersHorizontal, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import styles from "./Home.module.css";

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
  agentSlug?: string;
  createdAt: any;
};

const TYPE_ICONS = {
  land: <Layers size={14} />,
  house: <Home size={14} />,
  commercial: <Building2 size={14} />,
};

const TYPE_LABELS = {
  land: "Land / Plot",
  house: "House / Apartment",
  commercial: "Commercial",
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fetch verified listings
        const listingsSnap = await getDocs(
          query(
            collection(db, "listings"),
            where("verified", "==", true),
            orderBy("createdAt", "desc")
          )
        );

        const rawListings = listingsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Listing[];

        // Fetch all agents to enrich listings with agent info
        const agentsSnap = await getDocs(collection(db, "agents"));
        const agentsMap: Record<string, any> = {};
        agentsSnap.docs.forEach((d) => {
          agentsMap[d.id] = d.data();
        });

        const enriched = rawListings.map((l) => ({
          ...l,
          agentName: agentsMap[l.agentId]?.name || "LPN Agent",
          agentPhone: agentsMap[l.agentId]?.phone || "",
          agentSlug: agentsMap[l.agentId]?.slug || "",
        }));

        setListings(enriched);
        setFiltered(enriched);
      } catch (err) {
        console.error("Error fetching marketplace listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Filter + search
  useEffect(() => {
    let results = listings;

    if (typeFilter !== "all") {
      results = results.filter((l) => l.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    if (locationFilter.trim()) {
      const lq = locationFilter.toLowerCase();
      results = results.filter((l) => l.location.toLowerCase().includes(lq));
    }

    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice.replace(/\D/g, ""), 10) : 0;
      const max = maxPrice ? parseInt(maxPrice.replace(/\D/g, ""), 10) : Infinity;
      results = results.filter((l) => {
        const val = parseInt(l.price.replace(/\D/g, ""), 10) || 0;
        return val >= min && val <= max;
      });
    }

    setFiltered(results);
  }, [search, typeFilter, minPrice, maxPrice, locationFilter, listings]);

  const waLink = (phone: string, title: string) =>
    `https://wa.me/256${phone.replace(/^0/, "").replace(/\s/g, "")}?text=Hi%2C%20I%20saw%20your%20listing%20on%20Links%20Property%20Network%3A%20*${encodeURIComponent(title)}*%20and%20I%20am%20interested.%20Please%20tell%20me%20more.`;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Banner */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <span className={styles.heroBadge}>🏡 Live Listings</span>
              <h1>Property Marketplace</h1>
              <p>Browse verified real estate listings posted by our network of trusted agents across Uganda.</p>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by location, title, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button onClick={() => setSearch("")} className={styles.clearBtn}>
                  <X size={16} />
                </button>
              )}
              <button
                className={styles.filterToggle}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className={styles.advancedFilters}>
                <div className={styles.filterGroup}>
                  <label>Property Type</label>
                  <div className={styles.filterPills}>
                    {(["all", "land", "house", "commercial"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`${styles.pill} ${typeFilter === t ? styles.pillActive : ""}`}
                      >
                        {t === "all" ? "All Types" : TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.filterGroupRow}>
                  <div className={styles.filterGroup}>
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Kampala, Kira..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className={styles.filterInput}
                    />
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Min Price (UGX)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className={styles.filterInput}
                    />
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Max Price (UGX)</label>
                    <input
                      type="number"
                      placeholder="e.g. 200000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className={styles.filterInput}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Listings Grid */}
        <section className={`container ${styles.grid}`}>
          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeleton} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <Home size={48} strokeWidth={1} />
              <h3>No listings found</h3>
              <p>{listings.length === 0 ? "No verified properties yet. Check back soon!" : "Try adjusting your filters."}</p>
            </div>
          ) : (
            <>
              <div className={styles.resultsBar}>
                <span><strong>{filtered.length}</strong> propert{filtered.length === 1 ? "y" : "ies"} found</span>
              </div>
              <div className={styles.cards}>
                {filtered.map((listing) => (
                  <article key={listing.id} className={styles.card}>
                    {/* Photo */}
                    <div className={styles.cardPhoto}>
                      {listing.photos?.[0] ? (
                        <img src={listing.photos[0]} alt={listing.title} />
                      ) : (
                        <div className={styles.noPhoto}>
                          <Home size={40} strokeWidth={1} />
                        </div>
                      )}
                      <span className={`${styles.typeBadge} ${styles[`type_${listing.type}`]}`}>
                        {TYPE_ICONS[listing.type]} {TYPE_LABELS[listing.type]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardTitle}>{listing.title}</h2>

                      <div className={styles.cardMeta}>
                        <span className={styles.location}>
                          <MapPin size={13} /> {listing.location}
                        </span>
                      </div>

                      <p className={styles.cardDesc}>{listing.description.slice(0, 100)}{listing.description.length > 100 ? "..." : ""}</p>

                      <div className={styles.cardFooter}>
                        <div className={styles.price}>
                          <Tag size={14} />
                          <span>UGX {listing.price}</span>
                        </div>

                        <div className={styles.cardActions}>
                          {listing.agentSlug && (
                            <Link href={`/agents/${listing.agentSlug}`} className={styles.viewAgent}>
                              View Agent
                            </Link>
                          )}
                          <a
                            href={waLink(listing.agentPhone || "", listing.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`btn btn-whatsapp ${styles.waBtn}`}
                          >
                            <MessageCircle size={15} /> Enquire
                          </a>
                        </div>
                      </div>

                      {listing.agentName && (
                        <div className={styles.agentLine}>
                          <span className={styles.agentDot} />
                          Posted by <strong>{listing.agentName}</strong>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
