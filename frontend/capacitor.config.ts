import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodeasylist.android',
  appName: 'FoodEasyList',
  webDir: 'dist/frontend/browser',
  server: {
    // Per sviluppo locale: usa l'IP del Mac sulla LAN
    // Il simulatore iOS usa localhost, ma un device reale ha bisogno dell'IP
    allowNavigation: ['*'],
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
