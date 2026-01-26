import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "smwgkugtkmlpldcpfzmq.supabase.co", // Supabase storage
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com", // Default avatar generation
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Alternative avatar service
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
