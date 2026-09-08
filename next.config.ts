import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.6.90",
    "192.168.56.1",
    "localhost",
    "127.0.0.1",
  ],

  serverExternalPackages: [
    "firebase-admin",
    "jwks-rsa",
    "jose",
  ],
};

export default nextConfig;