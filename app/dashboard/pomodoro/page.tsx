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
		loading: () => <Skeleton className="h-40 w-full rounded-xl" />,
	},
);

export default function PomodoroPage() {
	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Pomodoro"
				description="Manage your time effectively with the Pomodoro technique."
			/>
			<PomodoroStatsPanel />
			<div className="flex min-h-[40vh] flex-col items-center justify-center">
				<PomodoroTimer />
			</div>
		</PageContainer>
	);
}
