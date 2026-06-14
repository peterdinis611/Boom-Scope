import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { PomodoroTimer } from "@/components/dashboard/pomodoro-timer";

export default function PomodoroPage() {
	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Pomodoro"
				description="Manage your time effectively with the Pomodoro technique."
			/>
			<div className="flex min-h-[50vh] flex-col items-center justify-center">
				<PomodoroTimer />
			</div>
		</PageContainer>
	);
}
