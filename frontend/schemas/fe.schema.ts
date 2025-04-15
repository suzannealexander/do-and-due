import { Dayjs } from "dayjs";

// page state interfaces ----------------------------------------------------------------
// interface used to handle date state data in the home page
export interface DateStateData {
	current: Dayjs;
	display: Dayjs;
	target: Dayjs;
}

// interface used to handle group state data in the home page
export interface GroupStateData {
	direction: number;
	index: number;
	group: GroupDisplayData;
}
// --------------------------------------------------------------------------------------

// display interfaces -------------------------------------------------------------------
// expected format for general event display data passed to frontend pages
export interface EventDisplayData {
	id: number;
	name: string;
	first_date: string;
	repeat_every: string | null;
	is_complete: boolean;
	costs: CostDisplayData[];
}

// expected format for general group display data passed to frontend pages
export interface GroupDisplayData {
	id: number;
	name: string;
	members: PublicUserDisplayData[];
	events: EventDisplayData[];
}

// expected format for cost display data
export interface CostDisplayData {
	id: number;
	name: string;
	category: string | null;
	amount: number;
	dateAdded: string;
	description: string | null;
	payer: PublicUserDisplayData;
	shares: CostShareDisplayData[];
}

// expected format for cost share display data
export interface CostShareDisplayData {
	id: number;
	amount: number;
	isPaid: boolean;
	borrower: PublicUserDisplayData;
}

export interface PublicUserDisplayData {
	username: string;
	photoUrl: string;
}

// expected format for general user display data passed to frontend pages
export interface UserDisplayData {
	email: string;
	id: number;
	username: string;
	photoUrl: string;
	groups: GroupDisplayData[];
}
// --------------------------------------------------------------------------------------

// form data interfaces -----------------------------------------------------------------
export interface RegisterUserFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface LoginUserFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface CreateGroupFormData {
	groupName: string;
	groupMemberUsernames?: string[]; // bea: i think ideally this is an optional param at group creation
}

export interface CreateEventFormData {
	name: string;
	date: string;
	members: string;
	repeats: string;
}

export interface AddUserToGroupFormData {
	groupId: number;
	usernames: string[];
}

export interface CreateCostFormData {
	name: string;
	category?: string;
	amount: number;
	description?: string;
	payerUsername: string;
	shares: string; // Format: "username1:amount1,username2:amount2"
}
// --------------------------------------------------------------------------------------
