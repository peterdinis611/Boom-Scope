import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";

export const metadata: Metadata = {
	title: {
		default: "Dashboard",
		template: "%s · Boom Scope",
	},
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: {
			index: false,
			follow: false,
			noimageindex: true,
		},
	},
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
