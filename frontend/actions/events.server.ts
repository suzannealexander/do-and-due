"use server";

import { CreateEventFormData } from "@/schemas/fe.schema";
import {
	CreateEventClientResponse,
	CreateEventRequest,
} from "@/schemas/transaction.schema";

// export function createEventAction() {}

export async function createEventAction(
	formData: CreateEventFormData,
	groupId: number,
): Promise<CreateEventClientResponse> {
	// convert the form data to the format expected by the backend
	const postData: CreateEventRequest = {
		name: "",
		date: "",
		members: [],
		groupId: 0,
	};

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
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("createEventAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during creation!",
		};
	}
}
