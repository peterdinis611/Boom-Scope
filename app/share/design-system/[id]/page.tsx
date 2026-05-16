import { fetchQuery } from "convex/nextjs";
import { Palette, Sparkles, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
			<div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-6">
				<div className="p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
					<Sparkles className="size-10" />
				</div>
				<h1 className="text-3xl font-black tracking-tight">
					Design System nenájdený
				</h1>
				<p className="text-muted-foreground">
					Tento design system nie je verejný alebo bol vymazaný.
				</p>
				<Link
					href="/"
					className="text-primary underline underline-offset-4 font-bold text-sm"
				>
					Späť na Boom Scope
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background text-foreground p-8 lg:p-16">
			<div className="max-w-5xl mx-auto space-y-16">
				{/* Header */}
				<header className="space-y-4">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em]">
						<Sparkles className="size-3" />
						Zdieľaný Design System
					</div>
					<h1 className="text-5xl lg:text-7xl font-black tracking-tighter">
						{system.description ?? "Design"}{" "}
						<span className="text-primary">System</span>
					</h1>
					<p className="text-muted-foreground text-lg font-medium">
						Vytvorené v Boom Scope · Read-only náhľad
					</p>
				</header>

				{/* Colors */}
				<section className="space-y-8">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-foreground/5">
							<Palette className="size-4 opacity-40" />
						</div>
						<h2 className="text-2xl font-black tracking-tight">
							Farebná paleta
						</h2>
					</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
						{system.colors.map((color) => (
							<div
								key={color.hex}
								className="rounded-3xl overflow-hidden border border-border shadow-sm"
							>
								<div
									className="h-24 w-full"
									style={{ backgroundColor: color.hex }}
								/>
								<div className="p-4 bg-background/60 backdrop-blur space-y-1">
									<p className="text-xs font-black uppercase tracking-tight">
										{color.name}
									</p>
									<p className="font-mono text-[10px] text-muted-foreground">
										{color.hex}
									</p>
									<p className="font-mono text-[10px] text-muted-foreground">
										{color.rgb}
									</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Fonts */}
				<section className="space-y-8">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-xl bg-foreground/5">
							<Type className="size-4 opacity-40" />
						</div>
						<h2 className="text-2xl font-black tracking-tight">Typografia</h2>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{system.fonts.map((font, idx) => (
							<div
								key={font}
								className="p-6 rounded-3xl bg-foreground/5 border border-border"
							>
								<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
									{idx === 0 ? "Primárne písmo" : "Sekundárne písmo"}
								</p>
								<p className="text-2xl font-black" style={{ fontFamily: font }}>
									{font}
								</p>
								<p
									className="text-sm opacity-50 mt-1"
									style={{ fontFamily: font }}
								>
									The quick brown fox jumps over the lazy dog
								</p>
							</div>
						))}
					</div>
				</section>

				<footer className="pt-8 border-t border-border text-center text-xs text-muted-foreground">
					Vytvorené pomocou{" "}
					<Link href="/" className="text-primary font-bold">
						Boom Scope
					</Link>
				</footer>
			</div>
		</div>
	);
}
