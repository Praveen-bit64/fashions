import Link from "next/link";
import SectionHeader from "./resuseable/SectionHeader";

const UserForm = () => {
    return (
        <>
            {/* <div className="w-3/5 h-full relative flex flex-col justify-center items-start text-white rounded-lg overflow-hidden">
                <img
                    src="/signin-bg.png"
                    alt="hero-bg"
                    className="w-full h-full object-contain object-right absolute top-0 left-0 z-99"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400 via-rose-300 to-rose-700 z-10"></div>

                <div className="relative flex flex-col items-center px-6 text-center w-3/4 z-100">
                    <SectionHeader
                        title="Welcome Back"
                        subtitle="Step into your style journey.
              Discover the latest trends, save your favorites, and shop effortlessly."
                        titleFont="delius-swash-caps"
                        subtitleFont="montez"
                        titleSize="4xl"
                        subtitleSize="2xl"
                        textAlign="center"
                        titleColor="white"
                        subtitleColor="white"
                        maxWidth="2xl"
                        spacing="normal"
                        showDivider={true}
                        dividerColor="white"
                    />
                    <p className="text-sm italic opacity-80">✨ Fashion made for you ✨</p>

                </div>
            </div>

            <div className="w-2/5 h-full flex flex-col justify-center px-6">
                <form className="w-full h-full flex flex-col justify-center items-center gap-4">
                    <h1 className="text-4xl font-extrabold mb-4 font-montez">Sign In</h1>
                    <input type="email" placeholder="Email" className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none" />
                    <input type="password" placeholder="Password" className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none" />
                    <button className="w-full h-16 bg-emerald-500 text-white font-delius-swash-caps cursor-pointer hover:bg-emerald-600 transition-all duration-200 rounded-md font-bold">Sign In</button>
                    <p className="text-sm font-delius-swash-caps">Forgot password? <Link className="text-emerald-500 underline" href="/forgot-password">Reset password</Link></p>
                    <p className="text-sm font-delius-swash-caps">Don't have an account? <Link className="text-emerald-500 underline" href="/signup">Sign up</Link></p>
                </form>
            </div> */}


            <div className="w-2/5 h-full flex flex-col justify-center px-6">
                <form className="w-full h-full flex flex-col justify-center items-center gap-4">
                    <h1 className="text-4xl font-extrabold mb-4 font-montez">Create Account</h1>
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="w-full h-16 border-2 border-slate-300 p-2.5 outline-none"
                    />
                    <button
                        className="w-full h-16 bg-rose-500 text-white font-delius-swash-caps cursor-pointer hover:bg-rose-600 transition-all duration-200 rounded-md font-bold"
                    >
                        Sign Up
                    </button>

                    <p className="text-sm font-delius-swash-caps">
                        Already have an account?{" "}
                        <Link className="text-rose-500 underline" href="/signin">Sign in</Link>
                    </p>
                </form>

            </div>
            <div className="w-3/5 h-full relative flex flex-col justify-center items-end text-white rounded-lg overflow-hidden">
                <img
                    src="/signup-bg.png"
                    alt="hero-bg"
                    className="w-full h-full object-contain object-left absolute top-0 left-0 z-99"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-emerald-300 to-emerald-400 z-10"></div>

                <div className="relative flex flex-col items-center px-6 text-center w-3/4 z-100">
                    <SectionHeader
                        title="Hello Again!"
                        subtitle="Ready to pick up where you left off?  
  Access your saved styles, track your orders, and unlock members-only perks."
                        titleFont="delius-swash-caps"
                        subtitleFont="montez"
                        titleSize="4xl"
                        subtitleSize="2xl"
                        textAlign="center"
                        titleColor="white"
                        subtitleColor="white"
                        maxWidth="2xl"
                        spacing="normal"
                        showDivider={true}
                        dividerColor="white"
                    />
                    <p className="text-sm italic opacity-80">✨ Stay stylish, stay you ✨</p>

                </div>
            </div>
        </>
    );
}

export default UserForm;