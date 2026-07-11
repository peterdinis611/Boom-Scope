"use client";

import { stripHtml } from "@/lib/strip-html";

import { usePaginatedQuery, useQuery } from "convex/react";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { EmptyState } from "@/components/layout/EmptyState";
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
import { downloadNoteAsPdf, downloadNoteAsTxt } from "@/lib/notes";
import { formatAppDate } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function NoteList() {
	const [searchTerm, setSearchTerm] = useState("");
	const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	const tagOptions = useQuery(api.notes.listTags);

	const { results, status, loadMore } = usePaginatedQuery(
		api.notes.list,
		{
			searchTerm: debouncedSearchTerm || undefined,
			tag: selectedTag ?? undefined,
		},
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

	const isSearching =
		searchTerm !== debouncedSearchTerm || status === "LoadingFirstPage";

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
						placeholder="Search notes…"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Link href="/dashboard/notes/new">
					<Button size="sm" className="gap-2">
						<Plus className="size-4" />
						New note
					</Button>
				</Link>
			</div>

			{tagOptions && tagOptions.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						size="xs"
						variant={selectedTag === null ? "default" : "outline"}
						onClick={() => setSelectedTag(null)}
					>
						All
					</Button>
					{tagOptions.map(({ tag, count }) => (
						<Button
							key={tag}
							type="button"
							size="xs"
							variant={selectedTag === tag ? "default" : "outline"}
							onClick={() => setSelectedTag(tag)}
						>
							{tag}
							<span className="text-muted-foreground">({count})</span>
						</Button>
					))}
				</div>
			) : null}

			{preservedResults.length === 0 &&
			(isFirstLoad || status === "LoadingFirstPage") ? (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<Card key={i}>
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
				<EmptyState
					icon={Search}
					title="No notes"
					description={
						searchTerm
							? "Try a different search term."
							: "You have not created any notes yet."
					}
					action={
						!searchTerm ? (
							<Link href="/dashboard/notes/new">
								<Button>New note</Button>
							</Link>
						) : undefined
					}
				/>
			) : (
				<div
					className={cn(
						"grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300",
						status === "LoadingFirstPage"
							? "opacity-60 pointer-events-none"
							: "opacity-100",
					)}
				>
					{preservedResults.map((note) => (
						<Link key={note._id} href={`/dashboard/notes/${note._id}`}>
							<Card className="group h-full transition-colors hover:border-primary/40">
								<CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
									<CardTitle className="line-clamp-1 text-base font-medium">
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
											title="Download as .txt"
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
											title="Download as .pdf"
										>
											<FileText className="size-3.5" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="pb-3">
									<div className="line-clamp-3 text-sm text-muted-foreground prose-sm prose-p:my-0">
										{stripHtml(note.content)}
									</div>
									{note.tags && note.tags.length > 0 ? (
										<div className="mt-3 flex flex-wrap gap-1">
											{note.tags.map((tag) => (
												<span
													key={tag}
													className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
												>
													{tag}
												</span>
											))}
										</div>
									) : null}
								</CardContent>
								<CardFooter className="flex items-center justify-between gap-2 pt-0 text-xs text-muted-foreground">
									<div className="flex items-center gap-1">
										<Calendar className="size-3 opacity-60" />
										<span>
											{formatAppDate(note._creationTime)}
										</span>
									</div>
									{note.projectName ? (
										<div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
											<Folder className="size-3 opacity-80" />
											<span className="truncate max-w-20">
												{note.projectName}
											</span>
										</div>
									) : null}
								</CardFooter>
							</Card>
						</Link>
					))}

					{status === "LoadingMore" && (
						<>
							{[1, 2, 3].map((i) => (
								<Card key={`more-${i}`}>
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
					<Button variant="outline" onClick={() => loadMore(9)}>
						Load more
					</Button>
				</div>
			)}
		</div>
	);
}
