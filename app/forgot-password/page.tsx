import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
	return (
		<AuthShell
			title="Reset password"
			description="Password reset via email is temporarily unavailable."
		>
			<Card className="border-border/80 bg-card/80 shadow-lg shadow-primary/5 backdrop-blur-sm">
				<CardContent className="pt-6 text-sm text-muted-foreground">
					Contact support if you need help accessing your account. You can return
					to sign in anytime.
				</CardContent>
				<CardFooter>
					<Button asChild variant="outline" className="w-full">
						<Link href="/login">Back to sign in</Link>
					</Button>
				</CardFooter>
			</Card>
		</AuthShell>
	);
}
