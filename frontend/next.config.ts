import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js to build a static HTML export
  output: "export",
  

  images: {
    unoptimized: true,
  },
  
  basePath: process.env.NODE_ENV === "production" ? "/Habit-tracker-using-NLP-and-fastapi" : "",
};

export default nextConfig;