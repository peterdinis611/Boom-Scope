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
import { Menu, PanelLeftClose, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ScopeMark } from "@/components/brand/scope-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
	DASHBOARD_NAV_GROUPS,
	type DashboardNavItem,
	isDashboardNavItemActive,
} from "./dashboard-nav-items";
import { useSidebar } from "./sidebar-context";

function NavItemLink({
	item,
	isActive,
	onNavigate,
}: {
	item: DashboardNavItem;
	isActive: boolean;
	onNavigate?: () => void;
}) {
	const Icon = item.icon;

	if (!item.href) {
		return (
			<span
				aria-disabled="true"
				className="flex cursor-not-allowed items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-muted-foreground opacity-70"
			>
				<span
					className={cn(
						"flex size-8 shrink-0 items-center justify-center rounded-lg border",
						item.iconClassName,
					)}
				>
					<Icon className="size-4" aria-hidden="true" />
				</span>
				<span className="font-medium leading-none">{item.label}</span>
			</span>
		);
	}

	return (
		<Link
			href={item.href}
			onClick={onNavigate}
			data-active={isActive}
			aria-current={isActive ? "page" : undefined}
			className={cn(
				"group relative flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors",
				"hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
			)}
		>
			{isActive ? (
				<span
					className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
					aria-hidden="true"
				/>
			) : null}
			<span
				className={cn(
					"flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
					isActive ? item.activeIconClassName : item.iconClassName,
				)}
			>
				<Icon className="size-4" aria-hidden="true" />
			</span>
			<span className="min-w-0 flex-1">
				<span className="block font-medium leading-tight">{item.label}</span>
				{isActive ? (
					<span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground">
						{item.description}
					</span>
				) : null}
			</span>
		</Link>
	);
}

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
			className={cn("flex flex-col gap-5", className)}
			aria-label="Main navigation"
		>
			{DASHBOARD_NAV_GROUPS.map((group) => (
				<div key={group.id} className="flex flex-col gap-1">
					{group.label ? (
						<p className="px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
							{group.label}
						</p>
					) : null}
					<div className="flex flex-col gap-0.5">
						{group.items.map((item) => (
							<NavItemLink
								key={item.id}
								item={item}
								isActive={isDashboardNavItemActive(pathname, item)}
								onNavigate={onNavigate}
							/>
						))}
					</div>
				</div>
			))}
		</nav>
	);
}

function SidebarBrand({ onToggle }: { onToggle?: () => void }) {
	return (
		<div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-3">
			<Link
				href="/dashboard"
				className="flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-sidebar-accent/60"
			>
				<ScopeMark size="sm" />
				<span className="truncate font-heading text-base font-semibold tracking-tight text-sidebar-foreground">
					Boom Scope
				</span>
			</Link>
			{onToggle ? (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={onToggle}
					className="shrink-0 text-muted-foreground hover:text-foreground"
					aria-label="Close sidebar"
				>
					<PanelLeftClose className="size-4" />
				</Button>
			) : null}
		</div>
	);
}

export function DashboardSidebarNav() {
	const { toggleSidebar } = useSidebar();

	return (
		<div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
			<SidebarBrand onToggle={toggleSidebar} />
			<div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
				<NavLinks />
			</div>
			<div className="shrink-0 border-t border-sidebar-border px-4 py-3">
				<p className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
					Boom Scope · Field lab
				</p>
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
					aria-label="Open menu"
				>
					<Menu className="size-4" />
				</Button>
			</Trigger>
			<Portal>
				<Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
				<Content
					className={cn(
						"fixed top-0 left-0 z-50 flex h-full w-[min(100%,19rem)] flex-col bg-sidebar text-sidebar-foreground shadow-xl outline-none",
					)}
					aria-describedby={undefined}
				>
					<div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
						<Title className="flex items-center gap-2 font-heading text-base font-semibold">
							<ScopeMark size="sm" />
							Boom Scope
						</Title>
						<Close asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon-sm"
								aria-label="Close menu"
							>
								<X className="size-4" />
							</Button>
						</Close>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
						<NavLinks onNavigate={() => setOpen(false)} />
					</div>
				</Content>
			</Portal>
		</Root>
	);
}
