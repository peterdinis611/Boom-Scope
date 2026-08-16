import type { MetadataRoute } from "next";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: SITE_NAME,
		short_name: SITE_NAME,
		description: SITE_DESCRIPTION,
		start_url: "/",
		display: "standalone",
		background_color: "#F4F8FA",
		theme_color: "#E05A2A",
		icons: [
			{
				src: "/icon",
				sizes: "32x32",
				type: "image/png",
			},
		],
		categories: ["productivity", "business", "utilities"],
		lang: "en",
		id: getSiteUrl(),
	};
}
