import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Prevent firebase-admin from being bundled into server-side code
   * by Next.js / Turbopack. It will be loaded at runtime from node_modules.
   */
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
