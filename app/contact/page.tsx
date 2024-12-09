import FormContact from "@/components/contact/FormContact";
import Navbar from "@/components/site/navbar";
import Link from "next/link";

export default async function Contact() {

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-primary px-4 md:px-6 z-10">
        <Navbar />
      </header>
      <div className="flex flex-col justify-between gap-8 w-[85%] mt-20 m-auto text-justify xl:flex-row xl:w-[80%] xl:mt-32">
        <div>
          <h2 className="text-3xl max-w-full font-bold text-primary xl:max-w-[700px] lg:text-4xl">Contact us</h2>
          <p className="pt-11">We are here to help you! Send your questions via email, form or directly by phone</p>
          <div className="flex flex-col justify-center items-center text-center max-w-full gap-5 m-auto mt-12 bg-slate-50 rounded-xl xl:max-w-[280px]">
            <p className="text-lg text-primary font-semibold relative pl-5 pt-7 hover:text-[#cf964d] hover:cursor-default">+55 (27) 3019-3681</p>
            <p className="text-lg text-primary font-semibold relative pl-5 hover:text-[#cf964d] hover:cursor-default">+55 (27) 3019-3681</p>
            <p className="text-lg text-primary font-semibold relative pl-5 hover:text-[#cf964d] hover:cursor-default">+55 (27) 3019-3681</p>
            <Link href="mailto:lucasmanoel.g.g@gmail.com" className="text-lg text-primary font-semibold cursor-pointer relative p-5 border-t-[1px] w-full"><span className="text-[#cf964d]">brazil</span>@navsupply.com.br</Link>
          </div>
        </div>
        <FormContact />
      </div>
    </div>
  )
}