import aboutimage from "@/assets/aboutimage.jpg";
import Navbar from "@/components/site/navbar";
import Image from "next/image";
import Link from "next/link";

export default async function AboutUs() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-20 items-center gap-4 bg-primary px-4 md:px-6 z-10">
        <Navbar />
      </header>
      <div className="flex flex-col justify-between gap-8 w-[85%] mt-20 m-auto text-justify xl:flex-row xl:w-[80%] xl:mt-32">
        <div>
          <h2 className="text-2xl max-w-full font-bold text-primary xl:max-w-[700px] lg:text-3xl"><span className="text-[#cf964d]">We have a vast experience in Ship Chandler</span>, we offer high quality products and our prices are always competitive.</h2>
          <div className="flex flex-col max-w-full gap-5 mt-12 xl:max-w-[700px]">
            <p className="text-lg relative pl-5"><span className="absolute left-0 top-[7px] bottom-0 w-3 h-3 rounded-md bg-[#cf964d] content-*"></span><span className="font-semibold text-primary">But what really differentiates</span> NavSupply from others is our attention to detail. For us everything matters.</p>
            <p className="text-lg relative pl-5"><span className="absolute left-0 top-[7px] bottom-0 w-3 h-3 rounded-md bg-primary content-*"></span><span className="font-semibold text-primary">Our goal</span> is to solve your problem whatever it may be. Just notify us at any time and we will immediately do what is needed to deliver the best solution.</p>
            <p className="text-lg relative pl-5"><span className="absolute left-0 top-[7px] bottom-0 w-3 h-3 rounded-md bg-[#cf964d] content-*"></span><span className="font-semibold text-primary">We focus</span> in streamlining each operation for our diverse customers: offshore, oil tankers, bulk carriers, container ships, military ships, tugboats and research vessels.</p>
            <Link href="https://sitenavsupply-production-e8dd.up.railway.app//navsupply-presentation.pdf" className="font-semibold italic text-center rounded-md w-60 m-auto mt-5 p-4 text-primary-foreground duration-300 bg-[#cf964d] hover:bg-primary">
              NavSupply Presentation
            </Link>
          </div>
        </div>
        <Image className="max-w-full object-cover rounded-lg mt-8 xl:max-w-[600px] xl:mt-0" src={aboutimage} alt="" />
      </div>
      <div className="flex flex-col justify-between gap-8 mb-36 w-[85%] mt-20 m-auto xl:w-[80%] xl:mt-32">
        <h2 className="text-xl max-w-full font-bold text-primary xl:max-w-[50%] lg:text-2xl">The profile of the people who make up our team and the way each one of them works have built an <span className="text-[#cf964d]">excellent reputation for Navsupply.</span></h2>
        <div className="flex flex-col justify-between max-w-full gap-14 mt-12 text-justify lg:flex-row">
          <div className="flex flex-col gap-3">
            <p className="text-lg relative">• A team made up of people who understand the urgency in the shipping industry and the impossibility of error in the supply.</p>
            <p className="text-lg relative">• Strong investor group to ensure maximum excellence in delivery and compliance in negotiations.</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-lg relative">• Professionals with diverse skills who came from various branches of shipping companies (Shipping Agency, Maritime Support, Ship Chandler, equipment and spare parts trading).</p>
            <p className="text-lg relative">• The use of integrated management system and all available technologies to provide the best service.</p>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-lg relative">• Partnerships with a network of various serve providers (hull cleaning, tanks, electrical, hydraulic and mechanical maintenance, etc.) for the proper functioning of the operation.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
