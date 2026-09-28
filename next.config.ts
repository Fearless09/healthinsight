import type { NextConfig } from "next";

const AWS_ENDPOINT = process.env.AWS_ENDPOINT_URL_S3;

if (!AWS_ENDPOINT) throw new Error("AWS_ENDPOINT_URL_S3 is not defined!");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: AWS_ENDPOINT.replace("https://", ""),
      },
    ],
  },
};

export default nextConfig;
