import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "var(--secondary)" }}>Cookie Policy</h1>
        <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <br />
          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and understand how you use our platform.</p>
          <br />
          <h2>2. How We Use Cookies</h2>
          <p>We use essential cookies to keep you logged in and functional cookies to remember your filter preferences in the property marketplace.</p>
          <br />
          <h2>3. Managing Cookies</h2>
          <p>You can control or delete cookies through your browser settings. However, disabling essential cookies may affect your ability to use the agent dashboard.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
