import React, { useState, useEffect } from 'react';
import { showInstallPrompt } from '../../serviceWorkerRegistration';
import './InstallButton.css';
const InstallButton = () => {
  const [installAvailable, setInstallAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = window.navigator.standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    const handleInstallAvailable = () => {
      setInstallAvailable(true);
    };

    const handleInstalled = () => {
      setInstallAvailable(false);
      setIsInstalled(true);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = () => {
    showInstallPrompt();
  };

  if (isInstalled || !installAvailable) {
    return null;
  }

  return (
    <button
      className="install-button"
      onClick={handleInstall}
      title="Install Vibe Ludo as an app"
    >
      <span className="install-icon">📱</span>
      Install App
    </button>
  );
};

export default InstallButton;