"use client";

import {
	Close,
	Content,
	Overlay,
	Portal,
	Root,
	Title,
	Trigger,
} from "@radix-ui/react-dialog";
import {
	FileText,
	FolderKanban,
	LayoutDashboard,
	Menu,
	Palette,
	Settings as SettingsIcon,
	Sparkles,
	X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardNavId =
	| "overview"
	| "projects"
	| "notes"
	| "design"
	| "generate"
	| "settings";

const navItems: {
	id: DashboardNavId;
	label: string;
	description: string;
	icon: React.ElementType;
	href?: Route;
	soon?: boolean;
}[] = [
	{
		id: "overview",
		label: "Prehľad",
		description: "Domovská stránka projektu",
		icon: LayoutDashboard,
		href: "/dashboard",
	},
	{
		id: "projects",
		label: "Projekty",
		description: "Spravovať vaše projekty",
		icon: FolderKanban,
		href: "/dashboard/projects",
	},
	{
		id: "notes",
		label: "Poznámky",
		description: "Písať poznámky k projektu",
		icon: FileText,
		href: "/dashboard/notes",
	},
	{
		id: "design",
		label: "Canvas",
		description: "Pracovný priestor pre dizajn",
		icon: Palette,
		href: "/dashboard/canvas",
	},
	{
		id: "generate",
		label: "Design System",
		description: "AI generátor vizuálnej identity",
		icon: Sparkles,
		href: "/dashboard/design-system",
	},
	{
		id: "settings",
		label: "Nastavenia",
		description: "Správa účtu a preferencií",
		icon: SettingsIcon,
		href: "/dashboard/settings" as Route,
	},
];

function NavLinks({
	onNavigate,
	className,
}: {
	onNavigate?: () => void;
	className?: string;
}) {
	const pathname = usePathname();

	return (
		<nav
			className={cn("flex flex-col gap-1", className)}
			aria-label="Hlavná navigácia"
		>
			{navItems.map((item) => {
				const Icon = item.icon;
				const isActive =
					(item.id === "overview" && pathname === "/dashboard") ||
					(item.id !== "overview" &&
						item.href &&
						pathname.startsWith(item.href));

				const content = (
					<>
						<Icon
							className={cn(
								"size-4 shrink-0",
								isActive ? "text-primary" : "text-muted-foreground",
							)}
							aria-hidden
						/>
						<span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
							<span className="flex items-center gap-2 font-medium leading-none">
								{item.label}
							</span>
							<span className="text-xs font-normal text-muted-foreground">
								{item.description}
							</span>
						</span>
					</>
				);

				if (item.href) {
					return (
						<Link
							key={item.id}
							href={item.href}
							onClick={onNavigate}
							data-active={isActive}
							className={cn(
								"flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
								"hover:bg-sidebar-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
							)}
						>
							{content}
						</Link>
					);
				}

				return (
					<div
						key={item.id}
						role="link"
						aria-disabled="true"
						tabIndex={-1}
						className={cn(
							"flex cursor-not-allowed items-start gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground opacity-80",
							isActive &&
								"bg-sidebar-accent/40 text-sidebar-foreground opacity-100",
						)}
					>
						{content}
					</div>
				);
			})}
		</nav>
	);
}

export function DashboardSidebarNav() {
	return (
		<div className="flex h-full min-h-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
			<div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
				<Link
					href="/dashboard"
					className="font-heading text-lg font-semibold tracking-tight text-sidebar-foreground"
				>
					Boom Scope
				</Link>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto p-3">
				<NavLinks />
			</div>
		</div>
	);
}

export function DashboardMobileNav() {
	const [open, setOpen] = React.useState(false);

	return (
		<Root open={open} onOpenChange={setOpen}>
			<Trigger asChild>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					className="md:hidden"
					aria-label="Otvoriť menu"
				>
					<Menu className="size-4" />
				</Button>
			</Trigger>
			<Portal>
				<Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
				<Content
					className={cn(
						"fixed top-0 left-0 z-50 flex h-full w-[min(100%,18rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg outline-none",
					)}
					aria-describedby={undefined}
				>
					<div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
						<Title className="font-heading text-lg font-semibold">Menu</Title>
						<Close asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Zavrieť menu"
							>
								<X className="size-4" />
							</Button>
						</Close>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto p-3">
						<NavLinks onNavigate={() => setOpen(false)} className="gap-0.5" />
					</div>
				</Content>
			</Portal>
		</Root>
	);
}

export { navItems };
