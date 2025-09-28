/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Não falhar o build por erros/warnings do ESLint
    ignoreDuringBuilds: true,
  },
  images: {
    // Ambiente estático / Firebase Hosting
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/loja/:id*", destination: "/loja" },
    ];
  },
};

export default nextConfig;
