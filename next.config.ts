import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
/** Set SOURCEMAPS=false to skip publishing browser source maps. */
const enableBrowserSourceMaps = process.env.SOURCEMAPS !== "false";

const nextConfig: NextConfig = {
	cacheComponents: true,
	reactStrictMode: true,
	typedRoutes: true,
	poweredByHeader: false,
	compress: true,
	productionBrowserSourceMaps: enableBrowserSourceMaps,
	// Helps debug prerender / RSC issues without shipping maps to every client fetch
	enablePrerenderSourceMaps: enableBrowserSourceMaps,
	devIndicators: {
		position: "bottom-right",
	},
	logging: false,
	compiler: {
		removeConsole: isProd
			? {
					exclude: ["error", "warn"],
				}
			: false,
	},
	experimental: {
		typedEnv: true,
		optimizeCss: true,
		optimizePackageImports: [
			"lucide-react",
			"motion",
			"framer-motion",
			"sonner",
			"effect",
			"radix-ui",
			"@dnd-kit/core",
			"@dnd-kit/sortable",
			"@dnd-kit/utilities",
			"zod",
			"fuse.js",
			"xstate",
			"@xstate/react",
			"date-fns",
			"clsx",
			"class-variance-authority",
		],
	},
	images: {
		formats: ["image/webp", "image/avif"],
		deviceSizes: [640, 750, 828, 1080, 1200],
		imageSizes: [16, 32, 64, 96, 128, 256, 384, 640, 960],
		minimumCacheTTL: 60 * 60 * 24 * 30,
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
