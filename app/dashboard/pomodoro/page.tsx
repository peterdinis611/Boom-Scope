import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const PomodoroStatsPanel = dynamic(
	() =>
		import("@/components/pomodoro/pomodoro-stats").then(
			(module) => module.PomodoroStatsPanel,
		),
	{
		loading: () => (
			<div className="space-y-4 rounded-xl border border-border p-6">
				<Skeleton className="h-5 w-32" />
				<div className="grid grid-cols-3 gap-3">
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
				</div>
				<Skeleton className="h-36 w-full rounded-lg" />
			</div>
		),
	},
);

export default function PomodoroPage() {
	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Pomodoro"
				description="Manage your time effectively with the Pomodoro technique."
			/>
			<div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,1fr)] xl:items-start">
				<PomodoroTimer />
				<PomodoroStatsPanel />
			</div>
		</PageContainer>
	);
}
