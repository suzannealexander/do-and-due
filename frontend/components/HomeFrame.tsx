"use client";

import CalendarFrame from "@/components/CalendarFrame";
import ToDoFrame from "@/components/ToDoFrame";
import GroupSelector from "@/components/GroupSelector";
import CreateGroupFrame from "@/components/CreateGroupFrame";
import {
	DateStateData,
	GroupDisplayData,
	GroupStateData,
	UserDisplayData,
} from "@/schemas/fe.schema";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const animationVariants = {
	enter: (direction: number) => {
		return {
			zIndex: 0,
			opacity: 0.0,
			x: 150 * direction,
		};
	},
	center: {
		zIndex: 1,
		opacity: 1,
		x: 0,
	},
	exit: (direction: number) => {
		return {
			zIndex: 0,
			opacity: 0.0,
			x: -150 * direction,
		};
	},
};

function HomeFrameContents({
	groupData,
	dateState,
	dateCallback,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	if (groupData.id === -1) {
		return <CreateGroupFrame />;
	} else {
		return (
			<div className="flex h-max w-full flex-row flex-nowrap gap-8 pt-8">
				<ToDoFrame
					groupData={groupData}
					dateState={dateState}
					dateCallback={dateCallback}
				/>
				<CalendarFrame
					groupData={groupData}
					dateState={dateState}
					dateCallback={dateCallback}
				/>
			</div>
		);
	}
}

export default function HomeFrame({ userData }: { userData: UserDisplayData }) {
	// query current date
	const currentDate: Dayjs = dayjs();

	// this group object will be used to indicate when the user wants to create a new group
	const createNewGroupPlaceholder: GroupDisplayData = {
		id: -1,
		name: "new group",
		events: [],
	};

	// define state objects
	const [groupState, updateGroupState] = useState<GroupStateData>({
		direction: 1,
		index: 0,
		group:
			userData.groups.length > 0
				? userData.groups[0]
				: createNewGroupPlaceholder,
	});

	const [dateState, updateDateState] = useState<DateStateData>({
		current: currentDate,
		display: currentDate,
		target: currentDate,
	});

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={[createNewGroupPlaceholder].concat(userData.groups)}
				groupState={groupState}
				groupCallback={updateGroupState}
			/>
			<AnimatePresence
				initial={false}
				custom={groupState.direction}
				mode="wait"
			>
				<motion.div
					custom={groupState.direction}
					variants={animationVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						x: {
							duration: 0.2,
						},
						opacity: { duration: 0.15 },
					}}
					key={groupState.index}
				>
					<HomeFrameContents
						groupData={groupState.group}
						dateState={dateState}
						dateCallback={updateDateState}
					/>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
