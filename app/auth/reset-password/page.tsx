import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import Navbar from "@/components/site/navbar";

const page = () => {
	return (
		<div className="overflow-y-hidden h-screen">
			<header className="sticky top-0 flex h-20 items-center gap-4 bg-primary px-4 md:px-6 z-10">
				<Navbar />
			</header>
			<div className="relative w-full min-h-screen flex items-center justify-center"
				style={{
					backgroundImage: "url('/nacaipital.jpg')",
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay escuro */}
				<div className="relative z-10">
					<ResetPasswordForm />
				</div>
			</div>
		</div>
	);
};

export default page;
