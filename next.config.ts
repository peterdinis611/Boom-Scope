import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	reactStrictMode: true,
	typedRoutes: true,
	devIndicators: {
		position: "bottom-right",
	},
	experimental: {
		typedEnv: true,
		optimizePackageImports: ["lucide-react", "framer-motion", "sonner"],
	},
	images: {
		formats: ["image/webp"],
		deviceSizes: [640, 750, 828, 1080, 1200],
		imageSizes: [16, 32, 64, 96, 128, 256],
		minimumCacheTTL: 300,
	},
};

export default nextConfig;
