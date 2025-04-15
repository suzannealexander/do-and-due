import { coerce, z } from "zod";

const passwordSchema = z
	.string({ required_error: "Password is required" })
	.min(7, "Password must be at least 8 characters")
	.max(33, "Password must be at most 32 characters");

const passwordCreationSchema = z
	.string({ required_error: "Password is required" })
	.min(7, "Password must be at least 8 characters")
	.max(33, "Password must be at most 32 characters")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(/[!@#$%^&*(),.-_?]/, {
		message:
			"Password must contain at least 1 special character !@#$%^&*(),.-_?",
	});

const usernameSchema = z
	.string({ required_error: "Username is required" })
	.min(3, "Username must be at least 4 characters")
	.max(25, "Username must be at most 24 characters");

export const loginUserSchema = z.object({
	username: usernameSchema,
	password: passwordSchema,
});

// based on the recommendations here: https://react-ts-form.com/docs/docs/zod-tips
export const registerUserSchema = z
	.object({
		username: z
			.string({ required_error: "Username is required" })
			.min(1, "Username is required")
			.max(25, "Username must be at most 24 characters"),
		email: z
			.string({ required_error: "Email is required" })
			.email("Invalid email format"),
		password: passwordCreationSchema,
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const createGroupSchema = z.object({
	groupName: z.string({ required_error: "Group name is required" }),
	members: z.string(),
});

export const createEventSchema = z.object({
	name: z
		.string({ required_error: "Event name is required" })
		.min(2, "Event name must be at least 3 characters"),
	date: z.string({ required_error: "A date must be specified" }),
	members: z.string({
		required_error: "At least one member must be selected",
	}),
	
	// Optional cost fields
	costName: z.string().optional(),
	costCategory: z.string().optional(),
	costDescription: z.string().optional(),
	payerUsername: z.string().optional(),
	repeats: z.enum(["None", "Daily", "Weekly", "Monthly", "Yearly"])
});

export const addMemberSchema = z.object({
	groupName: z.string({ required_error: "Group name is required" }),
	members: z.string(),
});

export const createCostSchema = z.object({
	name: z.string({ required_error: "Cost name is required" })
		.min(2, "Cost name must be at least 2 characters"),
	category: z.string().optional(),
	amount: z.coerce.number({ required_error: "Amount is required" })
		.positive("Amount must be positive"),
	description: z.string().optional(),
	payerUsername: z.string({ required_error: "Payer is required" }),
	shares: z.string({ required_error: "Shares are required" })
		.regex(/^[a-zA-Z0-9_]+:[0-9]+(\.[0-9]{1,2})?(,[a-zA-Z0-9_]+:[0-9]+(\.[0-9]{1,2})?)*$/, 
			"Shares must be in the format 'username1:amount1,username2:amount2'")
});