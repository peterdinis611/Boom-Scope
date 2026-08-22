/**
 * Signature visual: a surveyor's desk collage.
 * Paper slips = Kanban / notes / focus — product as physical instruments.
 * Uses the same Field Scope tokens as auth + dashboard.
 */
export function DeskCollage() {
	return (
		<div
			className="landing-desk relative mx-auto aspect-[5/4] w-full max-w-xl lg:max-w-none"
			aria-hidden="true"
		>
			{/* Desk surface */}
			<div className="absolute inset-0 rounded-2xl bg-muted shadow-[0_30px_60px_-28px_rgba(26,36,56,0.35)] ring-1 ring-border" />

			{/* Field notebook — notes */}
			<article className="landing-slip landing-slip-note absolute left-[6%] top-[10%] w-[46%] rotate-[-6deg] rounded-lg bg-card p-4 shadow-md ring-1 ring-border">
				<p className="font-mono text-[10px] tracking-[0.18em] text-scope uppercase">
					Note
				</p>
				<p className="mt-2 font-heading text-lg leading-tight font-semibold tracking-tight text-foreground">
					Launch checklist
				</p>
				<ul className="mt-3 space-y-1.5 text-[12px] leading-snug text-muted-foreground">
					<li>— Finish board columns</li>
					<li>— Draft mobile frames</li>
					<li>— Ship auth copy</li>
				</ul>
				<div className="mt-4 h-px w-full bg-border" />
				<p className="mt-2 font-mono text-[10px] text-muted-foreground">
					Pinned to project
				</p>
			</article>

			{/* Kanban slips */}
			<article className="landing-slip landing-slip-a absolute right-[8%] top-[14%] w-[38%] rotate-[4deg] rounded-lg bg-card p-3 shadow-md ring-1 ring-border">
				<p className="font-mono text-[10px] tracking-[0.18em] text-primary uppercase">
					Doing
				</p>
				<p className="mt-2 text-sm font-medium text-foreground">
					Ship landing desk
				</p>
				<p className="mt-1 text-[11px] text-muted-foreground">High · due today</p>
			</article>

			<article className="landing-slip landing-slip-b absolute right-[4%] top-[38%] w-[34%] rotate-[-2deg] rounded-lg bg-secondary p-3 shadow-sm ring-1 ring-border/80">
				<p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
					To do
				</p>
				<p className="mt-2 text-sm font-medium text-foreground">Collect refs</p>
			</article>

			{/* Analog focus dial — pomodoro as instrument */}
			<article className="landing-slip landing-slip-timer absolute bottom-[10%] left-[12%] flex size-[34%] min-w-[7.5rem] flex-col items-center justify-center rounded-full bg-foreground text-background shadow-lg ring-4 ring-primary/35">
				<p className="font-mono text-[9px] tracking-[0.22em] text-primary uppercase">
					Focus
				</p>
				<p className="mt-1 font-heading text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
					25:00
				</p>
				<p className="mt-1 text-[10px] text-background/65">Pomodoro</p>
			</article>

			{/* Canvas scrap */}
			<article className="landing-slip landing-slip-canvas absolute right-[10%] bottom-[8%] w-[42%] rotate-[3deg] overflow-hidden rounded-lg bg-card p-3 shadow-md ring-1 ring-border">
				<p className="font-mono text-[10px] tracking-[0.18em] text-scope uppercase">
					Canvas
				</p>
				<div className="mt-3 grid grid-cols-3 gap-1.5">
					<span className="col-span-2 h-10 rounded-md bg-scope/20" />
					<span className="h-10 rounded-md bg-primary/25" />
					<span className="h-6 rounded-md bg-muted" />
					<span className="col-span-2 h-6 rounded-md bg-muted/80" />
				</div>
			</article>
		</div>
	);
}
