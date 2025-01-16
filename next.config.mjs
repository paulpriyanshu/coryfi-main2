/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',  // Enable static HTML export
  
    // // Only exclude true server-side routes
    // experimental: {
    //     serverActions: false,
    //   },
    
    //   // Configure static build behavior
    //   distDir: 'out',
      
    //   // Explicitly ignore routes we don't want to build
    //   skipTrailingSlashRedirect: true,
    //   skipMiddlewareUrlNormalize: true,
    webpack: (config, { isServer }) => {
      if (isServer) {
        // Ensure Prisma query engine is available in the build
        config.externals.push({ "@prisma/client": "commonjs @prisma/client" });
      }
      return config;
    },
    typescript: {
        ignoreBuildErrors: true, // Ignore TypeScript errors during build
      },
      eslint: {
        // Disable ESLint during the build process
        ignoreDuringBuilds: true,
      },
    images:{
        domains:['example.com','prac2.priyanshu-paul003.workers.dev','drive.google.com','i.imgur.com','cdn.pixabay.com','images.unsplash.com','en.wikipedia.org','assets.aceternity.com'],

    },
    // output:"export"
};

export default nextConfig;
