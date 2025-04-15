"use client";

import { setEventStatusAction } from "@/actions/events.server";
import {
	EventDisplayData,
	GroupDisplayData,
	DateStateData,
} from "@/schemas/fe.schema";
import dayjs, { Dayjs } from "dayjs";
import { JSX, useEffect, useState } from "react";
import { MarkEventCompleteResponse } from "@/schemas/transaction.schema";
import AddEventForm from "./AddEventForm";

export default function EventsFrame({
	groupData,
	dateState,
	dateCallback,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
}) {
	const [showAddEventForm, setAddEventState] = useState<boolean>(false);
	const toggleAddEventState = () => {
		setAddEventState(!showAddEventForm);
	};

	return (
		<div className="h-max w-2/5 rounded-lg border-[1px] border-gray-300 p-4 shadow-sm">
			{showAddEventForm ? (
				<AddEventForm
					groupData={groupData}
					dateState={dateState}
					toggleAddEventState={toggleAddEventState}
				/>
			) : (
				<EventsDisplay
					groupData={groupData}
					dateState={dateState}
					dateCallback={dateCallback}
					toggleAddEventState={toggleAddEventState}
				/>
			)}
		</div>
	);
}


function EventsDisplay({
	groupData,
	dateState,
	dateCallback,
	toggleAddEventState,
}: {
	groupData: GroupDisplayData;
	dateState: DateStateData;
	dateCallback: CallableFunction;
	toggleAddEventState: CallableFunction;
}) {
	const handlePrevDay = () => {
		dateCallback({
			current: dateState.current,
			display: dateState.display,
			target: dateState.target.subtract(1, "day"),
		});
	};

	const handleNextDay = () => {
		dateCallback({
			current: dateState.current,
			display: dateState.display,
			target: dateState.target.add(1, "day"),
		});
	};

	const [relevantEvents, setRelevantEvents] = useState<EventDisplayData[]>(
		filterEventsByDate(groupData.events, dateState.target),
	);

	useEffect(() => {
		setRelevantEvents(
			filterEventsByDate(groupData.events, dateState.target),
		);
	}, [groupData, dateState]);
	// const relevantEvents: EventDisplayData[] = filterEventsByDate(
	// 	groupData.events,
	// 	dateState.target,
	// );

	const eventItemsDisplay: JSX.Element | JSX.Element[] =
		relevantEvents.length === 0 ? (
			<div className="text-center text-sm text-gray-400">
				nothing scheduled!
			</div>
		) : (
			relevantEvents.map((event: EventDisplayData) => (
				<EventItem key={event.id} event={event} />
			))
		);

	return (
		<div className="w-full">
			<div className="flex h-max w-full flex-row flex-nowrap items-center justify-between p-1">
				<button
					onClick={handlePrevDay}
					className="rounded-lg hover:bg-gray-50"
				>
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
						className="rounded-lg stroke-gray-400 hover:stroke-purple-500"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
				</button>
				<div className="w-full text-center text-lg font-[500]">
					{dateState.target.format("MMMM D, YYYY")}
				</div>
				<button
					onClick={handleNextDay}
					className="rounded-lg hover:bg-gray-50"
				>
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
						className="rounded-lg stroke-gray-400 hover:stroke-purple-500"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
			</div>

			<div className="flex w-full flex-col gap-2 p-6">
				{eventItemsDisplay}
			</div>
			<AddEventButton toggleAddEventState={toggleAddEventState} />
		</div>
	);
}

interface Event {
	label: string;
	completed: boolean;
}

