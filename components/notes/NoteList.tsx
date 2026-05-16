"use client";

import { usePaginatedQuery } from "convex/react";
import { Calendar, Download, Folder, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
import { downloadNoteAsTxt } from "@/lib/notes";

export function NoteList() {
	const [searchTerm, setSearchTerm] = useState("");
	const { results, status, loadMore } = usePaginatedQuery(
		api.notes.list,
		{ searchTerm: searchTerm || undefined },
		{ initialNumItems: 9 },
	);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Hľadať v poznámkach..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Link href="/dashboard/notes/new">
					<Button size="sm" className="gap-2">
						<Plus className="size-4" />
						Nová poznámka
					</Button>
				</Link>
			</div>

			{results.length === 0 &&
			(status === "LoadingFirstPage" || status === "LoadingMore") ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Card key={i} className="h-[200px]">
							<CardHeader>
								<Skeleton className="h-5 w-2/3" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-full mb-2" />
								<Skeleton className="h-4 w-2/3" />
							</CardContent>
						</Card>
					))}
				</div>
			) : results.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
					<div className="rounded-full bg-muted p-3">
						<Search className="size-6 text-muted-foreground" />
					</div>
					<h3 className="font-heading text-lg font-semibold">
						Žiadne poznámky
					</h3>
					<p className="text-sm text-muted-foreground">
						{searchTerm
							? "Skúste iný vyhľadávací výraz."
							: "Začnite vytvorením svojej prvej poznámky."}
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{results.map((note) => (
						<Link key={note._id} href={`/dashboard/notes/${note._id}`}>
							<Card className="group h-full transition-all hover:border-primary/50 hover:shadow-sm">
								<CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 space-y-0">
									<CardTitle className="line-clamp-1 text-base">
										{note.title}
									</CardTitle>
									<Button
										variant="ghost"
										size="icon-xs"
										className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											downloadNoteAsTxt(note.title, note.content);
										}}
										title="Stiahnuť ako .txt"
									>
										<Download className="size-3.5" />
									</Button>
								</CardHeader>
								<CardContent className="pb-3">
									<div
										className="line-clamp-3 text-sm text-muted-foreground prose-sm prose-p:my-0"
										dangerouslySetInnerHTML={{ __html: note.content }}
									/>
								</CardContent>
								<CardFooter className="flex items-center justify-between gap-2 pt-0 text-[11px] text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="size-3" />
										<span>
											{new Date(note._creationTime).toLocaleDateString("sk-SK")}
										</span>
									</div>
									{note.projectName && (
										<div className="flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-primary">
											<Folder className="size-3" />
											<span className="truncate max-w-[80px]">
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
								<Card key={`more-${i}`} className="h-[200px]">
									<CardHeader>
										<Skeleton className="h-5 w-2/3" />
									</CardHeader>
									<CardContent>
										<Skeleton className="h-4 w-full mb-2" />
										<Skeleton className="h-4 w-full mb-2" />
										<Skeleton className="h-4 w-2/3" />
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
						className="min-w-[120px]"
					>
						Načítať viac
					</Button>
				</div>
			)}
		</div>
	);
}
