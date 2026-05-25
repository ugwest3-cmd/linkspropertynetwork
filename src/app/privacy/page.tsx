import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "var(--secondary)" }}>Privacy Policy</h1>
        <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <br />
          <h2>1. Data Collection</h2>
          <p>We collect information you provide directly to us when you register as an agent or inquire about a property, including your name, email address, and phone number.</p>
          <br />
          <h2>2. How We Use Your Data</h2>
          <p>Your data is used to provide, maintain, and improve our services, as well as to communicate with you regarding properties and account updates.</p>
          <br />
          <h2>3. Data Sharing</h2>
          <p>We do not sell your personal data. We only share information with verified agents when you explicitly request to be contacted regarding a property.</p>
          <br />
          <h2>4. Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access or destruction.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
