"use client";

import { useQuery } from "convex/react";
import { Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type DesignSystemTokensPanelProps = {
	projectId: string | null;
	onApplyColor: (hex: string) => void;
	onApplyFont: (font: string) => void;
};

export function DesignSystemTokensPanel({
	projectId,
	onApplyColor,
	onApplyFont,
}: DesignSystemTokensPanelProps) {
	const systems = useQuery(
		api.design_systems.getByProject,
		projectId ? { projectId: projectId as Id<"projects"> } : "skip",
	);

	const system = systems?.[0];

	if (!projectId) {
		return (
			<Card className="border-dashed">
				<CardContent className="py-4 text-sm text-muted-foreground">
					Assign this canvas to a project to use its design system tokens.
				</CardContent>
			</Card>
		);
	}

	if (systems === undefined) {
		return (
			<Card>
				<CardContent className="py-4 text-sm text-muted-foreground">
					Loading design system…
				</CardContent>
			</Card>
		);
	}

	if (!system) {
		return (
			<Card className="border-dashed">
				<CardContent className="py-4 text-sm text-muted-foreground">
					No design system saved for this project yet.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-sm">
					<Sparkles className="size-4 text-primary" />
					Design system tokens
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{system.colors.length > 0 ? (
					<div className="space-y-2">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Colors
						</p>
						<div className="flex flex-wrap gap-2">
							{system.colors.map((color) => (
								<Button
									key={color.hex}
									type="button"
									variant="outline"
									size="sm"
									className="h-auto gap-2 px-2 py-1.5"
									onClick={() => onApplyColor(color.hex)}
									title={`Apply ${color.name}`}
								>
									<span
										className="size-4 rounded-full border border-black/10"
										style={{ backgroundColor: color.hex }}
									/>
									<span className="text-xs">{color.name}</span>
								</Button>
							))}
						</div>
					</div>
				) : null}

				{system.fonts.length > 0 ? (
					<div className="space-y-2">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Fonts
						</p>
						<div className="flex flex-wrap gap-2">
							{system.fonts.map((font) => (
								<Button
									key={font}
									type="button"
									variant="outline"
									size="sm"
									onClick={() => onApplyFont(font)}
								>
									<Type data-icon="inline-start" />
									{font}
								</Button>
							))}
						</div>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
