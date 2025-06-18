import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';

const InstallButton = ({ className = '' }) => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  // Don't show the button if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installApp}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-violet-600 hover:bg-violet-700 
        text-white font-medium rounded-lg
        transition-colors duration-200
        shadow-lg hover:shadow-xl
        ${className}
      `}
      title="Install DashPoint as an app"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Install App</span>
      <Smartphone className="w-4 h-4 sm:hidden" />
    </button>
  );
};

export default InstallButton;
