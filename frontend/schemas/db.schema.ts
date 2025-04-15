// database schemas
export interface User {
	id: number;
	name: string;
	username: string;
	// password: string; # this should never be shared to the frontend, lets just validate it backend
	email: string;
	photoUrl: string;

	ownedGroups: Group[];
	joinedGroups: Group[];

	events: Event[];
}

export interface Group {
	id: number;
	name: string;
	status: string; // [e.g.: ('active', 'archived')]
	expiration: string | null; // [Optional, only present for temp groups]
	// timezone: string; // timezone used for all group events. bea: lets just ignore this for now :)

	creatorId: number;
	creator?: User; // [User item that created the group]

	memberIds: number[];
	members?: User[]; // [Array of User items]

	eventIds: number[];
	events?: Event[]; // [Array of Event items, each should refer to a recurring/individual task/event which should be displayed on the group calendar]

	costIds: number[];
	costs?: Cost[]; // [Array of Cost items, each should refer to a cost which is divvied up between selected members in the group]
	// [Theming options for users to customize colors/other?]
}

export interface Cost {
	id: number;
	name: string;
	category: string | null;
	amount: number;
	dateAdded: string;
	description: string | null;

	payerId: number;
	payer?: User;

	eventId: number;
	event?: Event;

	shares: CostShare[];
}

export interface CostShare {
	id: number;
	amount: number;
	isPaid: boolean;

	costId: number;
	cost?: Cost;

	borrowerId: number;
	borrower?: User;
}

export interface Event {
	id: number;
	name: string;
	date: string;
	// firstDate: string; // assuming dates/times will arrive as strings?
	// firstTime: string;
	// repeatEvery: string | null;

	memberIds: number[];
	members: User[];

	groupId: number;
	group: Group;
	
	costs: Cost[];
}
