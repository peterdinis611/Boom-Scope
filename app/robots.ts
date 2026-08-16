import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
	const siteUrl = getSiteUrl();

	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/login", "/register", "/forgot-password"],
				disallow: [
					"/dashboard",
					"/dashboard/",
					"/api/",
					"/share/",
				],
			},
		],
		sitemap: `${siteUrl}/sitemap.xml`,
		host: siteUrl,
	};
}
