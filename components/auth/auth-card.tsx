import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image"
import logo from "@/assets/logo.png";

interface AuthCardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
}

const AuthCard = ({ title, description, children }: AuthCardProps) => {
	return (
		<Card className="mx-auto max-w-sm sm:min-w-[450px] shadow-md rounded-lg border-2 border-[#A7875D]">
			<CardHeader>
				<div className=" w-18 h-1000 flex justify-between items-center">
					{title && <CardTitle className={`text-3xl font-bold text-center text-black-600 text-primary`}>{title}</CardTitle>}

					<Image src={logo} alt="logo navsupply" className="h-16 w-auto" />
				</div>
					
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
};

export default AuthCard;
