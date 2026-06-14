import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function ForgotPasswordPage() {
	return (
		<div className="flex flex-1 items-center justify-center bg-background px-4 py-16">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Reset password</CardTitle>
					<CardDescription>
						Password reset via email is temporarily unavailable. Contact support
						if you need help accessing your account.
					</CardDescription>
				</CardHeader>
				<CardFooter>
					<Button asChild variant="outline">
						<Link href="/login">Back to sign in</Link>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
