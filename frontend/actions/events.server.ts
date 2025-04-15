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
	formData: any,
	groupData: GroupDisplayData,
): Promise<CreateEventClientResponse> {
	let memberNames: string[];
	
	// Parse members from the form data
	if (typeof formData.members === 'string') {
		memberNames = formData.members.trim().split(/\s+/);
	} else {
		memberNames = formData.members || [];
	}
	
	// Create basic request data
	const postData: CreateEventRequest = {
		name: formData.name,
		date: formData.date,
		memberNames: memberNames,
		repeatEvery: formData.repeats !== "None" ? formData.repeats : null,
		groupId: groupData.id,
	};
	
	// Add cost information if provided
	if (formData.cost) {
		postData.cost = {
			name: formData.costName || `Cost for ${formData.name}`,
			category: formData.costCategory,
			amount: formData.cost.amount,
			description: formData.costDescription,
			payerUsername: formData.payerUsername,
			shares: formData.cost.shares
		};
	}
	
	console.log("Event request data:", postData);

	try {
		const res = await fetch("http://127.0.0.1:8000/api/event/create/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			console.log("event creation ok");
			return { ok: true, message: "" };
		} else {
			const errorData = await res.json();
			console.log("event creation backend error", errorData);
			// if an error occurred on the backend
			return {
				ok: false,
				message: errorData.message || "A backend error occurred during creation!",
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
