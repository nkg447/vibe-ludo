import React, { useState, useEffect } from 'react';
import './UpdateNotification.css';

const UpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="update-content">
        <div className="update-text">
          <span className="update-icon">🔄</span>
          <div>
            <h4>New version available!</h4>
            <p>Refresh to get the latest features and improvements</p>
          </div>
        </div>
        <div className="update-actions">
          <button onClick={handleUpdate} className="update-btn">
            Update Now
          </button>
          <button onClick={handleDismiss} className="dismiss-btn">
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;