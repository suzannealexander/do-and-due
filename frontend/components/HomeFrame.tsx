"use client";

import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";
import { GroupDisplayData, UserDisplayData } from "@/schema";
import { JSX, useEffect, useRef, useState } from "react";
import { SnapList, SnapItem, useScroll } from "react-snaplist-carousel";
import dayjs, { Dayjs } from "dayjs";

export default function HomeFrame({ userData }: { userData: UserDisplayData }) {
	// defaults to null if the user is not in any groups, otherwise defaults to the first
	const [currentGroup, setCurrentGroup] = useState<GroupDisplayData | null>(
		userData.groups.length > 0 ? userData.groups[0] : null,
	);
	// current date
	const currentDate: Dayjs = dayjs();

	// date displayed on the calendar
	const [displayDate, setDisplayDate] = useState<Dayjs>(currentDate);

	// date targeted on the calendar and shown on the todo list
	const [targetDate, setTargetDate] = useState<Dayjs>(currentDate);

	const homeContents =
		currentGroup !== null ? (
			<div className="flex h-full w-full flex-row flex-nowrap gap-12 p-10">
				<ToDoFrame
					groupData={currentGroup}
					targetDate={targetDate}
					setTargetDate={setTargetDate}
				/>
				<CalendarFrame
					groupData={currentGroup}
					currentDate={currentDate}
					displayDate={displayDate}
					setDisplayDate={setDisplayDate}
					targetDate={targetDate}
					setTargetDate={setTargetDate}
				/>
			</div>
		) : (
			<div className="">Please select a group</div>
		);

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={userData.groups}
				setGroupCallback={setCurrentGroup}
				currentGroupId={currentGroup?.id}
			/>
			{homeContents}
		</div>
	);
}

function GroupButton({
	group,
	currentGroupId,
	setGroupCallback,
	snapIndex,
	snapCallback,
	children,
}: {
	group: GroupDisplayData;
	currentGroupId: number | undefined;
	setGroupCallback: CallableFunction;
	snapIndex: number;
	snapCallback: CallableFunction;
	children: JSX.Element[] | JSX.Element | null | string;
	// goToSnapItem: CallableFunction;
	// lastSnapItem: React.RefObject<HTMLDivElement | null>;
}) {
	const handleClick = () => {
		snapCallback(snapIndex);
		setGroupCallback(group);
	};
	const isSelected: boolean = group.id === currentGroupId;
	return (
		<div
			className={`flex h-max w-max cursor-pointer flex-row flex-nowrap items-center gap-2 rounded pt-2 pr-4 pb-2 pl-4 text-sm hover:bg-gray-50 ${
				isSelected ? "bg-purple-100 hover:bg-purple-200" : ""
			}`}
			onClick={handleClick}
		>
			{children}
		</div>
	);
}

function GroupSelector({
	groups,
	currentGroupId,
	setGroupCallback,
}: {
	groups: GroupDisplayData[];
	currentGroupId: number | undefined;
	setGroupCallback: CallableFunction;
}) {
	const newGroupObject: GroupDisplayData = {
		id: -1,
		name: "new group",
		events: [],
	};

	const snapList = useRef<HTMLDivElement>(null);
	const lastSnapItem = useRef<HTMLDivElement>(null);
	const goToSnapItem = useScroll({ ref: snapList });

	const snapToIndex = (index: number) => {
		goToSnapItem(index);
		lastSnapItem.current?.focus();
	};

	useEffect(() => {
		if (groups.length > 0) {
			snapToIndex(1);
		}
	}, []);

	return (
		<div className="relative w-full border-b-[1px] border-gray-200 pt-4 pb-4">
			<SnapList
				ref={snapList}
				direction={"horizontal"}
				width="100%"
				height="max-content"
				disableScroll={true}
				className="snap-container flex flex-row items-center bg-clip-border"
			>
				<SnapItem className="snap-item" snapAlign="center" key={0}>
					<GroupButton
						group={newGroupObject}
						currentGroupId={currentGroupId}
						setGroupCallback={setGroupCallback}
						snapIndex={0}
						snapCallback={snapToIndex}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 stroke-gray-500"
						>
							<path d="M5 12h14" />
							<path d="M12 5v14" />
						</svg>
						<div>Create group</div>
					</GroupButton>
				</SnapItem>
				{groups.map((group, index) => (
					<SnapItem
						className="snap-item"
						snapAlign="center"
						key={index + 1}
					>
						<GroupButton
							group={group}
							currentGroupId={currentGroupId}
							setGroupCallback={setGroupCallback}
							snapIndex={index + 1}
							snapCallback={snapToIndex}
						>
							{group.name}
						</GroupButton>
					</SnapItem>
				))}
			</SnapList>
		</div>
	);
}
