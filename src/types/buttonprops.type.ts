export interface ButtonProps {
    type?:"submit" | "reset" | "button",
    className?:string,
    variant?:"primary" | "secondary" | "dark" | "outline"
    onClick?:React.MouseEventHandler<HTMLButtonElement>,
    beforeIcon?:React.ReactNode,
    afterIcon?:React.ReactNode,
    content:string | React.ReactNode
}