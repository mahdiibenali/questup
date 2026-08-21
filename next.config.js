/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.facebook.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' https://res.cloudinary.com https://*.facebook.com https://lh3.googleusercontent.com data: blob:",
            "font-src 'self' https://fonts.gstatic.com",
            "connect-src 'self' https://*.pusher.com wss://*.pusher.com https://api.anthropic.com https://*.upstash.io",
            "media-src 'self' blob:",
            "frame-src 'self' https://*.facebook.com",
          ].join("; "),
        },
      ],
    },
  ],
};

module.exports = nextConfig;
