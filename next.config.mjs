/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['lh3.googleusercontent.com'],
      remotePatterns: [
        
        {
          protocol: 'https',
          hostname: 'mytruepaceconnectbucket.s3.eu-north-1.amazonaws.com',
          port: '',
          pathname: '/uploads/**',
        },
      ],
    },
  };
  
  export default nextConfig;