"use server";

import { CreateEventFormData, GroupDisplayData } from "@/schemas/fe.schema";
import {
	CreateEventClientResponse,
	CreateEventRequest,
	MarkEventCompleteRequest,
} from "@/schemas/transaction.schema";

// export function createEventAction() {}

export async function setEventStatusAction(
	eventId: number,
	eventIsComplete: boolean,
) {
	const postData: MarkEventCompleteRequest = {
		eventId: eventId,
		eventIsComplete: eventIsComplete,
	};
	try {
		const res = await fetch("http://127.0.0.1:8000/api/event/complete/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});
		console.log();
		const data = await res.json();

		if (data.success) {
			console.log("status set ok");
			return data;
		} else {
			console.log("status setting error");
			// if an error occurred on the backend
			return data;
		}
	} catch (error) {
		console.log("setEventStatusAction", error);
		return {
			ok: false,
			message: "A frontend error occurred!",
		};
	}
}

export async function createEventAction(
	formData: CreateEventFormData,
	groupData: GroupDisplayData,
): Promise<CreateEventClientResponse> {
	// convert the form data to the format expected by the backend
	const postData: CreateEventRequest = {
		name: formData.name,
		date: formData.date,
		repeatEvery: formData.repeats !== "None" ? formData.repeats : null,
		memberNames: groupData.members.flatMap((member) => member.username),
		groupId: groupData.id,
	};
	console.log(postData);

	try {
		const res = await fetch("http://127.0.0.1:8000/api/event/create/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			console.log("sign up ok");
			return { ok: true, message: "" };
		} else {
			console.log("sign up backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during creation!",
			};
		}
	} catch (error) {
		// if an error occurred on the frontend
		console.log("createEventAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during creation!",
		};
	}
}
