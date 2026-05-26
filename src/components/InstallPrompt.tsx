"use client";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import styles from "./InstallPrompt.module.css";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's default automatic bar
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show custom install prompt overlay
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Optional: Fallback for iOS/Safari where beforeinstallprompt isn't supported
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const hasPromptedIOS = localStorage.getItem("lpn_ios_prompted");
    if (isIOS && !isStandalone && !hasPromptedIOS) {
      // Show iOS instructions after 10 seconds of active browsing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show native install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      // Stash is consumed, clear it
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      // iOS / Safari instruction alert
      alert("To install LPN on your iPhone:\n1. Tap the share button in Safari (icon at bottom center)\n2. Scroll down and tap 'Add to Home Screen'\n3. Tap 'Add' in the top right corner.");
      localStorage.setItem("lpn_ios_prompted", "true");
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Suppress prompt for 3 days to avoid annoying user
    localStorage.setItem("lpn_ios_prompted", "true");
  };

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <button className={styles.closeBtn} onClick={handleClose}>
        <X size={16} />
      </button>
      <div className={styles.body}>
        <div className={styles.iconWrap}>
          <img src="/logo.png" alt="LPN Logo" className={styles.logo} />
        </div>
        <div className={styles.content}>
          <h4>Add LPN to Home Screen</h4>
          <p>Install the app for instant, premium access to Ugandan real estate.</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={handleClose} className={styles.dismissBtn}>
          Not Now
        </button>
        <button onClick={handleInstallClick} className={styles.installBtn}>
          <Download size={15} /> Install
        </button>
      </div>
    </div>
  );
}
