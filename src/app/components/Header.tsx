"use client"
import Icons from "./resuseable/Icons";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cart from "./Cart";
import Modal from "./resuseable/Modal";
import UserForm from "./UserForm";

const Header = () => {
    const [isSearchBar, setIsSearchBar] = useState(false);
    const [isSideBar, setIsSideBar] = useState(false);
    const [toggleUserForm, setToggleUserForm] = useState(false);
    console.log(toggleUserForm, "toggleUserForm");

    const router = useRouter();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const setModalStatusCallback = ({ isOpen }: { isOpen: boolean }) => {
        setToggleUserForm(isOpen);
    }

    const menuItems = [
        {
            name: "Home",
            href: "/",
        },
        {
            name: "Products",
            href: "/products",
        },
        {
            name: "About",
            href: "/about",
        },
        {
            name: "Contact",
            href: "/contact",
        },
    ]
    const commanClasses = {
        icon: "p-1 cursor-pointer hover:scale-110 hover:rotate-2 transition-all duration-300 hover:bg-slate-150 hover:border-[1px]  border-slate-150 hover:shadow-md shadow-emerald-200 "
    }
    const SearchBar = () => {
        return (
            <div className={`w-3/4 transition-all duration-900 h-full  flex justify-center p-2 items-center`}>
                <input type="text" placeholder="Search" className="w-full h-full border-2 border-slate-300 p-2.5 outline-none" />
                <Icons name="search" size={45} color="white" className={`bg-emerald-500 p-2 h-full cursor-pointer `} title="search" />
            </div>
        )
    }
    return (
        <header className="w-full h-[100px] bg-slate-50 shadow-md py-6 grid grid-cols-12 sticky top-0 z-9999">

            {/* Particles */}
            <span className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 rounded-full opacity-70 animate-particle"></span>
            <span className="absolute top-1/3 left-1/4 w-3 h-3 bg-emerald-500 rounded-full opacity-60 animate-particle delay-200"></span>
            <span className="absolute top-1/2 left-2/3 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-50 animate-particle delay-500"></span>
            <span className="absolute bottom-5 right-20 w-2.5 h-2.5 bg-emerald-400 rounded-full opacity-40 animate-particle delay-700"></span>
            <span className="absolute top-8 right-1/3 w-3 h-3 bg-emerald-500 rounded-full opacity-80 animate-particle delay-1000"></span>

            {/* Mobile SideBar */}
            {isSideBar && (
                <div className="lg:hidden absolute top-0 right-0 w-3/4 min-h-screen bg-slate-50 border-l-2 border-emerald-500 z-50 shadow-2xl backdrop-blur-sm animate-slideIn">
                    {/* Backdrop Overlay */}
                    <div
                        className="absolute inset- opacity-30 transition-opacity duration-500"
                        onClick={() => setIsSideBar(false)}
                    />

                    {/* Sidebar Content */}
                    <div className="relative z-10 h-full flex flex-col animate-fadeIn">
                        {/* Close Button */}
                        <div className="flex justify-end p-4">
                            <Icons
                                name="close"
                                size={40}
                                color="red"
                                className="cursor-pointer hover:scale-110 hover:rotate-90 transition-all duration-300 p-2 rounded-full hover:bg-red-50"
                                title="close"
                                onClick={() => setIsSideBar(false)}
                            />
                        </div>

                        {/* Menu Items */}
                        <ul className="flex flex-col gap-6 p-6 text-xl mt-4 font-delius-swash-caps">
                            {menuItems.map((item, index) => (
                                <li
                                    key={item.name}
                                    className="text-start pl-6 py-3 rounded-lg cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 hover:translate-x-2 hover:shadow-md transform animate-slideInItem"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    onClick={() => {
                                        router.push(item.href);
                                        setIsSideBar(false);
                                    }}
                                >
                                    <span className="relative group">
                                        {item.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* Footer Section */}
                        <div className="mt-auto p-6 border-t border-emerald-200 animate-slideUp">
                            <div className="flex justify-center gap-4">
                                <Icons name="userRoundPlus" size={30} color="black" className="cursor-pointer hover:scale-110 transition-all duration-300 p-2 rounded-full hover:bg-emerald-50" title="login/register" />
                                <Icons name="heart" size={30} color="black" className="cursor-pointer hover:scale-110 transition-all duration-300 p-2 rounded-full hover:bg-emerald-50" title="wishlist" />
                                <Icons name="cart" onClick={() => setIsCartOpen(!isCartOpen)} size={30} color="black" className="cursor-pointer hover:scale-110 transition-all duration-300 p-2 rounded-full hover:bg-emerald-50" title="cart" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Layout */}
            <div className="lg:hidden col-span-12 flex justify-between items-center px-4">
                <h2
                    onClick={() => router.push('/')}
                    className="text-2xl sm:text-3xl font-bold text-slate-900 font-courgette cursor-pointer hover:scale-105 transition-all duration-300"
                >
                    Fashion
                </h2>
                <ul className="flex items-center gap-2 sm:gap-4">
                    <li><Icons name="userRoundPlus" size={30} color="black" className={commanClasses.icon} title="login/register" /></li>
                    <li><Icons name="heart" size={30} color="black" className={commanClasses.icon} title="wishlist" /></li>
                    <li className="relative group z-1 cursor-pointer" onClick={() => router.push('/cart')}>
                        <Icons name="cart" size={30} color="black" className={commanClasses.icon} title="cart" />
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 w-5 h-5 flex justify-center items-center text-xs font-semibold rounded-full group-hover:top-[-5px] group-hover:right-[-15px] transition-all duration-200">0</span>
                    </li>
                    <li onClick={() => setIsSideBar(!isSideBar)}><Icons name="menu" size={30} color="black" className={commanClasses.icon} title="menu" /></li>
                </ul>
            </div>

            {/* Desktop Layout */}
            <h2
                onClick={() => router.push('/')}
                className="hidden lg:block col-span-3 text-3xl font-bold text-center text-slate-900 font-courgette cursor-pointer place-self-center hover:scale-105 transition-all duration-300"
            >
                Fashion
            </h2>
            <div className="hidden lg:block col-span-6 relative overflow-hidden">
                {/* SearchBar */}
                <div
                    className={`absolute top-0 left-0 w-full transition-transform duration-500 ease-in-out ${isSearchBar ? "translate-x-0" : "translate-x-full"} flex justify-center items-center`}
                >
                    <SearchBar />
                </div>

                {/* Menu */}
                <ul
                    className={`absolute top-0 left-0 w-full flex justify-center items-center gap-2 transition-transform duration-500 ease-in-out ${isSearchBar ? "-translate-x-full" : "translate-x-0"}`}
                >
                    {menuItems.map((item) => (
                        <li
                            key={item.name}
                            onClick={() => router.push(item.href)}
                            className={`${item.href === '/' ? 'bg-emerald-50 hover:bg-transparent text-emerald-600 font-bold' : ''} relative px-5 py-3 text-md group cursor-pointer duration-300 transition-all`}
                        >
                            {item.name}

                            {/* Top-left corner */}
                            <span className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500 opacity-0 transition-all duration-300 group-hover:top-0 group-hover:left-0 group-hover:opacity-100"></span>

                            {/* Bottom-right corner */}
                            <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500 opacity-0 transition-all duration-300 group-hover:bottom-0 group-hover:right-0 group-hover:opacity-100"></span>
                        </li>
                    ))}
                </ul>
            </div>

            <ul className="hidden lg:flex col-span-3 justify-center items-center gap-4">
                <li className="lg:block hidden" onClick={() => setIsSearchBar(!isSearchBar)}><Icons name={isSearchBar ? "close" : "search"} size={35} color={isSearchBar ? "red" : "black"} className={commanClasses.icon} title={isSearchBar ? "close" : "search"} /></li>
                <li onClick={() => setToggleUserForm(!toggleUserForm)}><Icons name="userRoundPlus" size={35} color="black" className={commanClasses.icon} title="login/register" /></li>
                <li><Icons name="heart" size={35} color="black" className={commanClasses.icon} title="wishlist" /></li>
                <li className="relative group z-1 cursor-pointer" onClick={() => setIsCartOpen(!isCartOpen)}>
                    <Icons name="cart" size={35} color="black" className={commanClasses.icon} title="cart" />
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 w-6 h-6 flex justify-center items-center text-sm font-semibold rounded-full group-hover:top-[-5px] group-hover:right-[-15px] transition-all duration-200">0</span>
                </li>
                <li className="lg:hidden block" onClick={() => setIsSideBar(!isSideBar)}><Icons name="menu" size={35} color="black" className={commanClasses.icon} title="menu" /></li>
            </ul>
            {isCartOpen && <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}

            {/** User Form */}
            <Modal className="w-3/4 h-3/4 bg-white rounded-lg p-4 flex justify-center items-center gap-1" setModalStatusCallback={setModalStatusCallback} isOpen={toggleUserForm} >
                <UserForm />
            </Modal>
        </header>
    );
}

export default Header;