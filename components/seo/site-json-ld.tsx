import {
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_TAGLINE,
	absoluteUrl,
} from "@/lib/site";

export function SiteJsonLd() {
	const data = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: SITE_NAME,
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		description: SITE_DESCRIPTION,
		url: absoluteUrl("/"),
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "EUR",
		},
		featureList: [
			"Project management",
			"Kanban task boards",
			"Rich notes",
			"Design canvas",
			"Design systems",
			"Pomodoro focus timer",
			"Placeholder image and text tools",
		],
		slogan: SITE_TAGLINE,
		author: {
			"@type": "Person",
			name: "Peter Dinis",
			url: "https://dinis-portfolio.vercel.app/",
		},
	};

	return (
		<script
			type="application/ld+json"
			// JSON-LD must be a raw string for crawlers
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}
