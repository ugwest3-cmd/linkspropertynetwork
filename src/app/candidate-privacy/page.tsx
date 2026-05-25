import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CandidatePrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "var(--secondary)" }}>Candidate Privacy Policy</h1>
        <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <br />
          <h2>1. Scope</h2>
          <p>This policy applies to individuals who apply for employment or partnership opportunities directly with Links Property Network.</p>
          <br />
          <h2>2. Information We Collect</h2>
          <p>We collect resumes, contact details, identification documents, and interview notes to evaluate your suitability for a role.</p>
          <br />
          <h2>3. Retention</h2>
          <p>If your application is unsuccessful, we may retain your details for up to 12 months for future opportunities unless you request deletion.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
