import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PomodoroStatsPanel } from "@/components/pomodoro/pomodoro-stats";

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
