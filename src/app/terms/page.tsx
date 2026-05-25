import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "var(--secondary)" }}>Terms & Conditions</h1>
        <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <br />
          <h2>1. Introduction</h2>
          <p>Welcome to Links Property Network. By accessing our platform, you agree to these terms and conditions. If you disagree with any part of these terms, please do not use our website.</p>
          <br />
          <h2>2. Service Usage</h2>
          <p>Links Property Network acts as a trusted platform connecting buyers with verified real estate agents. We do not own the properties listed on the platform unless explicitly stated.</p>
          <br />
          <h2>3. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password that you use to access the service.</p>
          <br />
          <h2>4. Agent Obligations</h2>
          <p>Registered agents must ensure that all property listings are accurate, verified, and legally sound. Misleading information may result in immediate account termination.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
