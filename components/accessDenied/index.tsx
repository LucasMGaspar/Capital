import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

export default function AccessDenied() {
  return (
    <div
      className="flex justify-center items-center h-full"
      style={{
        backgroundImage: "url('/nacaipital.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay escuro */}
      <Card className="w-[350px] relative z-10 border-2">
        <CardHeader className="flex justify-center items-center">
          <CardTitle>Access Denied!</CardTitle>
          <CardDescription>Permission denied to access the page.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Link href="/" className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 py-3 rounded-lg">
            <ArrowLeft size={20} />
            Back
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}