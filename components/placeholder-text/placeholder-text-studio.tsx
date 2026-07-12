"use client";

import { Copy, Loader2, RefreshCw, Shuffle, TextQuote } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
	clampPlaceholderTextCount,
	countPlaceholderTextStats,
	generateLoremIpsum,
	PLACEHOLDER_TEXT_LIMITS,
	PLACEHOLDER_TEXT_PRESETS,
	type PlaceholderTextParams,
	type PlaceholderTextUnit,
} from "@/lib/placeholder-text";
import { cn } from "@/lib/utils";

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

function buildGenerationParams(
	params: Omit<PlaceholderTextParams, "count">,
	count: number,
): PlaceholderTextParams {
	return {
		...params,
		count: clampPlaceholderTextCount(params.unit, count),
	};
}

export function PlaceholderTextStudio() {
	const [params, setParams] = useState<Omit<PlaceholderTextParams, "count">>({
		unit: DEFAULT_PARAMS.unit,
		startWithLorem: DEFAULT_PARAMS.startWithLorem,
	});
	const [count, setCount] = useState(DEFAULT_PARAMS.count);
	const [refreshNonce, setRefreshNonce] = useState(0);
	const [isRegenerating, setIsRegenerating] = useState(false);

	const debouncedCount = useDebouncedValue(count, 350);
	const generationParams = useMemo(
		() => buildGenerationParams(params, debouncedCount),
		[params, debouncedCount],
	);

	const isCountPending = count !== debouncedCount;

	const text = useMemo(
		() => generateLoremIpsum(generationParams),
		[generationParams, refreshNonce],
	);

	const limits = PLACEHOLDER_TEXT_LIMITS[params.unit];
	const stats = useMemo(() => countPlaceholderTextStats(text), [text]);

	useEffect(() => {
		if (!isRegenerating) return;
		const timer = window.setTimeout(() => setIsRegenerating(false), 250);
		return () => window.clearTimeout(timer);
	}, [isRegenerating, text]);

	const updateUnit = (unit: PlaceholderTextUnit) => {
		setParams((current) => ({ ...current, unit }));
		setCount(PLACEHOLDER_TEXT_LIMITS[unit].default);
	};

	const applyPreset = (preset: (typeof PLACEHOLDER_TEXT_PRESETS)[number]) => {
		setParams({
			unit: preset.unit,
			startWithLorem: true,
		});
		setCount(preset.count);
	};

	const regenerate = () => {
		setIsRegenerating(true);
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

	const isPresetActive = (preset: (typeof PLACEHOLDER_TEXT_PRESETS)[number]) =>
		params.unit === preset.unit &&
		count === preset.count &&
		params.startWithLorem;

	return (
		<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
			<Card className="h-fit space-y-6 p-5">
				<div className="space-y-1">
					<h2 className="text-sm font-semibold">Parameters</h2>
					<p className="text-xs text-muted-foreground">
						Preview updates automatically when you change settings.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{PLACEHOLDER_TEXT_PRESETS.map((preset) => (
						<Button
							key={preset.label}
							type="button"
							variant={isPresetActive(preset) ? "default" : "outline"}
							size="sm"
							className="h-8 rounded-lg text-xs"
							onClick={() => applyPreset(preset)}
						>
							{preset.label}
						</Button>
					))}
				</div>

				<div className="space-y-1.5">
					<Label htmlFor="text-unit">Format</Label>
					<Select value={params.unit} onValueChange={updateUnit}>
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
						<span className="text-xs font-medium tabular-nums text-muted-foreground">
							{count}
							{isCountPending ? (
								<span className="ml-1.5 text-primary">updating…</span>
							) : null}
						</span>
					</div>
					<input
						id="text-count"
						type="range"
						min={limits.min}
						max={limits.max}
						step={1}
						value={count}
						aria-label="Count"
						onChange={(event) =>
							setCount(
								clampPlaceholderTextCount(
									params.unit,
									Number(event.target.value) || limits.min,
								),
							)
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
							setParams((current) => ({
								...current,
								startWithLorem: event.target.checked,
							}))
						}
						className="size-4 rounded border-border accent-primary"
					/>
					Start with &ldquo;Lorem ipsum&hellip;&rdquo;
				</label>

				<div className="flex flex-col gap-2">
					<Button type="button" className="w-full gap-2" onClick={regenerate}>
						<Shuffle className="size-4" />
						Shuffle wording
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full gap-2"
						onClick={copyText}
						disabled={!text.trim() || isCountPending}
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
						{isCountPending || isRegenerating ? (
							<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-normal text-primary">
								<Loader2 className="size-3 animate-spin" />
								Updating
							</span>
						) : null}
					</div>
					<div className="flex items-center gap-3 text-xs text-muted-foreground">
						<span className="tabular-nums">{stats.words} words</span>
						<span className="tabular-nums">{stats.characters} chars</span>
						{stats.paragraphs > 1 ? (
							<span className="tabular-nums">{stats.paragraphs} paragraphs</span>
						) : null}
					</div>
				</div>

				<div className="space-y-3 p-5">
					<Textarea
						key={`${generationParams.unit}-${generationParams.count}-${generationParams.startWithLorem}-${refreshNonce}`}
						value={text}
						readOnly
						rows={18}
						className={cn(
							"min-h-[420px] resize-y bg-muted/20 font-normal leading-relaxed transition-opacity duration-200",
							(isCountPending || isRegenerating) && "opacity-60",
						)}
					/>
					<div className="flex items-center justify-between gap-3">
						<p className="text-xs text-muted-foreground">
							{isCountPending
								? "Preview refreshes shortly after you stop adjusting count."
								: "Same settings, new random wording — use Shuffle."}
						</p>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="shrink-0 gap-1.5"
							onClick={regenerate}
						>
							<RefreshCw
								className={cn("size-3.5", isRegenerating && "animate-spin")}
							/>
							Shuffle
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}
