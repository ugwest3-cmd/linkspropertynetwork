import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BillingPage() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: "4rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem", color: "var(--secondary)" }}>Billing Policy</h1>
        <div style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          <br />
          <h2>1. Subscription Plans</h2>
          <p>Links Property Network offers both Free and Paid tiers for agents. Paid tiers unlock premium features such as unlimited listings and priority support.</p>
          <br />
          <h2>2. Payment Terms</h2>
          <p>All payments are processed securely. Subscriptions are billed in advance on a monthly or annual basis and are non-refundable for the active billing period.</p>
          <br />
          <h2>3. Cancellations</h2>
          <p>You may cancel your subscription at any time. Upon cancellation, you will retain access to premium features until the end of your current billing cycle.</p>
          <br />
          <h2>4. Changes to Fees</h2>
          <p>We reserve the right to change our subscription fees. Any changes will be communicated to you at least 30 days before taking effect.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
