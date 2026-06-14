export type DashboardLayoutMode = "default" | "immersive" | "focused";

export function getDashboardLayoutMode(pathname: string): DashboardLayoutMode {
	if (
		pathname.startsWith("/dashboard/canvas") ||
		pathname.startsWith("/dashboard/generator") ||
		pathname.startsWith("/dashboard/sticky-notes")
	) {
		return "immersive";
	}
	if (pathname.startsWith("/dashboard/pomodoro")) {
		return "focused";
	}
	return "default";
}
