import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { LayoutChromeProvider } from "@/components/dashboard/layout-chrome-context";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";

type DashboardProvidersProps = {
	children: ReactNode;
};

export function DashboardProviders({ children }: DashboardProvidersProps) {
	return (
		<LayoutChromeProvider>
			<SidebarProvider>{children}</SidebarProvider>
		</LayoutChromeProvider>
	);
}

export function renderWithDashboardProviders(
	ui: ReactElement,
	options?: Omit<RenderOptions, "wrapper">,
) {
	return render(ui, {
		wrapper: DashboardProviders,
		...options,
	});
}
