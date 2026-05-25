import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CopyrightPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "var(--secondary)" }}>Copyright Infringement Policy</h1>
        <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <br />
          <h2>1. Reporting Infringement</h2>
          <p>Links Property Network respects intellectual property rights. If you believe your copyrighted work (such as property photos) has been uploaded without authorization, please contact us immediately.</p>
          <br />
          <h2>2. Required Information</h2>
          <p>To process a takedown request, please provide: the URL of the infringing listing, proof of original ownership, and your contact information.</p>
          <br />
          <h2>3. Counter-Notices</h2>
          <p>Agents who believe their content was wrongly removed may submit a counter-notice providing evidence of their right to use the material.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
