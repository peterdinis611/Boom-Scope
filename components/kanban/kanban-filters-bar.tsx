"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Id } from "@/convex/_generated/dataModel";
import type { KanbanColumn } from "@/lib/kanban";
import {
	EMPTY_KANBAN_FILTERS,
	type KanbanFilters,
} from "@/lib/kanban-filters";
import { TASK_PRIORITIES, PRIORITY_META } from "@/lib/kanban";

type KanbanFiltersBarProps = {
	filters: KanbanFilters;
	columns: KanbanColumn[];
	onChange: (filters: KanbanFilters) => void;
};

export function KanbanFiltersBar({
	filters,
	columns,
	onChange,
}: KanbanFiltersBarProps) {
	return (
		<div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
			<div className="space-y-1.5 sm:col-span-2">
				<Label htmlFor="kanban-search">Search</Label>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="kanban-search"
						value={filters.search}
						onChange={(event) =>
							onChange({ ...filters, search: event.target.value })
						}
						placeholder="Filter by title, labels, project…"
						className="pl-9"
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<Label>Status</Label>
				<Select
					value={filters.columnId}
					onValueChange={(value) =>
						onChange({
							...filters,
							columnId: value as KanbanFilters["columnId"],
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All columns" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All columns</SelectItem>
						{columns.map((column) => (
							<SelectItem key={column._id} value={column._id}>
								{column.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="space-y-1.5">
				<Label>Priority</Label>
				<Select
					value={filters.priority}
					onValueChange={(value) =>
						onChange({
							...filters,
							priority: value as KanbanFilters["priority"],
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All priorities" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All priorities</SelectItem>
						{TASK_PRIORITIES.map((priority) => (
							<SelectItem key={priority} value={priority}>
								{PRIORITY_META[priority].label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 sm:col-span-2 lg:col-span-4">
				<div>
					<p className="text-sm font-medium">Overdue only</p>
					<p className="text-xs text-muted-foreground">
						Show tasks past their due date
					</p>
				</div>
				<Button
					type="button"
					size="sm"
					variant={filters.showOverdueOnly ? "default" : "outline"}
					onClick={() =>
						onChange({
							...filters,
							showOverdueOnly: !filters.showOverdueOnly,
						})
					}
				>
					{filters.showOverdueOnly ? "On" : "Off"}
				</Button>
			</div>
		</div>
	);
}

export { EMPTY_KANBAN_FILTERS };
