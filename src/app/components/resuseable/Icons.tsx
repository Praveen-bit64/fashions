import React from "react";
import type { IconType } from "react-icons";
import { FiSearch, FiShoppingCart, FiMenu } from "react-icons/fi";
import { FaFacebook, FaHeart, FaInstagram, FaLinkedin, FaUser } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdClose, MdHome, MdHourglassEmpty } from "react-icons/md";
import { LuUserRoundPlus } from "react-icons/lu";
import { CiSquareMinus, CiSquarePlus, CiTrash, CiCircleCheck } from "react-icons/ci";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { FiRefreshCcw } from "react-icons/fi";

export type AppIconName =
    | "search"
    | "cart"
    | "menu"
    | "heart"
    | "user"
    | "close"
    | "home"
    | "userRoundPlus"
    | "facebook"
    | "instagram"
    | "twitter"
    | "linkedin"
    | "hourglassEmpty"
    | "minus"
    | "plus"
    | "trash"
    | "check"
    | "shield"
    | "refresh";


const ICONS: Record<AppIconName, IconType> = {
    search: FiSearch,
    cart: FiShoppingCart,
    menu: FiMenu,
    heart: FaHeart,
    user: FaUser,
    close: MdClose,
    home: MdHome,
    userRoundPlus: LuUserRoundPlus,
    facebook: FaFacebook,
    instagram: FaInstagram,
    twitter: FaXTwitter,
    linkedin: FaLinkedin,
    hourglassEmpty: MdHourglassEmpty,
    minus: CiSquareMinus,
    plus: CiSquarePlus,
    trash: CiTrash,
    check: CiCircleCheck,
    shield: IoShieldCheckmarkOutline,
    refresh: FiRefreshCcw,
};

export type IconProps = {
    name: AppIconName;
    size?: number | string;
    color?: string;
    className?: string;
    title?: string;
} & React.ComponentProps<"svg">;

const Icon: React.FC<IconProps> = ({ name, size = 20, color, className, title, ...rest }) => {
    const Component = ICONS[name];
    return <Component size={size} color={color} className={className} title={title} {...rest} />;
};

export default Icon;
export { ICONS };