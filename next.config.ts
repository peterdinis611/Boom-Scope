import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	reactStrictMode: true,
	typedRoutes: true,
	devIndicators: {
		position: "bottom-right",
	},
	logging: false,
	experimental: {
		typedEnv: true,
		optimizeCss: true,
		optimizePackageImports: ["lucide-react", "framer-motion", "sonner"],
	},
	images: {
		formats: ["image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200],
		imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 960],
		minimumCacheTTL: 300,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "picsum.photos",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "fastly.picsum.photos",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
