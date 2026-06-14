import { fetchQuery } from "convex/nextjs";
import { Palette, Sparkles, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface Props {
	params: Promise<{ id: string }>;
}

async function getSystem(id: string) {
	try {
		return await fetchQuery(api.design_systems.getPublic, {
			id: id as Id<"design_systems">,
		});
	} catch {
		return null;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { id } = await params;
	const system = await getSystem(id);
	return {
		title: system
			? `${system.description ?? "Design System"} – Boom Scope`
			: "Design System – Boom Scope",
		description: "Zdieľaný design system vytvorený v Boom Scope.",
	};
}

export default async function ShareDesignSystemPage({ params }: Props) {
	const { id } = await params;
	const system = await getSystem(id);

	if (!system) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
				<div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
					<Sparkles className="size-8" />
				</div>
				<h1 className="font-heading text-2xl font-semibold">
					Design System nenájdený
				</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					Tento design system nie je verejný alebo bol vymazaný.
				</p>
				<Link
					href="/"
					className="text-sm font-medium text-primary underline-offset-4 hover:underline"
				>
					Späť na Boom Scope
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background px-4 py-10 md:px-8 md:py-12">
			<div className="mx-auto max-w-4xl space-y-10">
				<header className="space-y-3">
					<div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
						<Sparkles className="size-3.5 text-primary" />
						Zdieľaný Design System
					</div>
					<h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
						{system.description ?? "Design System"}
					</h1>
					<p className="text-sm text-muted-foreground">
						Vytvorené v Boom Scope · iba na čítanie
					</p>
				</header>

				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<Palette className="size-4 text-muted-foreground" />
						<h2 className="font-heading text-lg font-semibold">
							Farebná paleta
						</h2>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
						{system.colors.map((color) => (
							<Card key={color.hex} className="overflow-hidden py-0">
								<div
									className="h-20 w-full"
									style={{ backgroundColor: color.hex }}
								/>
								<CardContent className="space-y-0.5 p-3">
									<p className="truncate text-sm font-medium">{color.name}</p>
									<p className="font-mono text-xs text-muted-foreground">
										{color.hex}
									</p>
									<p className="font-mono text-xs text-muted-foreground">
										{color.rgb}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<section className="space-y-4">
					<div className="flex items-center gap-2">
						<Type className="size-4 text-muted-foreground" />
						<h2 className="font-heading text-lg font-semibold">Typografia</h2>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{system.fonts.map((font, idx) => (
							<Card key={font}>
								<CardContent className="space-y-2 p-4">
									<p className="text-xs text-muted-foreground">
										{idx === 0 ? "Primárne písmo" : "Sekundárne písmo"}
									</p>
									<p
										className="text-xl font-medium"
										style={{ fontFamily: font }}
									>
										{font}
									</p>
									<p
										className="text-sm text-muted-foreground"
										style={{ fontFamily: font }}
									>
										The quick brown fox jumps over the lazy dog
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				<footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
					Vytvorené pomocou{" "}
					<Link href="/" className="font-medium text-primary hover:underline">
						Boom Scope
					</Link>
				</footer>
			</div>
		</div>
	);
}
