"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser, LogOut } from "lucide-react";
import type { User } from "next-auth";
import Link from "next/link";
import { LineMdCogLoop } from "../icons";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import LoginButton from "./login-button";
import LogoutButton from "./logout-button";

type Props = {
	user?: User;
};

const LoginBadge = ({ user }: Props) => {
	return (
		<>
			{user && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Avatar>
							<AvatarImage src={user?.image || ""} />
							<AvatarFallback className="bg-green-500">
								<CircleUser className="h-5 w-5" />
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel className="text-center">Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Link href="/auth/settings" className="flex flex-1 justify-center items-center">
								<LineMdCogLoop className="mr-2" />
								Profile
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<LogoutButton>
							<DropdownMenuItem className="p-0 m-0">
								<Button variant={"ghost"} className="flex flex-1 justify-around">
									<LogOut /> Log Out
								</Button>
							</DropdownMenuItem>
						</LogoutButton>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
			{!user && (
				<LoginButton>
					<Button className="text-primary hover:text-primary-foreground hover:bg-blue-900 duration-300" variant={"outline"}>Log In</Button>
				</LoginButton>
			)}
		</>
	);
};

export default LoginBadge;
