"use server";

import {
	RegisterUserFormData,
	LoginUserFormData,
	UserDisplayData,
} from "@/schemas/fe.schema";
import {
	RegisterUserClientResponse,
	LoginUserClientResponse,
	RegisterUserRequest,
	LoginUserRequest,
	EditProfileResponse,
	EditProfileRequest,
	EditProfileClientResponse,
} from "@/schemas/transaction.schema";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

export const getCurrentSession = async (): Promise<UserDisplayData | null> => {
	try {
		console.log("getting user data");
		// test whether we can cache this
		// try to get the access token from the request cookies
		const cookieStore: ReadonlyRequestCookies = await cookies();
		// console.log(cookieStore);
		const token: string | null =
			cookieStore.get("access_token")?.value ?? null;

		// if token is null, return user is null
		if (token === null) {
			console.log("no token found");
			return null;
		}

		// otherwise try to retrieve user data
		const response: Response = await fetch(
			"http://127.0.0.1:8000/api/get-current-user/",
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);
		// console.log(response);
		if (response.ok) {
			console.log("response ok");
			return await response.json();
		} else {
			return null;
		}
	} catch (error) {
		console.log("getCurrentSession", error);
		return null;
	}
};

export async function registerUserAction(
	formData: RegisterUserFormData,
): Promise<RegisterUserClientResponse> {
	const postData: RegisterUserRequest = {
		username: formData.username,
		email: formData.email,
		password: formData.password,
	};
	try {
		const res = await fetch("http://127.0.0.1:8000/api/register/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
		});

		if (res.ok) {
			console.log("sign up ok");
			return { ok: true, message: "" };
		} else {
			console.log("sign up backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during registration!",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("registerUserAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during registration!",
		};
	}
}

export async function editProfileAction(
	formData: UserDisplayData,
): Promise<EditProfileClientResponse> {
	const postData: EditProfileRequest = {
		username: formData.username,
		email: formData.email,
	};
	try {
		const res = await fetch("http://127.0.0.1:8000/api/edit_profile/", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
		});

		if (res.ok) {
			console.log("edit profile ok");
			return { ok: true, message: "" };
		} else {
			console.log("edit profile backend error");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "A backend error occurred during edit profile request!",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("editProfileAction", error);
		return {
			ok: false,
			message: "A frontend error occurred during edit profile action!",
		};
	}
}

export async function logoutUserAction() {
	// invalidate sessions in the database
	// when this exists we need to make sure this function receives the current userData

	// clear local cookies
	await deleteSessionTokenCookie();
}

export async function loginUserAction(
	formData: LoginUserFormData,
): Promise<LoginUserClientResponse> {
	const postData: LoginUserRequest = {
		username: formData.username,
		password: formData.password,
	};
	try {
		const res: Response = await fetch("http://127.0.0.1:8000/api/login/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(postData),
			credentials: "include",
		});

		if (res.ok) {
			console.log("login ok");

			const data = await res.json();

			const accessToken = data.access;
			const refreshToken = data.refresh;

			if (accessToken && refreshToken) {
				await setSessionTokenCookie(accessToken, refreshToken);
				console.log("Access token set.");
			} else {
				console.log("No access token or refresh token received.");
			}

			return { ok: true, message: "" };
		} else {
			console.log("login rejection - backend");
			// if an error occurred on the backend
			return {
				ok: false,
				message: "Incorrect username or password",
			};
		}
		// if an error occurred on the frontend
	} catch (error) {
		// if an error occurred on the backend
		console.log("loginUserAction", error);
		return {
			ok: false,
			message: "A server error occurred during login!",
		};
	}
}

export async function setSessionTokenCookie(
	accessToken: string,
	refreshToken: string,
	// expiresAt: Date,
): Promise<void> {
	"use server";
	// get cookies from the browser and set the session token
	const cookieStore: ReadonlyRequestCookies = await cookies();
	cookieStore.set("access_token", accessToken, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		// expires: expiresAt, // are we handling token expiration on the backend?
		path: "/",
	});
	cookieStore.set("refresh_token", refreshToken, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		// expires: expiresAt, // are we handling token expiration on the backend?
		path: "/",
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	"use server";
	const cookieStore: ReadonlyRequestCookies = await cookies();
	cookieStore.set("access_token", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
	cookieStore.set("refresh_token", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/",
	});
}
