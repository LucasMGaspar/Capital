import { auth } from "@/auth";
import AccessDenied from "@/components/accessDenied";
import AdminForm from "@/components/admin";

export default async function Admin() {
	const session = await auth();

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

	if (session?.user.role !== 'ADMIN') {
		return <AccessDenied />
	}

	return (
		<div className="flex min-h-screen w-full flex-col">
			<AdminForm />
		</div>
	);
}