function EventItem({ event }: { event: EventDisplayData }) {
	const [eventState, setEventState] = useState<boolean>(event.is_complete);
	const [isExpanded, setIsExpanded] = useState(false);

	const handleClick = async () => {
		const res: MarkEventCompleteResponse = await setEventStatusAction(
			event.id,
			!event.is_complete,
		);
		if (res.success) {
			console.log(res);
			setEventState(
				res.eventStatus !== undefined
					? res.eventStatus
					: event.is_complete,
			);
		}
	};

	const hasCosts = event.costs && event.costs.length > 0;

	return (
		<div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
			<div className="flex w-full flex-row flex-nowrap items-start gap-2 p-3 text-base hover:bg-gray-50">
				<input
					type="checkbox"
					checked={eventState}
					onClick={handleClick}
					readOnly
					className="h-6 w-6 flex-shrink-0 rounded-lg accent-purple-500"
				/>
				<div className="flex-grow">
					<div
						className={
							eventState
								? "flex-shrink-0 text-gray-500 line-through"
								: "flex-shrink-0"
						}
					>
						{event.name}
					</div>
					
					{/* Show cost indicator if event has associated costs */}
					{hasCosts && (
						<div 
							className="mt-1 cursor-pointer text-xs text-purple-600"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							<div className="flex items-center">
								<svg 
									xmlns="http://www.w3.org/2000/svg" 
									viewBox="0 0 24 24" 
									fill="none" 
									stroke="currentColor" 
									strokeWidth="2" 
									strokeLinecap="round" 
									strokeLinejoin="round"
									className="mr-1 h-3 w-3"
								>
									<path d="M12 2v20M2 12h20" />
								</svg>
								View Cost Details
								<svg 
									xmlns="http://www.w3.org/2000/svg" 
									viewBox="0 0 24 24" 
									fill="none" 
									stroke="currentColor" 
									strokeWidth="2" 
									strokeLinecap="round" 
									strokeLinejoin="round"
									className={`ml-1 h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
								>
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</div>
						</div>
					)}
				</div>
			</div>
			
			{/* Cost details panel */}
			{isExpanded && hasCosts && (
				<div className="border-t border-gray-200 p-3">
					{event.costs.map((cost) => (
						<div key={cost.id} className="mt-2 space-y-1">
							<div className="flex justify-between">
								<span className="font-medium">{cost.name}</span>
								<span className="font-medium">${cost.amount.toFixed(2)}</span>
							</div>
							{cost.category && (
								<div className="text-xs text-gray-500">
									Category: {cost.category}
								</div>
							)}
							<div className="text-xs text-gray-500">
								Paid by: {cost.payer.username}
							</div>
							{cost.description && (
								<div className="text-xs text-gray-600">
									{cost.description}
								</div>
							)}
							
							{/* Cost shares */}
							<div className="mt-2 rounded-md bg-gray-50 p-2">
								<div className="text-xs font-medium text-gray-700">Shares:</div>
								<div className="space-y-1">
									{cost.shares.map((share) => (
										<div key={share.id} className="flex items-center justify-between text-xs">
											<div className="flex items-center">
												<input
													type="checkbox"
													checked={share.isPaid}
													readOnly
													className="mr-1 h-3 w-3 accent-purple-500"
												/>
												<span className={share.isPaid ? "text-gray-400 line-through" : ""}>
													{share.borrower.username}
												</span>
											</div>
											<span>${share.amount.toFixed(2)}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function filterEventsByDate(events: EventDisplayData[], targetDate: Dayjs) {
	return events.filter((event) => {
		// Use startOf('day') to ignore time component for comparisons
		const eventDate = dayjs(event.first_date).startOf('day');
		const targetDateStart = targetDate.startOf('day');

		// Check if it's the same day (for non-repeating or first occurrence)
		if (eventDate.isSame(targetDateStart, "day")) {
			return true;
		}

		// Handle repeating events: Ensure repeat_every is valid and not "None"
		if (event.repeat_every && event.repeat_every !== "None") {
			// Only check events that started on or before the target date
			if (eventDate.isAfter(targetDateStart)) {
				return false;
			}

			// No need for daysDiff for weekly/monthly/yearly checks here, compare date parts directly

			switch (event.repeat_every) {
				case "Daily":
					// Event occurs daily on or after its start date
					return !eventDate.isAfter(targetDateStart);
				case "Weekly":
					// Event occurs on the same day of the week, on or after its start date
					return eventDate.day() === targetDateStart.day() && !eventDate.isAfter(targetDateStart);
				case "Monthly":
					// Same day of month, on or after its start date
					return eventDate.date() === targetDateStart.date() && !eventDate.isAfter(targetDateStart);
				case "Yearly":
					// Same day and month, on or after its start date
					return eventDate.date() === targetDateStart.date() &&
						eventDate.month() === targetDateStart.month() && !eventDate.isAfter(targetDateStart);
				default:
					// Handle unexpected repeat_every values gracefully
					console.warn(`Unexpected repeat_every value in filterEventsByDate: ${event.repeat_every}`);
					return false;
			}
		}

		return false;
	});
}

function AddEventButton({
	toggleAddEventState,
}: {
	toggleAddEventState: CallableFunction;
}) {
	const plusIcon: JSX.Element = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="inherit"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-6 w-6"
		>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
	return (
		<div
			className="hover-text-purple-600 m-auto flex h-max w-max cursor-pointer flex-row flex-nowrap items-center gap-2 rounded-lg border-[1px] border-gray-200 stroke-gray-500 pt-2 pr-4 pb-2 pl-4 text-sm text-gray-600 hover:bg-gray-50 hover:stroke-purple-400 hover:text-purple-500"
			onClick={() => toggleAddEventState()}
		>
			{plusIcon}
			<div>Add event</div>
		</div>
	);
}