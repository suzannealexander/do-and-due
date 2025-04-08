"use client";

import CalendarFrame from "@/components/CalendarFrame";
import EventsFrame from "@/components/EventsFrame";
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

// this group object will be used to indicate when the user wants to create a new group
// this isn't a real group, it's just here to indicate the status of the homeframe component
const createNewGroupPlaceholder: GroupDisplayData = {
	id: -1,
	name: "new group",
	members: [],
	events: [],
};

function HomeFrameContents({
	userData,
	groupData,
	dateState,
	dateCallback,
}: {
	userData: UserDisplayData;
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	if (groupData.id === -1) {
		return <CreateGroupFrame userId={userData.id} />;
	} else {
		return (
			<div className="flex h-max w-full flex-row flex-nowrap gap-8">
				<EventsFrame
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

	const groups = [createNewGroupPlaceholder].concat(userData.groups || []);

	// define state objects
	const [groupState, updateGroupState] = useState<GroupStateData>({
		direction: 1,
		index: 0,
		group: groups.length > 1 ? groups[1] : groups[0],
	});

	const [dateState, updateDateState] = useState<DateStateData>({
		current: currentDate,
		display: currentDate,
		target: currentDate,
	});

	return (
		<div className="m-auto h-max w-full max-w-5xl">
			<GroupSelector
				groups={groups}
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
						userData={userData}
					/>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
