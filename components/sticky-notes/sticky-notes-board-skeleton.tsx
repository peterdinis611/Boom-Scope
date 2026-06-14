export function StickyNotesBoardSkeleton() {
	return (
		<div
			aria-hidden
			className="flex h-full min-h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-muted/20"
		>
			<div className="flex items-center gap-2 border-b border-border bg-background/80 px-3 py-2">
				<div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
				<div className="flex gap-1.5">
					{Array.from({ length: 8 }).map((_, index) => (
						<div
							key={index}
							className="size-7 animate-pulse rounded-full bg-muted"
						/>
					))}
				</div>
			</div>
			<div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.08)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)]">
				<div className="absolute left-8 top-8 h-52 w-56 animate-pulse rounded-md bg-muted/80" />
				<div className="absolute left-40 top-24 h-48 w-52 animate-pulse rounded-md bg-muted/60" />
			</div>
		</div>
	);
}
