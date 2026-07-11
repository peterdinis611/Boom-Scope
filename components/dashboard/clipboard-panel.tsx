"use client";

import { Check, Clipboard, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { formatAppTime } from "@/lib/locale";
import { cn } from "@/lib/utils";
import { useLayoutChrome } from "./layout-chrome-context";

function isColor(text: string) {
	return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(text.trim());
}

export function ClipboardPanel() {
	const { clipboardOpen, setClipboardOpen } = useLayoutChrome();
	const { history, copy, clearHistory, deleteHistoryItem, copiedValue } =
		useCopyToClipboard();

	return (
		<Dialog open={clipboardOpen} onOpenChange={setClipboardOpen}>
			<DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Clipboard className="size-4" />
						Clipboard ({history.length}/10)
					</DialogTitle>
				</DialogHeader>
				{history.length > 0 ? (
					<div className="flex justify-end">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={clearHistory}
							className="text-destructive hover:text-destructive"
						>
							Clear
						</Button>
					</div>
				) : null}
				{history.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<Clipboard className="mb-3 size-8 text-muted-foreground" />
						<p className="text-sm font-medium">Clipboard is empty</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Values copied from the design system will appear here.
						</p>
					</div>
				) : (
					<div className="max-h-80 space-y-2 overflow-y-auto pr-1">
						{history.map((item) => {
							const isHex = isColor(item.text);
							return (
								<div
									key={item.id}
									className={cn(
										"group flex items-center justify-between gap-3 rounded-lg border border-border transition-colors hover:bg-muted/50",
									)}
								>
									<button
										type="button"
										onClick={() =>
											copy(item.text, "Item copied from clipboard history")
										}
										className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left"
									>
										{isHex ? (
											<div
												className="size-7 shrink-0 rounded-md border border-border"
												style={{ backgroundColor: item.text }}
											/>
										) : (
											<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">
												Aa
											</div>
										)}
										<div className="min-w-0">
											<p className="truncate font-mono text-xs font-medium">
												{item.text}
											</p>
											<span className="text-xs text-muted-foreground">
												{formatAppTime(item.timestamp, {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</span>
										</div>
									</button>
									<div className="flex shrink-0 items-center gap-1 pr-3">
										{copiedValue === item.text ? (
											<Check className="size-4 text-success" />
										) : (
											<Copy className="size-3.5 text-muted-foreground opacity-60" />
										)}
										<Button
											type="button"
											variant="ghost"
											size="icon-xs"
											onClick={(e) => {
												e.stopPropagation();
												deleteHistoryItem(item.id);
											}}
											aria-label="Remove item"
										>
											<Trash2 className="size-3.5" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
