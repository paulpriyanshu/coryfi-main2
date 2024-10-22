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
    
  
    images:{
        domains:['example.com','prac2.priyanshu-paul003.workers.dev','drive.google.com','i.imgur.com','cdn.pixabay.com','images.unsplash.com','en.wikipedia.org','assets.aceternity.com'],

    },
    // output:"export"
};

export default nextConfig;
