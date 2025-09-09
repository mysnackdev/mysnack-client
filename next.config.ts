import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }, // fotos do cardápio
      { protocol: "https", hostname: "lh3.googleusercontent.com" },      // (se usar avatars Google)
      // adicione outros domínios de imagem que seu backoffice/lojas usam
    ],
  },
};

export default nextConfig;
