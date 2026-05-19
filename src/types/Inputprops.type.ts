import { JSX } from "react"

export type InputPropsType = {
    name?:string,
    placeholder?:string,
    className?:string,
    value?:string,
    type?: "text" | "password" | "email",
    beforeIcon?:JSX.Element,
    afterIcon?:JSX.Element,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    hasError?:string,
    label?:string
}