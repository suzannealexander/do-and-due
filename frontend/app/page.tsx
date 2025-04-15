import { getCurrentSession } from "@/actions/users.server";
import HomeFrame from "@/components/HomeFrame";
import PageLayout from "@/components/PageLayout";
import { UserDisplayData } from "@/schemas/fe.schema";
import { redirect } from "next/navigation";

export default async function Home() {
	// if user is not authenticated, redirect them to login
	const userData: UserDisplayData | null = await getCurrentSession();
	if (userData === null) {
		redirect("/user/login");
	}

	// Safely log groups and events if they exist
	if (userData.groups && userData.groups.length > 0) {
		console.log('User has groups:', userData.groups);
	} else {
		console.log('User has no groups yet');

	}
	return (
		<PageLayout>
			<HomeFrame userData={userData} />
		</PageLayout>
	);
}
