import Icons from "./resuseable/Icons";

const Footer = () => {
    const commanClasses = {
        reachUs: "relative  after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-1/2 after:h-[2px] after:bg-emerald-500",
        categories: "relative text-md font-delius-swash-caps after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-1/2 hover:after:h-[2px] after:bg-emerald-500 cursor-pointer"
    }
    return (
        <footer className="w-full h-full min-h-2xl bg-slate-100 grid grid-cols-12 py-5">
            <div className="xl:col-span-4 lg:col-span-6 col-span-12 p-4 flex flex-col gap-6 justify-start items-start lg:px-16 px-4">
                <p className={`relative text-3xl text-center font-montez ${commanClasses.reachUs}`}>Reach us</p>
                <p className="text-md font-delius-swash-caps"><span className={commanClasses.reachUs + " font-bold"}>Email:</span> fashion@gmail.com</p>
                <p className="text-md font-delius-swash-caps"><span className={commanClasses.reachUs + " font-bold"}>Phone:</span> +91 9876543210</p>
                <p className="text-md font-delius-swash-caps"><span className={commanClasses.reachUs + " font-bold"}>Address:</span> 123, Main Street, Anytown, USA</p>
                <div className="">
                    <p className={`relative text-3xl text-center font-montez ${commanClasses.reachUs}`}>Follow us</p>
                </div>
                <div className="flex gap-4 mt-4">
                    <Icons name="facebook" size={30} color="black" className="cursor-pointer hover:scale-110 hover:rotate-2 transition-all duration-300 hover:bg-slate-200 p-2 rounded-full" title="Facebook" />
                    <Icons name="instagram" size={30} color="black" className="cursor-pointer hover:scale-110 hover:rotate-2 transition-all duration-300 hover:bg-slate-200 p-2 rounded-full" title="Instagram" />
                    <Icons name="twitter" size={30} color="black" className="cursor-pointer hover:scale-110 hover:rotate-2 transition-all duration-300 hover:bg-slate-200 p-2 rounded-full" title="Twitter" />
                    <Icons name="linkedin" size={30} color="black" className="cursor-pointer hover:scale-110 hover:rotate-2 transition-all duration-300 hover:bg-slate-200 p-2 rounded-full" title="LinkedIn" />
                </div>
                <h2 className="text-4xl font-bold font-courgette py-4">Fashion</h2>

            </div>
            <div className="xl:col-span-2 lg:col-span-6 col-span-12 p-4 flex flex-col gap-6 justify-start items-start">
                <p className={`relative text-3xl text-start font-montez ${commanClasses.reachUs}`}>Categories</p>
                <ul className="flex flex-col gap-2">
                    <li className={commanClasses.categories}>Men</li>
                    <li className={commanClasses.categories}>Women</li>
                    <li className={commanClasses.categories}>Kids</li>
                </ul>
                <p className={`relative text-3xl text-start font-montez ${commanClasses.reachUs}`}>Payment Methods</p>
                <div className="w-full h-16 grid place-items-start">
                    <img src="/payments.png" alt="payment" className="w-full h-full object-contain" />
                </div>
            </div>
            <div className="xl:col-span-2 lg:col-span-6 col-span-12 p-4 flex flex-col gap-6 justify-start items-start">
                <p className={`relative text-3xl text-start font-montez ${commanClasses.reachUs}`}>Quick Links</p>
                <ul className="flex flex-col gap-2 justify-center items-start">
                    <li className={commanClasses.categories}>Cart</li>
                    <li className={commanClasses.categories}>Wishlist</li>
                    <li className={commanClasses.categories}>Login</li>
                    <li className={commanClasses.categories}>Signup</li>
                    <li className={commanClasses.categories}>New Arrivals</li>
                    <li className={commanClasses.categories}>Best Sellers</li>
                    <li className={commanClasses.categories}>Terms and Conditions</li>
                    <li className={commanClasses.categories}>Privacy Policy</li>
                    <li className={commanClasses.categories}>Refund Policy</li>
                    <li className={commanClasses.categories}>Shipping Policy</li>
                    <li className={commanClasses.categories}>FAQ</li>
                    <li className={commanClasses.categories}>Contact Us</li>

                </ul>
            </div>
            <div className="xl:col-span-4 lg:col-span-6 col-span-12 p-4 flex flex-col gap-6 justify-start items-start px-8">
                <p className={`relative text-3xl text-start font-montez ${commanClasses.reachUs}`}>Newsletter</p>
                <p className="text-md font-delius-swash-caps">Receive our weekly newsletter.
                    For dietary content, fashion insider and the best offers.</p>
                <input type="email" placeholder="Enter your email" className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none" required />
                <button className="w-full h-16 bg-emerald-500 text-white font-delius-swash-caps cursor-pointer hover:bg-emerald-600 transition-all duration-200 rounded-md font-bold">Subscribe</button>
                <p className="text-md font-delius-swash-caps text-center mt-4 font-bold">© 2025 Fashion. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;