import { User, Group, Event } from "./db.schema";

// register user ------------------------------------------------------------------------
export interface RegisterUserRequest {
	username: string;
	email: string;
	password: string;
}

export interface RegisterUserClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// login user ---------------------------------------------------------------------------
export interface LoginUserRequest {
	username: string;
	password: string;
}
export interface LoginUserClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// NOT IMPLEMENTED ON THE BACKEND YET AFAIK
// view public user data (requested by another user account) ----------------------------
export interface ViewPublicUserRequest {
	// fe > be
	// params necessary to view data about a user
	username: string;
}

export interface PublicUserData {
	username: string;
	photoUrl: string;
}

export interface ViewPublicUserResponse {
	userExists: boolean;
	userData?: PublicUserData; // optional, only returned if this user exists
}
// --------------------------------------------------------------------------------------

// create group -------------------------------------------------------------------------
export interface CreateGroupRequest {
	// fe > be
	// params necessary to create a group in the backend
	groupName: string;
	groupStatus: string;
	groupExpiration: string | null;
	groupTimezone: string;
	// groupCreator: User; // not sure if we should send an actual object here or just a username/id?
	groupCreatorId: number;
}

export interface CreateGroupResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to create a group
	message: string;
	status: number;
}
export interface CreateGroupClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// view detailed group data -------------------------------------------------------------
export interface ViewGroupRequest {
	// fe > be
	// params necessary to view a group in the backend
	groupId: number;
}

export interface ViewGroupResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to view a group
	groupId: number;
	groupName: string;
	groupStatus: string;
	groupExpiration: string | null;
	groupTimezone: string;
	groupCreator: User;
	groupMembers: User[]; // bea: here i think we could actually retrieve the user objects to make displaying stuff like profile pictures easier?
	// groupCreatorUsername: string;
	// groupMemberUsernames: string[]; // [Array of usernames]
	groupEvents: Event[]; // [Array of Event items (eventId, eventName)]
	// groupCosts: Cost[]; // [Array of Cost items (costId, costName, costAmount)]
}
// --------------------------------------------------------------------------------------

// bea: maybe we can replace the transaction below with just an edit/update group call so we can use it for more?
// add user to group --------------------------------------------------------------------
export interface AddUsersToGroupRequest {
	// fe > be
	// params necessary to add users to a group in the backend
	groupId: number;
	usernames: string[]; // [Array of usernames]
}

export interface AddUsersToGroupResponse {
	// be > fe
	// params we can expect to receive from the backend when trying to add users to a group
	ok: boolean;
	message: string;
	result: { success: string[]; failure: string[] }; // not sure about this. i think this will be a dict.
	// e.g. {"results": {"success": ["user1", "user2"], "not_found": ["nonexistent_user"]}}
	// bea: we can define it like this and pass usernames as arrays of strings
	status: number;
}
// --------------------------------------------------------------------------------------

// create event -------------------------------------------------------------------------
export interface CreateEventRequest {
	name: string;
	date: string; // Format: "%Y-%m-%d %H:%M:%S" Lmk if you want to change this -Lance
	repeatEvery?: string; // Should be in the set {"Daily", "Weekly", "Monthly"}

	memberNames: string[]; // Usernames

	groupId: number;
	
	// Optional cost information
	cost?: {
		name: string;
		category?: string;
		amount: number;
		description?: string;
		payerUsername: string;
		shares: {
			username: string;
			amount: number;
		}[];
	};
}

export interface CreateEventResponse {
	success: boolean;
	message: string;
}
export interface CreateEventClientResponse {
	// response shared to the client
	ok: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------

// change users assigned to event -------------------------------------------------------
export interface ChangeEventMembersRequest {
	name: string;
	memberNames: string[]; // Usernames
	groupId: number;
}

export interface ChangeEventMembersResponse {
	success: boolean;
	message: string;
}
// --------------------------------------------------------------------------------------
export interface MarkEventCompleteRequest {
	// fe > be - params necessary to mark an event as complete

	eventId: number;
	eventIsComplete: boolean;
}

export interface MarkEventCompleteResponse {
	// be > fe

	success: boolean;
	message: string;
	eventStatus?: boolean;
}

// --------------------------------------------------------------------------------------

// create cost --------------------------------------------------------------------------
export interface CreateCostRequest {
	name: string;
	category?: string;
	amount: number;
	description?: string;
	groupId: number;
	payerId: number;
	shares: {
		borrowerId: number;
		amount: number;
	}[];
}

export interface CreateCostResponse {
	success: boolean;
	message: string;
	costId?: number;
}

export interface CreateCostClientResponse {
	ok: boolean;
	message: string;
	costId?: number;
}
// --------------------------------------------------------------------------------------

// update cost status -------------------------------------------------------------------
export interface UpdateCostShareStatusRequest {
	costShareId: number;
	isPaid: boolean;
}

export interface UpdateCostShareStatusResponse {
	success: boolean;
	message: string;
	isPaid?: boolean;
}
// --------------------------------------------------------------------------------------

// get costs for group ------------------------------------------------------------------
export interface GetGroupCostsRequest {
	groupId: number;
}

export interface GetGroupCostsResponse {
	success: boolean;
	message: string;
	costs?: {
		id: number;
		name: string;
		category: string | null;
		amount: number;
		dateAdded: string;
		description: string | null;
		payer: {
			username: string;
			photoUrl: string;
		};
		shares: {
			id: number;
			amount: number;
			isPaid: boolean;
			borrower: {
				username: string;
				photoUrl: string;
			};
		}[];
	}[];
}
// --------------------------------------------------------------------------------------
