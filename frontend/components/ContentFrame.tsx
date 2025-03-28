"use client";

import { Group } from "@/schema";
import { Dispatch, SetStateAction, use, useState } from "react";
import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";

function GroupSelectorButton({
	label,
	currentGroupId,
	nextGroupId,
	setGroupId,
}: {
	label: string;
	currentGroupId: number | null;
	nextGroupId: number;
	setGroupId: Dispatch<SetStateAction<number | null>>;
}) {
	const handleClick = () => setGroupId(nextGroupId);
	// make an explicit new version of this component to create new groups
	// should it redirect the user or just set a diff page state?

	return (
		<div
			className="cursor-pointer rounded p-2 text-sm hover:bg-gray-50"
			onClick={handleClick}
		>
			{label}
		</div>
	);
}

function GroupSelector({ groups }: { groups: Group[] }) {
	const [currentGroup, setCurrentGroup] = useState<number | null>(null);
	return (
		<div className="flex flex-row flex-nowrap items-center justify-center gap-8 border-b-[1px] border-gray-200 p-4">
			<GroupSelectorButton
				label={"+ New Group"}
				currentGroupId={currentGroup}
				nextGroupId={0}
				setGroupId={setCurrentGroup}
			/>
			{groups.map((group: Group) => (
				<GroupSelectorButton
					key={group.id}
					label={group.name}
					currentGroupId={currentGroup}
					nextGroupId={group.id}
					setGroupId={setCurrentGroup}
				/>
			))}
		</div>
	);
}

export default function ContentFrame() {
	// query whether the user is a member of any groups
	// placeholder for now
	const groups: Group[] = [
		{
			id: 1,
			name: "Test Group",
			status: "active",
			expiration: null,
			timezone: "est", // consider this later
			creatorId: 0,
			memberIds: [],
			eventIds: [],
			costIds: [],
		},
	];
	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector groups={groups} />
			<div className="flex h-full w-full flex-row flex-nowrap gap-12 p-10">
				<ToDoFrame />
				<CalendarFrame />
			</div>
		</div>
	);
}
