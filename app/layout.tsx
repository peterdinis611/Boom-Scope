import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Suspense } from "react";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import GlobalLoading from "./loading";

const ralewayHeading = Raleway({
	subsets: ["latin"],
	variable: "--font-heading",
});

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Boom Scope",
	description: "Boom Scope app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="sk"
			suppressHydrationWarning
			className={cn(
				"h-full",
				"antialiased",
				geistSans.variable,
				geistMono.variable,
				"font-sans",
				figtree.variable,
				ralewayHeading.variable,
			)}
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Suspense fallback={<GlobalLoading />}>
						<ConvexAuthNextjsServerProvider>
							<ConvexClientProvider>{children}</ConvexClientProvider>
						</ConvexAuthNextjsServerProvider>
					</Suspense>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
