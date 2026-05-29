"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, MapPin, Home, Layers, Building2, X, Filter, MessageCircle, Tag } from "lucide-react";
import Link from "next/link";
import styles from "./Home.module.css";
import { UGANDA_LOCATIONS } from "@/lib/constants";

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
  land: <Layers size={15} />,
  house: <Home size={15} />,
  commercial: <Building2 size={15} />,
};

const TYPE_LABELS = {
  land: "Land / Plot",
  house: "House / Apartment",
  commercial: "Commercial",
};

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" fillRule="evenodd" clipRule="evenodd" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.455 3.473 1.324 4.978L2.012 22l5.197-1.363a9.932 9.932 0 0 0 4.803 1.233c5.506 0 9.988-4.482 9.988-9.988 0-5.506-4.482-9.988-9.988-9.988zm4.848 13.911c-.247.694-1.229 1.265-1.954 1.341-.497.051-1.147.091-3.324-.81-2.784-1.151-4.587-3.987-4.726-4.172-.14-.185-1.127-1.5-1.127-2.861 0-1.361.714-2.029.967-2.296.254-.267.551-.334.736-.334.185 0 .368.002.53.01.171.008.398-.065.623.477.23.555.787 1.916.856 2.055.069.139.115.301.022.486-.092.185-.138.301-.277.463-.139.162-.292.361-.416.483-.139.137-.284.287-.123.564.161.277.719 1.186 1.541 1.918.822.732 1.516.957 1.838 1.096.322.139.507.115.694-.092.185-.208.809-.942 1.023-1.265.215-.324.43-.277.721-.169.292.108 1.85.874 2.172 1.036.322.162.538.243.619.381.081.139.081.809-.166 1.503z" />
  </svg>
);

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const checkAuthCode = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error("Auth code exchange error:", error);
        }
      }
    };
    checkAuthCode();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const supabase = createClient();
        const { data: rawListings, error: listingsError } = await supabase
          .from("listings")
          .select("*")
          .eq("verified", true)
          .order("createdAt", { ascending: false });

        if (listingsError) throw listingsError;

        const { data: agentsData, error: agentsError } = await supabase.from("agents").select("*");
        if (agentsError) throw agentsError;

        const agentsMap: Record<string, any> = {};
        agentsData.forEach((d) => { agentsMap[d.uid] = d; });

        const enriched = (rawListings || []).map((l: any) => ({
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

  useEffect(() => {
    let results = listings;
    if (typeFilter !== "all") results = results.filter((l) => l.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (l) => l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
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

  const FilterPanel = () => (
    <div className={styles.filterPanel}>
      <h3 className={styles.filterTitle}>Filters</h3>
      <div className={styles.filterGroup}>
        <label>Location</label>
        <div className={styles.inputWrapper}>
          <MapPin size={16} />
          <select 
            value={locationFilter} 
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: '0.85rem 0', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--foreground)' }}
          >
            <option value="">All Locations</option>
            {UGANDA_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.filterGroup}>
        <label>Min Price (UGX)</label>
        <div className={styles.inputWrapper}>
          <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>UGX</span>
          <input type="number" placeholder="e.g. 50000000" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        </div>
      </div>
      <div className={styles.filterGroup}>
        <label>Max Price (UGX)</label>
        <div className={styles.inputWrapper}>
          <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>UGX</span>
          <input type="number" placeholder="e.g. 200000000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
      </div>
      <button className={`btn btn-primary ${styles.applyBtn}`} onClick={() => setShowMobileFilters(false)}>Apply Filters</button>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className={styles.mainLayout}>
        <div className={`container ${styles.layoutContainer}`}>

          {/* Desktop Sidebar */}
          <aside className={styles.desktopSidebar}>
            <FilterPanel />
          </aside>

          {/* Main Content */}
          <div className={styles.mainContent}>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="I am looking for..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
                {search && <button onClick={() => setSearch("")} className={styles.clearBtn}><X size={16} /></button>}
              </div>
              <button className={styles.mobileFilterToggle} onClick={() => setShowMobileFilters(!showMobileFilters)}>
                <Filter size={18} />
              </button>
            </div>

            {showMobileFilters && <div className={styles.mobileFilters}><FilterPanel /></div>}

            {/* Categories */}
            <div className={styles.categoriesWrapper}>
              <div className={styles.categoriesList}>
                <button className={`${styles.categoryBtn} ${typeFilter === "all" ? styles.active : ""}`} onClick={() => setTypeFilter("all")}>
                  <div className={styles.catIcon}><Search size={20} /></div>
                  <span>All</span>
                </button>
                {(["land", "house", "commercial"] as const).map((t) => (
                  <button key={t} className={`${styles.categoryBtn} ${typeFilter === t ? styles.active : ""}`} onClick={() => setTypeFilter(t)}>
                    <div className={styles.catIcon}>{TYPE_ICONS[t]}</div>
                    <span>{TYPE_LABELS[t]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listings */}
            <div className={styles.feed}>
              {loading ? (
                <div className={styles.loadingGrid}>
                  {[...Array(6)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className={styles.empty}>
                  <Home size={48} strokeWidth={1} />
                  <h3>No listings found</h3>
                  <p>Try adjusting your filters.</p>
                </div>
              ) : (
                <div className={styles.cards}>
                  {filtered.map((listing) => (
                    <article key={listing.id} className={styles.card}>

                      {/* Image area with floating badge ABOVE it */}
                      <Link href={`/listings/${listing.id}`} className={styles.cardImageWrap}>
                        {/* Badge sits at the top-left, overlapping the image */}
                        <span className={`${styles.typeBadge} ${styles[`type_${listing.type}`]}`}>
                          {TYPE_ICONS[listing.type]}&nbsp;{TYPE_LABELS[listing.type]}
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
                          {listing.agentPhone ? (
                            <a
                              href={waLink(listing.agentPhone, listing.title)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.enquireBtn}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <WhatsAppIcon size={16} /> WhatsApp
                            </a>
                          ) : (
                            <Link href={`/listings/${listing.id}`} className={styles.enquireBtn}>
                              <WhatsAppIcon size={16} /> WhatsApp
                            </Link>
                          )}
                        </div>
                      </div>

                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
