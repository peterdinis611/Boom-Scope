import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	title: "Reset password",
	description: "Reset your Boom Scope account password.",
	alternates: { canonical: "/forgot-password" },
	robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({
	children,
}: {
	children: ReactNode;
}) {
	return children;
}
