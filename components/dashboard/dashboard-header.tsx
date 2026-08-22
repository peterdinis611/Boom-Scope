"use client";

import { useQuery } from "convex/react";
import { ChevronRight, Inbox, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
	CommandPalette,
	CommandPaletteTrigger,
} from "@/components/command-palette/command-palette";
import { CaptureDialog } from "@/components/inbox/capture-dialog";
import { ModeToggle } from "@/components/mode-toggle";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { DashboardMobileNav } from "./dashboard-nav";
import { HeaderQuickActions } from "./header-quick-actions";
import { useLayoutChrome } from "./layout-chrome-context";
import { useSidebar } from "./sidebar-context";

type Crumb = { label: string; href?: Route };

function buildBreadcrumbs(pathname: string): Crumb[] {
	const crumbs: Crumb[] = [{ label: "Dashboard", href: "/dashboard" }];

	if (pathname === "/dashboard") return crumbs;

	const segments = pathname.replace("/dashboard/", "").split("/");
	const labels: Record<string, string> = {
		projects: "Projects",
		inbox: "Inbox",
		notes: "Notes",
		links: "Link Hub",
		"sticky-notes": "Sticky Notes",
		tasks: "Tasks",
		canvas: "Canvas",
		"design-system": "Design System",
		v2: "Lab",
		generator: "AI Generator",
		images: "Placeholder Images",
		"placeholder-text": "Placeholder Text",
		pomodoro: "Pomodoro",
		settings: "Settings",
		new: "New",
	};

	let path = "/dashboard";
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		if (!segment) continue;
		path += `/${segment}`;
		const label = labels[segment] ?? segment;
		const isLast = i === segments.length - 1;
		crumbs.push({
			label,
			href: isLast ? undefined : (path as Route),
		});
	}

	return crumbs;
}

export function DashboardHeader() {
	const pathname = usePathname();
	const { mode, setClipboardOpen } = useLayoutChrome();
	const { isCollapsed, toggleSidebar } = useSidebar();
	const { history } = useCopyToClipboard();
	const inboxCount = useQuery(api.inbox.openCount);
	const [commandOpen, setCommandOpen] = useState(false);
	const [captureOpen, setCaptureOpen] = useState(false);
	const crumbs = buildBreadcrumbs(pathname);
	const isImmersive = mode === "immersive";

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
				const target = event.target as HTMLElement | null;
				const tag = target?.tagName;
				if (
					tag === "INPUT" ||
					tag === "TEXTAREA" ||
					target?.isContentEditable
				) {
					return;
				}
				event.preventDefault();
				setCaptureOpen(true);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<>
			<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
				{!isImmersive ? <DashboardMobileNav /> : null}
				{!isImmersive ? (
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={toggleSidebar}
						className="hidden md:flex"
						aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
					>
						{isCollapsed ? (
							<PanelLeftOpen className="size-4" />
						) : (
							<PanelLeftClose className="size-4" />
						)}
					</Button>
				) : null}

				<nav
					className="flex min-w-0 flex-1 items-center gap-1 text-sm"
					aria-label="Breadcrumb"
				>
					{crumbs.map((crumb, index) => (
						<span
							key={`${crumb.label}-${index}`}
							className="flex items-center gap-1"
						>
							{index > 0 ? (
								<ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
							) : null}
							{crumb.href ? (
								<Link
									href={crumb.href}
									className="truncate text-muted-foreground transition-colors hover:text-foreground"
								>
									{crumb.label}
								</Link>
							) : (
								<span className="truncate font-medium text-foreground">
									{crumb.label}
								</span>
							)}
						</span>
					))}
				</nav>

				<div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
					{mode === "default" ? (
						<>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="relative gap-2"
								onClick={() => setCaptureOpen(true)}
								aria-label="Quick capture"
							>
								<Inbox className="size-4" />
								<span className="hidden sm:inline">Capture</span>
								{inboxCount !== undefined && inboxCount > 0 ? (
									<span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
										{inboxCount > 9 ? "9+" : inboxCount}
									</span>
								) : null}
							</Button>
							<CommandPaletteTrigger onClick={() => setCommandOpen(true)} />
						</>
					) : null}
					{mode === "default" ? (
						<HeaderQuickActions
							onOpenClipboard={() => setClipboardOpen(true)}
							clipboardCount={history.length}
							onOpenCapture={() => setCaptureOpen(true)}
						/>
					) : null}
					<ModeToggle />
					<UserMenu />
				</div>
			</header>
			<CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
			<CaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} />
		</>
	);
}
