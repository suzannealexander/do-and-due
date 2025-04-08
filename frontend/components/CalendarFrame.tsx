"use client";

import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
// import customParseFormat from "dayjs/plugin/customParseFormat";
import {
	EventDisplayData,
	GroupDisplayData,
	DateStateData,
} from "@/schemas/fe.schema";
import { useEffect, useState } from "react";

dayjs.extend(weekday);
dayjs.extend(localeData);
// dayjs.extend(customParseFormat);

export default function CalendarFrame({
	groupData,
	dateState,
	dateCallback,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	const handlePrevMonth = () => {
		dateCallback({
			current: dateState.current,
			target: dateState.target,
			display: dateState.display.subtract(1, "month"),
		});
	};

	const handleNextMonth = () => {
		dateCallback({
			current: dateState.current,
			target: dateState.target,
			display: dateState.display.add(1, "month"),
		});
	};

	// const [eventDates, setEventDates] = useState<Set<number>>(
	// 	getEventDatesInMonth(groupData.events, dateState.display),
	// );
	// useEffect(() => {
	// 	const newEventDates: Set<number> = getEventDatesInMonth(
	// 		groupData.events,
	// 		dateState.display,
	// 	);
	// 	setEventDates(newEventDates);
	// }, [groupData, dateState]);

	const eventDates: Set<number> = getEventDatesInMonth(
		groupData.events,
		dateState.display,
	);

	return (
		<div className="h-max w-full rounded-lg border-[1px] border-gray-300 p-4 shadow-sm">
			<CalendarHeader
				currentDate={dateState.display}
				onPrev={handlePrevMonth}
				onNext={handleNextMonth}
			/>
			<CalendarGrid
				eventDates={eventDates}
				dateState={dateState}
				dateCallback={dateCallback}
			/>
		</div>
	);
}

type CalendarHeaderProps = {
	currentDate: Dayjs;
	onPrev: () => void;
	onNext: () => void;
};

function CalendarHeader({ currentDate, onPrev, onNext }: CalendarHeaderProps) {
	return (
		<div className="flex items-center justify-between p-1">
			<button onClick={onPrev} className="rounded-lg hover:bg-gray-50">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-gray-400 hover:stroke-purple-500"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
			</button>
			<div className="w-full text-center text-lg font-[500]">
				{currentDate.format("MMMM YYYY")}
			</div>
			<button onClick={onNext} className="rounded-lg hover:bg-gray-50">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="stroke-gray-400 hover:stroke-purple-500"
				>
					<path d="m9 18 6-6-6-6" />
				</svg>
			</button>
		</div>
	);
}

type CalendarGridProps = {
	eventDates: Set<number>;
	dateState: DateStateData;
	dateCallback: CallableFunction;
};

function getEventDatesInMonth(
	events: EventDisplayData[],
	displayDate: Dayjs,
): Set<number> {
	const eventDates = new Set<number>();
	const daysInMonth = displayDate.daysInMonth();

	events.forEach((event) => {
		const eventDate = dayjs(event.first_date);

		// Add the original event date if it's in this month
		if (eventDate.isSame(displayDate, "month")) {
			eventDates.add(eventDate.date());
		}

		// Handle repeating events
		if (event.repeat_every) {
			// Check each day in the month
			for (let day = 1; day <= daysInMonth; day++) {
				const currentDate = displayDate.date(day);

				// Skip dates before the event starts
				if (currentDate.isBefore(eventDate)) {
					continue;
				}

				const daysDiff = currentDate.diff(eventDate, "day");

				switch (event.repeat_every) {
					case "Daily":
						eventDates.add(day);
						break;
					case "Weekly":
						if (daysDiff % 7 === 0) {
							eventDates.add(day);
						}
						break;
					case "Monthly":
						// Same day of month
						if (eventDate.date() === day) {
							eventDates.add(day);
						}
						break;
					case "Yearly":
						// Same day and month
						if (eventDate.date() === day &&
							eventDate.month() === displayDate.month()) {
							eventDates.add(day);
						}
						break;
				}
			}
		}
	});
	return eventDates;
}

function CalendarGrid({
	eventDates,
	dateState,
	dateCallback,
}: CalendarGridProps) {
	const startOfMonth = dateState.display.startOf("month");
	const endOfMonth = dateState.display.endOf("month");
	const startDay = startOfMonth.weekday();
	const daysInMonth = endOfMonth.date();

	const days: (number | null)[] = Array.from(
		{ length: daysInMonth },
		(_, i) => i + 1,
	);
	const emptyDays: (number | null)[] = Array.from(
		{ length: startDay },
		() => null,
	);
	const calendarDays = [...emptyDays, ...days];
	const weeks: (number | null)[][] = [];
	for (let i = 0; i < calendarDays.length; i += 7) {
		weeks.push(calendarDays.slice(i, i + 7));
	}

	return (
		<>
			<div className="mt-2 grid grid-cols-7 gap-2 text-center font-medium text-gray-600">
				{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
					(day) => (
						<div key={day} className="p-1">
							{day}
						</div>
					),
				)}
			</div>
			<div className="grid grid-cols-7 gap-2">
				{weeks.map((week, i) =>
					week.map((day, j) => (
						<CalendarDay
							key={`${i}-${j}`}
							day={day}
							isEventDay={day ? eventDates.has(day) : false}
							dateState={dateState}
							dateCallback={dateCallback}
						/>
					)),
				)}
			</div>
		</>
	);
}

type CalendarDayProps = {
	day: number | null;
	isEventDay: boolean;
	dateState: DateStateData;
	dateCallback: CallableFunction;
};

function CalendarDay({
	day,
	isEventDay,
	dateState,
	dateCallback,
}: CalendarDayProps) {
	const handleClick = () => {
		day &&
			dateCallback({
				current: dateState.current,
				display: dateState.display,
				target: dayjs()
					.year(dateState.display.year())
					.month(dateState.display.month())
					.date(day),
			});
	};

	const isCurrentDate: boolean =
		dateState.current.date() === day &&
		dateState.current.month() === dateState.display.month() &&
		dateState.current.year() === dateState.display.year();

	const isTargetDate: boolean =
		dateState.target.date() === day &&
		dateState.target.month() === dateState.display.month() &&
		dateState.target.year() === dateState.display.year();

	var classElements: string =
		"flex h-16 items-start justify-start rounded-md p-1.5 text-left text-sm font-semibold";

	// don't consider anything else if the day is null
	if (day === null) {
		classElements = classElements + " bg-gray-50";
	} else {
		// style the current date differently
		if (isCurrentDate) {
			classElements =
				classElements +
				" bg-purple-200 hover:bg-purple-300 text-purple-900";
		} else {
			classElements = classElements + " bg-gray-100 hover:bg-gray-200";
		}

		// style the target date differently
		if (isTargetDate) {
			classElements = classElements + " ring-3 ring-purple-600";
		}
	}

	return (
		<div className={classElements} onClick={handleClick}>
			{day && (
				<span
					className={
						isEventDay === true
							? "h-6 w-6 rounded-[50%] bg-purple-600 p-0.5 text-center text-white"
							: "h-6 w-6 rounded-[50%] p-0.5 text-center"
					}
				>
					{day}
				</span>
			)}
		</div>
	);
}
