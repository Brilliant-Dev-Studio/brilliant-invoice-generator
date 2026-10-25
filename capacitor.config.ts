import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  "https://brilliant-invoice-generator.vercel.app";

const config: CapacitorConfig = {
  appId: "com.sanpya.invoice",
  appName: "San Pya",
  webDir: "capacitor-www",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
