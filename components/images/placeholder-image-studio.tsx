"use client";

import { Copy, Download, ImageIcon, RefreshCw, Shuffle } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	buildPicsumUrl,
	downloadOptimizedPlaceholderImage,
	getPlaceholderDimensions,
	PLACEHOLDER_SIZE_PRESETS,
	type PlaceholderImageParams,
} from "@/lib/placeholder-image";

const DEFAULT_PARAMS: PlaceholderImageParams = {
	width: 800,
	height: 600,
	seed: "",
	grayscale: false,
	blur: 0,
	square: false,
};

export function PlaceholderImageStudio() {
	const [params, setParams] = useState<PlaceholderImageParams>(DEFAULT_PARAMS);
	const [previewKey, setPreviewKey] = useState(0);
	const [isDownloading, startDownload] = useTransition();

	const imageUrl = useMemo(() => buildPicsumUrl(params), [params]);
	const dimensions = useMemo(() => getPlaceholderDimensions(params), [params]);
	const previewWidth = Math.min(dimensions.width, 960);
	const previewHeight = Math.round(
		(dimensions.height / dimensions.width) * previewWidth,
	);

	const updateParams = (updates: Partial<PlaceholderImageParams>) => {
		setParams((current) => ({ ...current, ...updates }));
	};

	const copyUrl = async () => {
		await navigator.clipboard.writeText(imageUrl);
		toast.success("URL copied to clipboard");
	};

	const handleDownload = () => {
		startDownload(async () => {
			try {
				await downloadOptimizedPlaceholderImage(params);
				toast.success("Image downloaded as optimized WebP");
			} catch {
				toast.error("Download failed. Try again.");
			}
		});
	};

	return (
		<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
			<Card className="h-fit space-y-6 p-5">
				<div className="space-y-1">
					<h2 className="text-sm font-semibold">Parameters</h2>
					<p className="text-xs text-muted-foreground">
						Build a Picsum URL with size, seed, and filters.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{PLACEHOLDER_SIZE_PRESETS.map((preset) => (
						<Button
							key={preset.label}
							type="button"
							variant="outline"
							size="sm"
							className="h-8 rounded-lg text-xs"
							onClick={() =>
								updateParams({
									width: preset.width,
									height: "height" in preset ? preset.height : preset.width,
									square: "square" in preset ? preset.square : false,
								})
							}
						>
							{preset.label}
						</Button>
					))}
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label htmlFor="width">Width (px)</Label>
						<Input
							id="width"
							type="number"
							min={1}
							max={5000}
							value={params.width}
							onChange={(e) =>
								updateParams({ width: Number(e.target.value) || 1 })
							}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="height">Height (px)</Label>
						<Input
							id="height"
							type="number"
							min={1}
							max={5000}
							value={params.square ? params.width : (params.height ?? params.width)}
							disabled={params.square}
							onChange={(e) =>
								updateParams({
									height: Number(e.target.value) || 1,
									square: false,
								})
							}
						/>
					</div>
				</div>

				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={params.square}
						onChange={(e) =>
							updateParams({
								square: e.target.checked,
								height: e.target.checked ? params.width : params.height,
							})
						}
						className="size-4 rounded border-border accent-primary"
					/>
					Square image
				</label>

				<div className="space-y-1.5">
					<Label htmlFor="seed">Seed (optional)</Label>
					<div className="flex gap-2">
						<Input
							id="seed"
							value={params.seed ?? ""}
							onChange={(e) => updateParams({ seed: e.target.value })}
							placeholder="e.g. hero-banner"
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() =>
								updateParams({ seed: `image-${Date.now().toString(36)}` })
							}
							title="Random seed"
						>
							<Shuffle className="size-4" />
						</Button>
					</div>
					<p className="text-[11px] text-muted-foreground">
						Same seed always returns the same image.
					</p>
				</div>

				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={params.grayscale}
						onChange={(e) => updateParams({ grayscale: e.target.checked })}
						className="size-4 rounded border-border accent-primary"
					/>
					Grayscale
				</label>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="blur">Blur</Label>
						<span className="text-xs text-muted-foreground">
							{params.blur ?? 0}
						</span>
					</div>
					<input
						id="blur"
						type="range"
						min={0}
						max={10}
						step={1}
						value={params.blur ?? 0}
						onChange={(e) =>
							updateParams({ blur: Number(e.target.value) || 0 })
						}
						className="w-full accent-primary"
					/>
				</div>

				<div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						Generated URL
					</p>
					<p className="break-all font-mono text-[11px] leading-relaxed">
						{imageUrl}
					</p>
					<div className="flex flex-wrap gap-2 pt-1">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={copyUrl}
						>
							<Copy className="size-3.5" />
							Copy URL
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={() => setPreviewKey((value) => value + 1)}
						>
							<RefreshCw className="size-3.5" />
							Refresh preview
						</Button>
					</div>
				</div>

				<Button
					type="button"
					className="w-full gap-2"
					onClick={handleDownload}
					disabled={isDownloading}
				>
					<Download className="size-4" />
					{isDownloading ? "Downloading…" : "Download optimized WebP"}
				</Button>
			</Card>

			<Card className="overflow-hidden">
				<div className="flex items-center justify-between border-b border-border px-5 py-3">
					<div className="flex items-center gap-2 text-sm font-medium">
						<ImageIcon className="size-4 text-primary" />
						Preview
					</div>
					<span className="text-xs text-muted-foreground">
						{dimensions.width} × {dimensions.height}px · Next.js WebP
					</span>
				</div>

				<div className="flex min-h-[420px] items-center justify-center bg-[linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.04)_75%),linear-gradient(45deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_75%,rgba(0,0,0,0.04)_75%)] bg-size-[20px_20px] bg-position-[0_0,10px_10px] p-6">
					<div
						className="relative overflow-hidden rounded-xl border border-border bg-background shadow-lg"
						style={{ width: previewWidth, height: previewHeight }}
					>
						<Image
							key={`${imageUrl}-${previewKey}`}
							src={imageUrl}
							alt={`Placeholder ${dimensions.width} by ${dimensions.height}`}
							width={previewWidth}
							height={previewHeight}
							sizes="(max-width: 1280px) 100vw, 960px"
							className="h-full w-full object-cover"
							priority
						/>
					</div>
				</div>
			</Card>
		</div>
	);
}
