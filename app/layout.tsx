import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Syne } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Suspense } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { MotionProvider } from "@/components/motion-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import {
	absoluteUrl,
	getSiteUrl,
	SITE_DESCRIPTION,
	SITE_KEYWORDS,
	SITE_NAME,
	SITE_TAGLINE,
} from "@/lib/site";
import { cn } from "@/lib/utils";
import GlobalLoading from "./loading";

const syne = Syne({
	subsets: ["latin"],
	variable: "--font-heading",
	weight: ["600", "700"],
});

const sourceSans = Source_Sans_3({
	variable: "--font-sans",
	subsets: ["latin", "latin-ext"],
	weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
	variable: "--font-ibm-plex-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
});

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#F4F8FA" },
		{ media: "(prefers-color-scheme: dark)", color: "#1A2438" },
	],
	colorScheme: "light dark",
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = {
	metadataBase: new URL(getSiteUrl()),
	title: {
		default: `${SITE_NAME} — Focused productivity workspace`,
		template: `%s · ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	keywords: [...SITE_KEYWORDS],
	authors: [{ name: "Peter Dinis", url: "https://dinis-portfolio.vercel.app/" }],
	creator: "Peter Dinis",
	publisher: SITE_NAME,
	category: "productivity",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: absoluteUrl("/"),
		siteName: SITE_NAME,
		title: `${SITE_NAME} — Focused productivity workspace`,
		description: SITE_TAGLINE,
	},
	twitter: {
		card: "summary_large_image",
		title: `${SITE_NAME} — Focused productivity workspace`,
		description: SITE_TAGLINE,
		creator: "@peterdinis1",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"h-full antialiased",
				sourceSans.variable,
				ibmPlexMono.variable,
				syne.variable,
				"font-sans",
			)}
		>
			<body className="flex min-h-full flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<MotionProvider>
						<Suspense fallback={<GlobalLoading />}>
							<ConvexAuthNextjsServerProvider>
								<ConvexClientProvider>{children}</ConvexClientProvider>
							</ConvexAuthNextjsServerProvider>
						</Suspense>
						<Toaster />
					</MotionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
