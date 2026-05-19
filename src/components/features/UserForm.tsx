'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { LoginFormValues, RegisterFormValues } from '@/types/form.type';
import { signIn } from 'next-auth/react';

interface UserFormProps {
    setModalStatusCallback: (isOpen: boolean) => void;
    callbackUrl?: string | null;
}

type Mode = 'signin' | 'signup';

const UserForm = ({ setModalStatusCallback, callbackUrl }: UserFormProps) => {
    const [mode, setMode] = useState<Mode>('signin');
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);

    const registerInitialValues: RegisterFormValues = {
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    };
    const loginInitialValues: LoginFormValues = { email: '', password: '' };

    const registerForm = useFormValidation(registerInitialValues);
    const loginForm = useFormValidation(loginInitialValues);

    const handleRegister = async (formValues: RegisterFormValues) => {
        await toast.promise(
            (async () => {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formValues.fullname,
                        email: formValues.email,
                        password: formValues.password,
                        confirmPassword: formValues.confirmPassword,
                    }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error ?? 'Registration failed');
                }
                registerForm.setValues(registerInitialValues);
                setMode('signin');
                return data;
            })(),
            {
                loading: 'Creating your account…',
                success: 'Account created — please sign in',
                error: (err: Error) => err.message,
            }
        );
    };

    const handleLogin = async (formValues: LoginFormValues) => {
        await toast.promise(
            (async () => {
                const res = await signIn('credentials', {
                    email: formValues.email,
                    password: formValues.password,
                    redirect: false,
                });
                if (!res || res.error) {
                    throw new Error('Invalid email or password');
                }
                loginForm.setValues(loginInitialValues);

                // Honour the redirect target the middleware queued (e.g. /checkout).
                // We only follow same-origin URLs to prevent open-redirect abuse.
                if (callbackUrl) {
                    try {
                        const dest = new URL(callbackUrl, window.location.origin);
                        if (dest.origin === window.location.origin) {
                            window.location.href = dest.pathname + dest.search + dest.hash;
                            return res;
                        }
                    } catch {
                        // Malformed callbackUrl — fall through to default close
                    }
                }

                setModalStatusCallback(false);
                return res;
            })(),
            {
                loading: 'Signing you in…',
                success: 'Signed in',
                error: (err: Error) => err.message,
            }
        );
    };

    return (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-5 min-h-[520px]">
            {/* Image panel */}
            <aside className="hidden md:block md:col-span-2 relative bg-gray-900 overflow-hidden">
                <img
                    src={mode === 'signin' ? '/signin-bg.png' : '/signup-bg.png'}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
                <div className="relative h-full flex flex-col justify-between p-8 lg:p-10 text-white">
                    <span className="text-[10px] font-inter font-semibold tracking-[0.4em] uppercase opacity-90">
                        Fashion · The Atelier
                    </span>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                        >
                            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-300 mb-4">
                                {mode === 'signin' ? 'Members Only' : 'Join The List'}
                            </p>
                            <h2 className="font-delius-swash-caps text-4xl lg:text-5xl leading-[1.05] mb-4">
                                {mode === 'signin'
                                    ? 'Welcome Back'
                                    : 'Become A Member'}
                            </h2>
                            <p className="text-sm font-inter text-white/80 leading-relaxed max-w-xs">
                                {mode === 'signin'
                                    ? 'Sign in to revisit your wishlist, track orders and unlock early releases.'
                                    : 'Create an account to save styles, get personalised picks and faster checkout.'}
                            </p>
                            <div className="mt-8 flex items-center gap-3">
                                <span className="h-px w-8 bg-white/40" />
                                <span className="text-[10px] font-inter font-medium tracking-[0.3em] uppercase text-white/60">
                                    Curated for you
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </aside>

            {/* Form panel */}
            <section className="md:col-span-3 flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-12 overflow-y-auto bg-white">
                {/* Tab toggle */}
                <div className="relative flex border-b border-gray-200 mb-10">
                    {(
                        [
                            { id: 'signin', label: 'Sign In' },
                            { id: 'signup', label: 'Create Account' },
                        ] as Array<{ id: Mode; label: string }>
                    ).map((tab) => {
                        const active = mode === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setMode(tab.id)}
                                className={`relative flex-1 pb-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase transition-colors ${active
                                    ? 'text-gray-900'
                                    : 'text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                                {active && (
                                    <motion.span
                                        layoutId="auth-tab-underline"
                                        className="absolute -bottom-px left-0 right-0 h-[2px] bg-gray-900"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 320,
                                            damping: 28,
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {mode === 'signin' ? (
                        <motion.form
                            key="signin"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            onSubmit={loginForm.onSubmit(handleLogin)}
                            className="space-y-5"
                            noValidate
                        >
                            <div>
                                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                                    Sign In
                                </p>
                                <h1 className="font-delius-swash-caps text-3xl text-gray-900 leading-tight">
                                    Good to see you again
                                </h1>
                            </div>

                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={String(loginForm.values.email ?? '')}
                                onChange={loginForm.handleChange}
                                error={loginForm.errors.email}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                            <FormField
                                label="Password"
                                name="password"
                                type={showSignInPassword ? 'text' : 'password'}
                                value={String(loginForm.values.password ?? '')}
                                onChange={loginForm.handleChange}
                                error={loginForm.errors.password}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                trailing={
                                    <PasswordToggle
                                        visible={showSignInPassword}
                                        onToggle={() =>
                                            setShowSignInPassword((p) => !p)
                                        }
                                    />
                                }
                            />

                            <div className="flex items-center justify-between text-xs font-inter">
                                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-3.5 h-3.5 accent-gray-900"
                                        defaultChecked
                                    />
                                    Remember me
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gray-900 text-white text-[11px] font-inter font-semibold tracking-[0.3em] uppercase rounded-md hover:bg-emerald-600 transition-colors"
                            >
                                Sign In
                            </button>

                            <p className="text-center text-xs font-inter text-gray-500 pt-2">
                                New here?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('signup')}
                                    className="text-gray-900 font-semibold underline-offset-4 hover:underline"
                                >
                                    Create an account
                                </button>
                            </p>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="signup"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25 }}
                            onSubmit={registerForm.onSubmit(handleRegister)}
                            className="space-y-5"
                            noValidate
                        >
                            <div>
                                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                                    New Account
                                </p>
                                <h1 className="font-delius-swash-caps text-3xl text-gray-900 leading-tight">
                                    Start your style journey
                                </h1>
                            </div>

                            <FormField
                                label="Full name"
                                name="fullname"
                                type="text"
                                value={String(registerForm.values.fullname ?? '')}
                                onChange={registerForm.handleChange}
                                error={registerForm.errors.fullname}
                                placeholder="Your name"
                                autoComplete="name"
                            />

                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={String(registerForm.values.email ?? '')}
                                onChange={registerForm.handleChange}
                                error={registerForm.errors.email}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />

                            <FormField
                                label="Password"
                                name="password"
                                type={showSignUpPassword ? 'text' : 'password'}
                                value={String(registerForm.values.password ?? '')}
                                onChange={registerForm.handleChange}
                                error={registerForm.errors.password}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                trailing={
                                    <PasswordToggle
                                        visible={showSignUpPassword}
                                        onToggle={() =>
                                            setShowSignUpPassword((p) => !p)
                                        }
                                    />
                                }
                            />

                            <FormField
                                label="Confirm password"
                                name="confirmPassword"
                                type={showSignUpConfirm ? 'text' : 'password'}
                                value={String(
                                    registerForm.values.confirmPassword ?? ''
                                )}
                                onChange={registerForm.handleChange}
                                error={registerForm.errors.confirmPassword}
                                placeholder="Re-enter password"
                                autoComplete="new-password"
                                trailing={
                                    <PasswordToggle
                                        visible={showSignUpConfirm}
                                        onToggle={() =>
                                            setShowSignUpConfirm((p) => !p)
                                        }
                                    />
                                }
                            />

                            <p className="text-[11px] font-inter text-gray-500 leading-relaxed">
                                By creating an account you agree to our{' '}
                                <Link
                                    href="/terms"
                                    className="text-gray-900 underline-offset-4 hover:underline"
                                >
                                    Terms
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="/privacy"
                                    className="text-gray-900 underline-offset-4 hover:underline"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </p>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-gray-900 text-white text-[11px] font-inter font-semibold tracking-[0.3em] uppercase rounded-md hover:bg-emerald-600 transition-colors"
                            >
                                Create Account
                            </button>

                            <p className="text-center text-xs font-inter text-gray-500 pt-2">
                                Already a member?{' '}
                                <button
                                    type="button"
                                    onClick={() => setMode('signin')}
                                    className="text-gray-900 font-semibold underline-offset-4 hover:underline"
                                >
                                    Sign in
                                </button>
                            </p>
                        </motion.form>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

/* ─── Field components ────────────────────────────────────────── */

function FormField({
    label,
    name,
    type,
    value,
    onChange,
    error,
    placeholder,
    autoComplete,
    trailing,
}: {
    label: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
    autoComplete?: string;
    trailing?: React.ReactNode;
}) {
    return (
        <div>
            <label htmlFor={name} className="block">
                <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                    {label}
                </span>
                <div className="relative">
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        className={`w-full ${trailing ? 'pr-11' : 'pr-4'} pl-4 py-3 border rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${error
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-gray-200 focus:border-gray-900'
                            }`}
                    />
                    {trailing && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                            {trailing}
                        </span>
                    )}
                </div>
            </label>
            {error && (
                <p className="text-[10px] font-inter text-red-600 mt-1 ml-1">
                    {error}
                </p>
            )}
        </div>
    );
}

function PasswordToggle({
    visible,
    onToggle,
}: {
    visible: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
        >
            {visible ? (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.58 10.58a3 3 0 004.24 4.24M9.88 5.09A10.94 10.94 0 0112 5c5 0 9.27 3.11 11 7-0.61 1.36-1.51 2.6-2.64 3.62M6.61 6.61C4.59 8 3 10 2 12c1.73 3.89 6 7 10 7 1.4 0 2.74-.27 3.97-.76"
                    />
                </svg>
            ) : (
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
                    />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )}
        </button>
    );
}

export default UserForm;
