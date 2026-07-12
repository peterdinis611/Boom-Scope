"use client";

import { Copy, RefreshCw, Shuffle, TextQuote } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	clampPlaceholderTextCount,
	countPlaceholderTextStats,
	generateLoremIpsum,
	PLACEHOLDER_TEXT_LIMITS,
	PLACEHOLDER_TEXT_PRESETS,
	type PlaceholderTextParams,
	type PlaceholderTextUnit,
} from "@/lib/placeholder-text";

const DEFAULT_PARAMS: PlaceholderTextParams = {
	unit: "paragraphs",
	count: PLACEHOLDER_TEXT_LIMITS.paragraphs.default,
	startWithLorem: true,
};

const UNIT_LABELS: Record<PlaceholderTextUnit, string> = {
	paragraphs: "Paragraphs",
	sentences: "Sentences",
	words: "Words",
};

export function PlaceholderTextStudio() {
	const [params, setParams] = useState<PlaceholderTextParams>(DEFAULT_PARAMS);
	const [refreshNonce, setRefreshNonce] = useState(0);

	const text = useMemo(
		() => generateLoremIpsum(params),
		[params, refreshNonce],
	);

	const limits = PLACEHOLDER_TEXT_LIMITS[params.unit];
	const stats = useMemo(() => countPlaceholderTextStats(text), [text]);

	const updateParams = (updates: Partial<PlaceholderTextParams>) => {
		setParams((current) => {
			const next = { ...current, ...updates };
			if (updates.unit && updates.unit !== current.unit) {
				next.count = PLACEHOLDER_TEXT_LIMITS[updates.unit].default;
			}
			next.count = clampPlaceholderTextCount(next.unit, next.count);
			return next;
		});
	};

	const regenerate = () => {
		setRefreshNonce((value) => value + 1);
	};

	const copyText = async () => {
		if (!text.trim()) {
			toast.error("Nothing to copy");
			return;
		}
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	};

	return (
		<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
			<Card className="h-fit space-y-6 p-5">
				<div className="space-y-1">
					<h2 className="text-sm font-semibold">Parameters</h2>
					<p className="text-xs text-muted-foreground">
						Generate random lorem ipsum for mockups and layouts.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{PLACEHOLDER_TEXT_PRESETS.map((preset) => (
						<Button
							key={preset.label}
							type="button"
							variant="outline"
							size="sm"
							className="h-8 rounded-lg text-xs"
							onClick={() => {
								setParams({
									unit: preset.unit,
									count: preset.count,
									startWithLorem: true,
								});
							}}
						>
							{preset.label}
						</Button>
					))}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="text-unit">Format</Label>
					<Select
						value={params.unit}
						onValueChange={(value) =>
							updateParams({ unit: value as PlaceholderTextUnit })
						}
					>
						<SelectTrigger id="text-unit" className="h-9 w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(Object.keys(UNIT_LABELS) as PlaceholderTextUnit[]).map(
								(unit) => (
									<SelectItem key={unit} value={unit}>
										{UNIT_LABELS[unit]}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="text-count">Count</Label>
						<span className="text-xs text-muted-foreground">{params.count}</span>
					</div>
					<input
						id="text-count"
						type="range"
						min={limits.min}
						max={limits.max}
						step={1}
						value={params.count}
						aria-label="Count"
						onChange={(event) =>
							updateParams({ count: Number(event.target.value) || limits.min })
						}
						className="w-full accent-primary"
					/>
					<p className="text-[11px] text-muted-foreground">
						{limits.min}–{limits.max} {params.unit}
					</p>
				</div>

				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={params.startWithLorem}
						onChange={(event) =>
							updateParams({ startWithLorem: event.target.checked })
						}
						className="size-4 rounded border-border accent-primary"
					/>
					Start with &ldquo;Lorem ipsum&hellip;&rdquo;
				</label>

				<div className="flex flex-col gap-2">
					<Button type="button" className="w-full gap-2" onClick={regenerate}>
						<Shuffle className="size-4" />
						Generate random text
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full gap-2"
						onClick={copyText}
						disabled={!text.trim()}
					>
						<Copy className="size-4" />
						Copy to clipboard
					</Button>
				</div>
			</Card>

			<Card className="overflow-hidden">
				<div className="flex items-center justify-between border-b border-border px-5 py-3">
					<div className="flex items-center gap-2 text-sm font-medium">
						<TextQuote className="size-4 text-primary" />
						Preview
					</div>
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span>{stats.words} words</span>
						<span>{stats.characters} chars</span>
						{stats.paragraphs > 1 ? (
							<span>{stats.paragraphs} paragraphs</span>
						) : null}
					</div>
				</div>

				<div className="space-y-3 p-5">
					<Textarea
						value={text}
						readOnly
						rows={18}
						className="min-h-[420px] resize-y bg-muted/20 font-normal leading-relaxed"
					/>
					<div className="flex justify-end">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="gap-1.5"
							onClick={regenerate}
						>
							<RefreshCw className="size-3.5" />
							Regenerate
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
