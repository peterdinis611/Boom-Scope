import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
	const isAuthenticated = await isAuthenticatedNextjs();

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
			<main className="flex w-full max-w-2xl flex-col items-center gap-10 rounded-2xl border border-border bg-background px-10 py-16 text-center shadow-sm">
				<div className="flex flex-col items-center gap-4">
					<span className="rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
						Boom Scope
					</span>
					<h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
						Vitajte v Boom Scope
					</h1>
					<p className="max-w-md text-base text-muted-foreground">
						Prihláste sa pre prístup k svojmu dashboardu, alebo si vytvorte nový
						účet pomocou emailu a hesla.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					{isAuthenticated ? (
						<Button asChild size="lg">
							<Link href="/dashboard">Prejsť na dashboard</Link>
						</Button>
					) : (
						<>
							<Button asChild size="lg">
								<Link href="/login">Prihlásiť sa</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/register">Registrovať sa</Link>
							</Button>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
