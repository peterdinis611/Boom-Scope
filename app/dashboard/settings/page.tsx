"use client";

import { useMutation, useQuery } from "convex/react";
import {
	Camera,
	Check,
	Loader2,
	Monitor,
	Moon,
	Palette,
	Settings as SettingsIcon,
	Shield,
	Sun,
	Upload,
	User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

	const handleUpdateProfile = async () => {
		setIsUpdating(true);
		try {
			await updateUser({ name });
			toast.success("Profil bol úspešne aktualizovaný");
		} catch {
			toast.error("Chyba pri aktualizácii profilu");
		} finally {
			setIsUpdating(false);
		}
	};

	const tabs = [
		{ id: "profile", label: "Profil", icon: User },
		{ id: "appearance", label: "Vzhľad", icon: Palette },
	];

	if (!user) {
		return (
			<div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary opacity-20" />
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto py-10 px-6 space-y-12">
			<div className="space-y-4">
				<div className="flex items-center gap-4">
					<div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
						<SettingsIcon className="size-6 text-primary" />
					</div>
					<div>
						<h1 className="text-3xl font-black tracking-tight">Nastavenia</h1>
						<p className="text-sm font-bold opacity-30 uppercase tracking-widest mt-1">
							Správa vášho účtu a preferencií
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
				{/* Navigation Tabs */}
				<div className="flex flex-col gap-2 p-2 bg-foreground/5 rounded-[32px] border border-border/50">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
								activeTab === tab.id
									? "bg-background text-primary shadow-xl shadow-primary/5 border border-border"
									: "text-foreground/40 hover:text-foreground hover:bg-foreground/5",
							)}
						>
							<tab.icon
								className={cn(
									"size-4",
									activeTab === tab.id ? "text-primary" : "opacity-40",
								)}
							/>
							{tab.label}
						</button>
					))}
				</div>

				{/* Content Area */}
				<div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
					{activeTab === "profile" && (
						<div className="space-y-10">
							<section className="space-y-8">
								<div className="flex items-center gap-8">
									<div className="relative group">
										<div className="size-32 rounded-[40px] bg-foreground/5 border-2 border-border overflow-hidden shadow-inner flex items-center justify-center group-hover:border-primary/50 transition-all duration-500">
											{user.image ? (
												<img
													src={user.image}
													alt={user.name || ""}
													className="size-full object-cover"
												/>
											) : (
												<User className="size-12 opacity-10" />
											)}
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
												<Camera className="size-8 text-white animate-in zoom-in-50" />
											</div>
										</div>
									</div>
									<div className="space-y-2">
										<h3 className="text-xl font-black tracking-tight">
											{user.name || "Bez mena"}
										</h3>
										<p className="text-sm font-bold opacity-30 font-mono tracking-tighter">
											{user.email}
										</p>
										<div className="flex gap-2 pt-2">
											<Button
												size="sm"
												variant="outline"
												className="rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
											>
												<Upload className="size-3" /> Nahrať fotku
											</Button>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div className="space-y-3">
										<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">
											Meno a Priezvisko
										</Label>
										<Input
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Zadajte vaše meno"
											className="h-14 bg-foreground/5 border-border rounded-2xl px-6 text-sm font-bold focus:bg-background transition-all"
										/>
									</div>
									<div className="space-y-3">
										<Label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-1">
											E-mailová adresa
										</Label>
										<Input
											value={user.email || ""}
											readOnly
											className="h-14 bg-foreground/5 border-border rounded-2xl px-6 text-sm font-bold opacity-50 cursor-not-allowed"
										/>
									</div>
								</div>

								<div className="flex justify-end pt-4">
									<Button
										onClick={handleUpdateProfile}
										disabled={isUpdating || name === user.name}
										className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-primary/20 gap-3"
									>
										{isUpdating ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											<Check className="size-4" />
										)}
										Uložiť zmeny
									</Button>
								</div>
							</section>

							<div className="p-8 rounded-[40px] bg-primary/5 border border-primary/10 space-y-4">
								<div className="flex items-center gap-3">
									<Shield className="size-4 text-primary" />
									<h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
										Vaše súkromie
									</h4>
								</div>
								<p className="text-xs font-bold leading-relaxed opacity-60">
									Vaše údaje sú v bezpečí a nikdy ich nezdieľame s tretími
									stranami. Svoje dáta si môžete kedykoľvek stiahnuť alebo
									zmazať svoj účet.
								</p>
							</div>
						</div>
					)}

					{activeTab === "appearance" && (
						<div className="space-y-12">
							<section className="space-y-8">
								<div className="space-y-2">
									<h3 className="text-xl font-black tracking-tight">
										Režim zobrazenia
									</h3>
									<p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
										Prispôsobte si prostredie aplikácie
									</p>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{[
										{ id: "light", icon: Sun, label: "Svetlý" },
										{ id: "dark", icon: Moon, label: "Tmavý" },
										{ id: "system", icon: Monitor, label: "Systémový" },
									].map((mode) => (
										<button
											key={mode.id}
											onClick={() => setTheme(mode.id)}
											className={cn(
												"group relative p-8 rounded-[32px] border-2 transition-all duration-500 flex flex-col items-center gap-6",
												theme === mode.id
													? "bg-background border-primary shadow-2xl shadow-primary/10"
													: "bg-foreground/5 border-transparent hover:border-foreground/10",
											)}
										>
											<div
												className={cn(
													"size-16 rounded-2xl flex items-center justify-center transition-all duration-500",
													theme === mode.id
														? "bg-primary/10"
														: "bg-foreground/5",
												)}
											>
												<mode.icon
													className={cn(
														"size-8",
														theme === mode.id
															? "text-primary"
															: "opacity-20 group-hover:opacity-40",
													)}
												/>
											</div>
											<span
												className={cn(
													"text-[11px] font-black uppercase tracking-widest",
													theme === mode.id ? "text-primary" : "opacity-40",
												)}
											>
												{mode.label}
											</span>
											{theme === mode.id && (
												<div className="absolute top-4 right-4 size-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
													<Check className="size-3 text-white" />
												</div>
											)}
										</button>
									))}
								</div>
							</section>

							<section className="space-y-8">
								<div className="space-y-2">
									<h3 className="text-xl font-black tracking-tight">
										Akcentová farba
									</h3>
									<p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">
										Vyberte si hlavnú farbu rozhrania
									</p>
								</div>
								<div className="flex gap-4">
									{[
										"var(--primary)",
										"var(--success)",
										"#f59e0b",
										"var(--destructive)",
										"#8b5cf6",
									].map((color) => (
										<button
											key={color}
											onClick={async () => {
												try {
													await updateUser({ accentColor: color });
													toast.success("Akcentová farba bola zmenená");
												} catch {
													toast.error("Chyba pri zmene farby");
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
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
