"use client";

import { FileText, FolderKanban, Palette, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ViewerSummary = {
	name?: string | null;
	email?: string | null;
} | null;

export function DashboardContent({ viewer }: { viewer: ViewerSummary }) {
	const greeting = viewer?.name ?? viewer?.email?.split("@")[0] ?? "Užívateľ";

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
			<div className="flex flex-col gap-3">
				<h1 className="font-heading text-3xl font-bold tracking-tight">
					Vitajte späť, {greeting}
				</h1>
				<p className="text-muted-foreground">
					Tu je prehľad toho, čo sa deje vo vašom projekte Boom Scope.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Link href="/dashboard/projects">
					<Card className="hover:border-primary/50 transition-colors bg-primary/5 border-primary/20">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Moje projekty
							</CardTitle>
							<FolderKanban className="size-4 text-primary" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-primary">Prehľad</div>
							<p className="text-xs text-muted-foreground">
								Spravujte všetky svoje projekty na jednom mieste
							</p>
						</CardContent>
					</Card>
				</Link>
				<Link href="/dashboard/notes">
					<Card className="hover:border-primary/50 transition-colors">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Moje poznámky
							</CardTitle>
							<FileText className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">Spravovať</div>
							<p className="text-xs text-muted-foreground">
								Zobrazte si všetky svoje poznámky
							</p>
						</CardContent>
					</Card>
				</Link>
				<Link href="/dashboard/canvas">
					<Card className="hover:border-primary/50 transition-colors">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Canvas</CardTitle>
							<Palette className="size-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">Pracovný priestor</div>
							<p className="text-xs text-muted-foreground">
								Vytvárajte nové dizajny na nekonečnej ploche
							</p>
						</CardContent>
					</Card>
				</Link>
				<Link href="/dashboard/design-system">
					<Card className="hover:border-primary/50 transition-colors cursor-pointer group">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Design System
							</CardTitle>
							<Sparkles className="size-4 text-primary animate-pulse" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">AI Generátor</div>
							<p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
								Vytvorte si vizuálnu identitu z inšpirácie
							</p>
						</CardContent>
					</Card>
				</Link>
			</div>
		</div>
	);
}
