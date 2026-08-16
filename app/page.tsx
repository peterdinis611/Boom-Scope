import {
	Bricolage_Grotesque,
	IBM_Plex_Mono,
	Source_Serif_4,
} from "next/font/google";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { DeskCollage } from "@/components/landing/desk-collage";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { cn } from "@/lib/utils";

const landingDisplay = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--font-landing-display",
	weight: ["500", "600", "700"],
});

const landingBody = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-landing-body",
	weight: ["400", "600"],
});

const landingMono = IBM_Plex_Mono({
	subsets: ["latin"],
	variable: "--font-landing-mono",
	weight: ["400", "500"],
});

export const metadata: Metadata = {
	title: `${SITE_NAME} — Focused productivity workspace`,
	description: SITE_DESCRIPTION,
	alternates: { canonical: "/" },
	openGraph: {
		title: `${SITE_NAME} — Focused productivity workspace`,
		description: SITE_TAGLINE,
		url: "/",
	},
};

const TRAY = [
	{
		name: "Tasks",
		line: "Kanban columns, due dates, WIP limits.",
	},
	{
		name: "Notes",
		line: "Rich docs pinned to a project.",
	},
	{
		name: "Canvas",
		line: "Layouts and visual DNA beside the work.",
	},
	{
		name: "Focus",
		line: "Pomodoro from the task you’re shipping.",
	},
] as const;

export default async function Home() {
	const isAuthenticated = await isAuthenticatedNextjs();

	return (
		<div
			className={cn(
				landingDisplay.variable,
				landingBody.variable,
				landingMono.variable,
				"landing relative flex min-h-full flex-1 flex-col overflow-hidden",
			)}
		>
			<SiteJsonLd />

			<style>{`
				.landing {
					--ink: #1c2430;
					--ink-muted: #5b6675;
					--paper: #eef2f4;
					--desk: #d5dde2;
					--mist: #e3eaee;
					--brass: #b8893a;
					--cyan: #2a7a8c;
					--signal: #c45c26;
					background: var(--paper);
					color: var(--ink);
				}
				.dark .landing {
					--ink: #eef2f4;
					--ink-muted: #9aa6b4;
					--paper: #141a22;
					--desk: #1c2430;
					--mist: #243040;
					--brass: #d4a84b;
					--cyan: #4eb3c4;
					--signal: #e07a45;
					background: var(--paper);
					color: var(--ink);
				}
				.landing-slip {
					transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms ease;
				}
				.landing-desk:hover .landing-slip-note { transform: rotate(-8deg) translateY(-4px); }
				.landing-desk:hover .landing-slip-a { transform: rotate(6deg) translateY(-6px); }
				.landing-desk:hover .landing-slip-b { transform: rotate(-4deg) translateY(-3px); }
				.landing-desk:hover .landing-slip-timer { transform: scale(1.03); }
				.landing-desk:hover .landing-slip-canvas { transform: rotate(5deg) translateY(-5px); }
				@keyframes landing-rise {
					from { opacity: 0; transform: translateY(14px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.landing-rise {
					animation: landing-rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
				}
				@media (prefers-reduced-motion: reduce) {
					.landing-rise { animation: none; }
					.landing-slip { transition: none; }
					.landing-desk:hover .landing-slip-note,
					.landing-desk:hover .landing-slip-a,
					.landing-desk:hover .landing-slip-b,
					.landing-desk:hover .landing-slip-timer,
					.landing-desk:hover .landing-slip-canvas {
						transform: none;
					}
				}
			`}</style>

			<LandingHeader isAuthenticated={isAuthenticated} />

			<main className="relative z-10 flex flex-1 flex-col">
				<section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-12 pt-4 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:px-12 lg:pb-16 lg:pt-6">
					<div className="landing-rise max-w-xl" style={{ animationDelay: "40ms" }}>
						<p className="font-[family-name:var(--font-landing-mono)] text-[11px] tracking-[0.2em] text-[var(--cyan)] uppercase">
							Shipping desk for builders
						</p>
						<h1 className="mt-4 font-[family-name:var(--font-landing-display)] text-[clamp(2.6rem,6.5vw,4.4rem)] leading-[0.98] font-semibold tracking-[-0.03em] text-[var(--ink)]">
							Keep the work
							<span className="block text-[var(--brass)]">on one desk.</span>
						</h1>
						<p className="mt-5 max-w-md font-[family-name:var(--font-landing-body)] text-[1.05rem] leading-relaxed text-[var(--ink-muted)]">
							Boom Scope is where Kanban, notes, canvas, and a focus timer live
							together — so you plan, write, design, and ship without tab
							hopping.
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-3">
							{isAuthenticated ? (
								<Link
									href="/dashboard"
									className="inline-flex h-11 items-center rounded-md bg-[var(--brass)] px-6 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
								>
									Open workspace
								</Link>
							) : (
								<>
									<Link
										href="/register"
										className="inline-flex h-11 items-center rounded-md bg-[var(--brass)] px-6 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-90"
									>
										Start free
									</Link>
									<Link
										href="/login"
										className="inline-flex h-11 items-center rounded-md border border-[var(--ink)]/15 bg-transparent px-5 text-sm font-medium text-[var(--ink)] transition-colors hover:border-[var(--ink)]/30"
									>
										Sign in
									</Link>
								</>
							)}
						</div>
					</div>

					<div className="landing-rise" style={{ animationDelay: "140ms" }}>
						<DeskCollage />
					</div>
				</section>

				<section className="relative z-10 border-t border-[var(--ink)]/10 bg-[color-mix(in_oklab,var(--desk)_55%,var(--paper))] px-5 py-10 sm:px-8 lg:px-12">
					<div className="mx-auto max-w-6xl">
						<p className="font-[family-name:var(--font-landing-mono)] text-[11px] tracking-[0.2em] text-[var(--cyan)] uppercase">
							On the desk
						</p>
						<div className="mt-6 grid gap-px overflow-hidden rounded-lg bg-[var(--ink)]/10 sm:grid-cols-2 lg:grid-cols-4">
							{TRAY.map((item) => (
								<div key={item.name} className="bg-[var(--paper)] px-5 py-5">
									<p className="font-[family-name:var(--font-landing-display)] text-lg font-semibold tracking-tight text-[var(--ink)]">
										{item.name}
									</p>
									<p className="mt-2 font-[family-name:var(--font-landing-body)] text-sm leading-relaxed text-[var(--ink-muted)]">
										{item.line}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
