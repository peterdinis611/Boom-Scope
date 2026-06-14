"use client";

import { useMutation, useQuery } from "convex/react";
import {
	Check,
	Loader2,
	Monitor,
	Moon,
	Palette,
	Shield,
	Sun,
	Upload,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
	const user = useQuery(api.users.viewer);
	const updateUser = useMutation(api.users.updateUser);
	const { theme, setTheme } = useTheme();

	const [name, setName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [activeTab, setActiveTab] = useState("profile");

	useEffect(() => {
		if (user?.name && name === "") {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setName(user.name);
		}
	}, [user, name]);

	const handleUpdateProfilee = async () => {
		setIsUpdating(true);
		try {
			await updateUser({ name });
			toast.success("Profilee updated successfully");
		} catch {
			toast.error("Error updating profile");
		} finally {
			setIsUpdating(false);
		}
	};

	const tabs = [
		{ id: "profile", label: "Profile", icon: User },
		{ id: "appearance", label: "Appearance", icon: Palette },
	];

	if (!user) {
		return (
			<div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary opacity-20" />
			</div>
		);
	}

	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Settings"
				description="Manage your account and preferences."
			/>

			<div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[220px_1fr]">
				<div className="flex flex-col gap-1 rounded-lg border border-border p-1">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
								activeTab === tab.id
									? "bg-muted text-foreground"
									: "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
							)}
						>
							<tab.icon className="size-4" />
							{tab.label}
						</button>
					))}
				</div>

				{/* Content Area */}
				<div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
					{activeTab === "profile" && (
					<Card>
						<CardHeader>
							<CardTitle className="font-heading text-lg">Profile</CardTitle>
						</CardHeader>
						<CardContent className="space-y-8">
							<div className="flex items-center gap-6">
								<div className="relative">
									<div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
										{user.image ? (
											<img
												src={user.image}
												alt={user.name || ""}
												className="size-full object-cover"
											/>
										) : (
											<User className="size-10 text-muted-foreground/40" />
										)}
									</div>
								</div>
								<div className="space-y-1">
									<p className="font-medium">{user.name || "No name"}</p>
									<p className="text-sm text-muted-foreground">{user.email}</p>
									<Button size="sm" variant="outline" className="mt-2 gap-2">
										<Upload className="size-3.5" /> Upload photo
									</Button>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Full name</Label>
									<Input
										id="name"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Enter your name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email address</Label>
									<Input
										id="email"
										value={user.email || ""}
										readOnly
										className="cursor-not-allowed opacity-60"
									/>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									onClick={handleUpdateProfilee}
									disabled={isUpdating || name === user.name}
									className="gap-2"
								>
									{isUpdating ? (
										<Loader2 className="size-4 animate-spin" />
									) : (
										<Check className="size-4" />
									)}
									Save changes
								</Button>
							</div>

							<div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
								<div className="flex items-center gap-2 text-sm font-medium text-primary">
									<Shield className="size-4" />
									Your privacy
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									Your data is secure and we never share it with third
									parties. You can download your data or
									delete your account at any time.
								</p>
							</div>
						</CardContent>
					</Card>
				)}

					{activeTab === "appearance" && (
						<Card>
							<CardHeader>
								<CardTitle className="font-heading text-lg">Appearance</CardTitle>
							</CardHeader>
							<CardContent className="space-y-10">
							<section className="space-y-4">
								<div className="space-y-1">
									<h3 className="text-sm font-medium">Display mode</h3>
									<p className="text-sm text-muted-foreground">
										Customize the app environment
									</p>
								</div>

								<div className="flex flex-wrap gap-2">
									{[
										{ id: "light", icon: Sun, label: "Light" },
										{ id: "dark", icon: Moon, label: "Dark" },
										{ id: "system", icon: Monitor, label: "System" },
									].map((mode) => (
										<Button
											key={mode.id}
											type="button"
											variant={theme === mode.id ? "default" : "outline"}
											onClick={() => setTheme(mode.id)}
											className="gap-2"
										>
											<mode.icon className="size-4" />
											{mode.label}
										</Button>
									))}
								</div>
							</section>

							<section className="space-y-4">
								<div className="space-y-1">
									<h3 className="text-sm font-medium">Accent color</h3>
									<p className="text-sm text-muted-foreground">
										Choose the main interface color
									</p>
								</div>
								<div className="flex gap-4">
									{[
										"var(--primary)",
										"#06b6d4", // Cyan
										"var(--success)", // Green
										"#84cc16", // Lime
										"#f59e0b", // Amber
										"#f97316", // Orange
										"var(--destructive)", // Red
										"#f43f5e", // Rose
										"#8b5cf6", // Violet
										"#6366f1", // Indigo
										"#475569", // Slate
									].map((color) => (
										<button
											key={color}
											onClick={async () => {
												try {
													await updateUser({ accentColor: color });
													toast.success("Accent color changed");
												} catch {
													toast.error("Error changing color");
												}
											}}
											className={cn(
												"size-10 rounded-xl border-2 transition-all cursor-pointer shadow-sm relative flex items-center justify-center",
												user.accentColor === color
													? "border-foreground scale-110"
													: "border-transparent hover:scale-110 hover:border-foreground/20",
											)}
											style={{ backgroundColor: color }}
										>
											{user.accentColor === color && (
												<Check className="size-5 text-white drop-shadow-md" />
											)}
										</button>
									))}
								</div>
							</section>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</PageContainer>
	);
}
