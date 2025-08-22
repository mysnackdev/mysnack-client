import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Necessário para gerar `out/` quando você usa <Image /> do next/image
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // adicione aqui outros hosts remotos que você usa
    ],
  },
};

export default nextConfig;
