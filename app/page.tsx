import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function Home() {
	const isAuthenticated = await isAuthenticatedNextjs();

	return (
		<div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-20">
			<main className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
				<div className="flex flex-col items-center gap-3">
					<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Boom Scope
					</span>
					<h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						Welcome to Boom Scope
					</h1>
					<p className="max-w-md text-sm text-muted-foreground">
						Sign in to access the dashboard, or create a new account with your
						email and password.
					</p>
				</div>

				<div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
					{isAuthenticated ? (
						<Link
							href="/dashboard"
							className={cn(buttonVariants({ size: "lg" }), "sm:min-w-40")}
						>
							Go to dashboard
						</Link>
					) : (
						<>
							<Link
								href="/login"
								className={cn(buttonVariants({ size: "lg" }), "sm:min-w-36")}
							>
								Sign in
							</Link>
							<Link
								href="/register"
								className={cn(
									buttonVariants({ variant: "outline", size: "lg" }),
									"sm:min-w-36",
								)}
							>
								Sign up
							</Link>
						</>
					)}
				</div>
			</main>
		</div>
	);
}
