"use client";

import { usePaginatedQuery } from "convex/react";
import {
	Calendar,
	Download,
	FileText,
	Folder,
	Loader2,
	Plus,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { downloadNoteAsPdf, downloadNoteAsTxt } from "@/lib/notes";

export function NoteList() {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const { results, status, loadMore } = usePaginatedQuery(
		api.notes.list,
		{ searchTerm: debouncedSearchTerm || undefined },
		{ initialNumItems: 9 },
	);

	// To prevent flickering: preserve previous results while loading the first page of a new query
	const [preservedResults, setPreservedResults] = useState<typeof results>([]);
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	useEffect(() => {
		if (status !== "LoadingFirstPage") {
			setPreservedResults(results);
			setIsFirstLoad(false);
		}
	}, [results, status]);

	const isSearching = searchTerm !== debouncedSearchTerm || status === "LoadingFirstPage";

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative flex-1 max-w-sm">
					{isSearching ? (
						<Loader2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary animate-spin" />
					) : (
						<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-60" />
					)}
					<Input
						placeholder="Hľadať v poznámkach..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9 h-11 rounded-2xl bg-background/40 backdrop-blur-3xl border-border"
					/>
				</div>
				<Link href="/dashboard/notes/new">
					<Button size="sm" className="gap-2 rounded-xl h-11 px-5">
						<Plus className="size-4" />
						Nová poznámka
					</Button>
				</Link>
			</div>

			{preservedResults.length === 0 && (isFirstLoad || status === "LoadingFirstPage") ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Card key={i} className="h-50 rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm">
							<CardHeader>
								<Skeleton className="h-5 w-2/3 rounded-lg" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full mb-2 rounded-md" />
								<Skeleton className="h-4 w-full mb-2 rounded-md" />
								<Skeleton className="h-4 w-2/3 rounded-md" />
							</CardContent>
						</Card>
					))}
				</div>
			) : preservedResults.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/60 py-16 text-center bg-background/20">
					<div className="rounded-full bg-muted p-4 border border-border/40">
						<Search className="size-6 text-muted-foreground" />
					</div>
					<div className="space-y-1">
						<h3 className="font-heading text-lg font-black tracking-tight">
							Žiadne poznámky
						</h3>
						<p className="text-sm text-muted-foreground max-w-xs px-4">
							{searchTerm
								? "Skúste zadať iný vyhľadávací výraz."
								: "Zatiaľ ste nevytvorili žiadnu poznámku."}
						</p>
					</div>
				</div>
			) : (
				<div
					className={cn(
						"grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
						status === "LoadingFirstPage" ? "opacity-60 pointer-events-none" : "opacity-100"
					)}
				>
					{preservedResults.map((note) => (
						<Link key={note._id} href={`/dashboard/notes/${note._id}`}>
							<Card className="group h-full transition-all duration-300 hover:border-primary/40 hover:shadow-md rounded-3xl bg-background/30 backdrop-blur-sm border-border/50">
								<CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
									<CardTitle className="line-clamp-1 text-base font-black tracking-tight">
										{note.title}
									</CardTitle>
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button
											variant="ghost"
											size="icon-sm"
											className="size-7 rounded-lg"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												downloadNoteAsTxt(note.title, note.content);
											}}
											title="Stiahnuť ako .txt"
										>
											<Download className="size-3.5" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											className="size-7 rounded-lg"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												downloadNoteAsPdf(note.title, note.content);
											}}
											title="Stiahnuť ako .pdf"
										>
											<FileText className="size-3.5" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<div
										className="line-clamp-3 text-sm text-muted-foreground prose-sm prose-p:my-0"
										dangerouslySetInnerHTML={{ __html: note.content }}
									/>
								</CardContent>
								<CardFooter className="flex items-center justify-between gap-2 pt-0 text-[11px] font-semibold text-muted-foreground/60">
									<div className="flex items-center gap-1">
										<Calendar className="size-3 opacity-60" />
										<span>
											{new Date(note._creationTime).toLocaleDateString("sk-SK")}
										</span>
									</div>
									{note.projectName && (
										<div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-primary border border-primary/10 text-[10px] font-black uppercase tracking-wider">
											<Folder className="size-3 opacity-80" />
											<span className="truncate max-w-20">
												{note.projectName}
											</span>
										</div>
									)}
								</CardFooter>
							</Card>
						</Link>
					))}

					{status === "LoadingMore" && (
						<>
							{[1, 2, 3].map((i) => (
								<Card key={`more-${i}`} className="h-50 rounded-3xl border-border/50 bg-background/50 backdrop-blur-sm">
									<CardHeader>
										<Skeleton className="h-5 w-2/3 rounded-lg" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-4 w-full mb-2 rounded-md" />
										<Skeleton className="h-4 w-full mb-2 rounded-md" />
										<Skeleton className="h-4 w-2/3 rounded-md" />
									</CardContent>
								</Card>
							))}
						</>
					)}
				</div>
			)}

			{status === "CanLoadMore" && (
				<div className="flex justify-center pt-4">
					<Button
						variant="outline"
						onClick={() => loadMore(9)}
						className="min-w-30 rounded-2xl h-11 font-bold uppercase tracking-wider text-[10px] border-border/60 hover:bg-muted"
					>
						Načítať viac
					</Button>
				</div>
			)}
		</div>
	);
}
