import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
      };
    }
    return config;
  },
  serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
};

export default nextConfig;
