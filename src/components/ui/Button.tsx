import { ButtonProps } from "@/types/buttonprops.type";

const Button = (props: ButtonProps) => {
    const { type, beforeIcon, afterIcon, content, className, variant } = props
    const btnColor = variant === "primary" ? "bg-emerald-500 hover:bg-emerald-600 text-white"
        : variant === "secondary" ? "bg-rose-500 text-white hover:bg-rose-600"
            : variant === "dark" ? ""
                : variant === "outline" ? ""
                    : ""
    return (
        <div className="w-full">
            <button
                type={type}
                className={`${className} ${btnColor} w-full h-12  font-delius-swash-caps cursor-pointer  transition-all duration-200 rounded-md font-bold flex justify-center items-center gap-0.5`}
            >
                {beforeIcon && beforeIcon}
                {content}
                {afterIcon && afterIcon}
            </button>
        </div>
    );
}

export default Button;