/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bibliotecas de leitura de arquivos rodam apenas no servidor (Node).
  serverExternalPackages: ["mammoth", "unpdf"],
  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
