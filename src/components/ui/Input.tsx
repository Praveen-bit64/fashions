import { InputPropsType } from "@/types/Inputprops.type";

const Input = (props: InputPropsType) => {
    const { name, label, hasError, placeholder, value, className, type, onChange, beforeIcon, afterIcon, ...rest } = props;
    return (
        <div className="flex flex-col gap-0.5 justify-start items-start w-full">
            {label && <h3 className="text-md">{label}</h3>}
            <div className={`${className} ${hasError ? "!border-red-500" : ''} w-full h-12  border-2 border-slate-300 p-2.5 outline-none flex justify-between items-center gap-1.5`}>
                {beforeIcon && <span>{beforeIcon}</span>}
                <input
                    type={type}
                    placeholder={placeholder}
                    name={name}
                    value={value}
                    onChange={onChange}
                    {...rest}
                    className="w-full h-full outline-none"
                />
                {afterIcon && <span>{afterIcon}</span>}
            </div>
            {hasError && <span className="text-red-400 text-sm mt-0">{hasError}</span>}
        </div>
    );
}

export default Input;