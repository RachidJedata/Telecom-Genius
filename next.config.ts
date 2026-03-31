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
  resolve: {
    extensions: ['.js', '.ts'], // Allow importing .js in TypeScript
  },
  serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
  images: {
    unoptimized: true, // Disable all image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
