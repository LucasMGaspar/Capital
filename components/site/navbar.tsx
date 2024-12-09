// navbar.tsx

import logo from "@/assets/logo.svg";
import { auth } from "@/auth";
import LoginBadge from "@/components/auth/login-badge";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import ConvertCurrency from "./ConvertCurrency";
import CartIcon from "@/components/cart/CartIcon";

const Navbar = async () => {
  const session = await auth();

  return (
    <div className="flex w-full justify-between items-center lg:mx-10">
      <Link href="/" className="flex justify-center items-center">
        <Image className="flex w-44 cursor-pointer md:w-52" src={logo} alt="logo" />
      </Link>
      <div className="hidden lg:flex gap-12">
       
      </div>
      <div className="flex items-center gap-4 md:gap-2 lg:gap-5">
        <div className="hidden sm:flex">
          
        </div>
        <CartIcon />
        {/* <FlagsLanguage /> */}
        
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger className="" asChild>
              <Menu className="flex w-8 h-8 cursor-pointer text-white" />
            </SheetTrigger>
            
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
