import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anatliweb',
  appName: 'ANATLI',
  webDir: 'build',
  server: {
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;