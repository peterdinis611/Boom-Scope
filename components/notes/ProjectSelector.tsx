"use client";

import { useQuery } from "convex/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface ProjectSelectorProps {
	value?: Id<"projects">;
	onChange: (value?: Id<"projects">) => void;
	placeholder?: string;
}

export function ProjectSelector({
	value,
	onChange,
	placeholder = "Vybrať projekt",
}: ProjectSelectorProps) {
	const projects = useQuery(api.projects.list);

	return (
		<Select
			value={value || "none"}
			onValueChange={(val) =>
				onChange(val === "none" ? undefined : (val as Id<"projects">))
			}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="none">Žiadny projekt</SelectItem>
				{projects?.map((project) => (
					<SelectItem key={project._id} value={project._id}>
						{project.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
