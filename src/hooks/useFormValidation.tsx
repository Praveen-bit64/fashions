import { useState } from "react"

export const useFormValidation = <T extends Record<string, unknown>>(intialValues: T) => {
    const [values, setValues] = useState(intialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setValues((prev) => (
            {
                ...prev,
                [name]: value
            }
        ))
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;

        setTouched((prev) => (
            {
                ...prev,
                [name]: true,
            }
        ))

        validateField(name as keyof T, values[name as keyof T], values);
    }

    const validateField = <K extends keyof T>(name: K, value: T[K], formData: T) => {
        let error = "";

        switch (name) {
            case "fullname":
                if (!value) error = "Name is required";
                else if (!String(value).trim()) error = "Name is required";
                else if (String(value).trim().length < 2) error = "Name must be atlease 2 charaters";
                break;

            case "email":
                if (!String(value).trim()) error = "Email is required";
                else if (!/\S+@\S+\.\S+/.test(String(value))) error = "Email Invalid";
                break;

            case "password":
                if (!String(value).trim()) error = " Password required";
                else if (String(value).length < 5) error = "Password must be more than 5 characters";
                break;

            case "confirmPassword":
                if (!String(value).trim()) error = "Confirm Password required";
                else if (value !== formData.password) error = " Password doesn't match";
                break;

            default:
                break;
        }

        setErrors((prev) => (
            {
                ...prev,
                [name]: error || undefined
            }
        ))

        return error;
    }

    const validateForm = () => {
        const newErrors: Partial<Record<keyof T, string>> = {};

        (Object.keys(values) as (keyof T)[]).forEach((field) => {
            const error = validateField(field, values[field], values);

            if (error) newErrors[field] = error;
        })
        setErrors(newErrors)
        return newErrors;
    }

    const onSubmit = (callback: (values: T) => void) => (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formErrors = validateForm();

        if (Object.keys(formErrors).length === 0) {
            callback(values);
        }
    }

    return {
        values,
        errors,
        setValues,
        handleBlur,
        handleChange,
        touched,
        onSubmit
    }
}