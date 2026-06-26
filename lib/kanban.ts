export const KANBAN_COLUMNS = [
	{ id: "todo", label: "To do", color: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
	{
		id: "in_progress",
		label: "In progress",
		color: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
	},
	{
		id: "done",
		label: "Done",
		color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	},
] as const;

export type KanbanStatus = (typeof KANBAN_COLUMNS)[number]["id"];

export function getKanbanColumnLabel(status: KanbanStatus): string {
	return KANBAN_COLUMNS.find((column) => column.id === status)?.label ?? status;
}
