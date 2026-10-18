"use client";

import { TasksCalendar } from "@/components/kanban/tasks-calendar";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CalendarPage() {
	return (
		<PageContainer className="space-y-6" size="wide">
			<PageHeader
				title="Calendar"
				description="All due dates across projects — plan the week from one view."
			/>
			<TasksCalendar />
		</PageContainer>
	);
}
