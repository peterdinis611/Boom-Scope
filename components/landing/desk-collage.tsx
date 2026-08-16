/**
 * Signature visual: a surveyor's desk collage.
 * Paper slips = Kanban / notes / focus — product as physical instruments.
 */
export function DeskCollage() {
	return (
		<div
			className="landing-desk relative mx-auto aspect-[5/4] w-full max-w-xl lg:max-w-none"
			aria-hidden="true"
		>
			{/* Desk surface */}
			<div className="absolute inset-0 rounded-[1.25rem] bg-[var(--desk)] shadow-[0_30px_60px_-28px_rgba(28,36,48,0.45)] ring-1 ring-[var(--ink)]/10" />

			{/* Field notebook — notes */}
			<article className="landing-slip landing-slip-note absolute left-[6%] top-[10%] w-[46%] rotate-[-6deg] rounded-sm bg-[var(--paper)] p-4 shadow-[0_12px_28px_-12px_rgba(28,36,48,0.35)] ring-1 ring-[var(--ink)]/10">
				<p className="font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] text-[var(--cyan)] uppercase">
					Note
				</p>
				<p className="mt-2 font-[family-name:var(--font-landing-display)] text-lg leading-tight font-semibold tracking-tight text-[var(--ink)]">
					Launch checklist
				</p>
				<ul className="mt-3 space-y-1.5 font-[family-name:var(--font-landing-body)] text-[12px] leading-snug text-[var(--ink-muted)]">
					<li>— Finish board columns</li>
					<li>— Draft mobile frames</li>
					<li>— Ship auth copy</li>
				</ul>
				<div className="mt-4 h-px w-full bg-[var(--ink)]/10" />
				<p className="mt-2 font-[family-name:var(--font-landing-mono)] text-[10px] text-[var(--ink-muted)]">
					Pinned to project
				</p>
			</article>

			{/* Kanban slips */}
			<article className="landing-slip landing-slip-a absolute right-[8%] top-[14%] w-[38%] rotate-[4deg] rounded-sm bg-[var(--paper)] p-3 shadow-[0_12px_28px_-12px_rgba(28,36,48,0.35)] ring-1 ring-[var(--ink)]/10">
				<p className="font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] text-[var(--brass)] uppercase">
					Doing
				</p>
				<p className="mt-2 text-sm font-medium text-[var(--ink)]">
					Ship landing desk
				</p>
				<p className="mt-1 text-[11px] text-[var(--ink-muted)]">High · due today</p>
			</article>

			<article className="landing-slip landing-slip-b absolute right-[4%] top-[38%] w-[34%] rotate-[-2deg] rounded-sm bg-[var(--mist)] p-3 shadow-[0_10px_24px_-12px_rgba(28,36,48,0.3)] ring-1 ring-[var(--ink)]/8">
				<p className="font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] text-[var(--ink-muted)] uppercase">
					To do
				</p>
				<p className="mt-2 text-sm font-medium text-[var(--ink)]">Collect refs</p>
			</article>

			{/* Analog focus dial — pomodoro as instrument */}
			<article className="landing-slip landing-slip-timer absolute bottom-[10%] left-[12%] flex size-[34%] min-w-[7.5rem] flex-col items-center justify-center rounded-full bg-[var(--ink)] text-[var(--paper)] shadow-[0_18px_40px_-18px_rgba(28,36,48,0.55)] ring-4 ring-[var(--brass)]/35">
				<p className="font-[family-name:var(--font-landing-mono)] text-[9px] tracking-[0.22em] text-[var(--brass)] uppercase">
					Focus
				</p>
				<p className="mt-1 font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
					25:00
				</p>
				<p className="mt-1 text-[10px] text-[var(--paper)]/65">Pomodoro</p>
			</article>

			{/* Canvas scrap */}
			<article className="landing-slip landing-slip-canvas absolute right-[10%] bottom-[8%] w-[42%] rotate-[3deg] overflow-hidden rounded-sm bg-[var(--paper)] p-3 shadow-[0_12px_28px_-12px_rgba(28,36,48,0.35)] ring-1 ring-[var(--ink)]/10">
				<p className="font-[family-name:var(--font-landing-mono)] text-[10px] tracking-[0.18em] text-[var(--cyan)] uppercase">
					Canvas
				</p>
				<div className="mt-3 grid grid-cols-3 gap-1.5">
					<span className="col-span-2 h-10 rounded-sm bg-[var(--cyan)]/20" />
					<span className="h-10 rounded-sm bg-[var(--brass)]/25" />
					<span className="h-6 rounded-sm bg-[var(--ink)]/10" />
					<span className="col-span-2 h-6 rounded-sm bg-[var(--ink)]/8" />
				</div>
			</article>
		</div>
	);
}
