'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Request failed');
    }
    return data as T;
}

type Tab = 'overview' | 'edit' | 'security';

const ProfilePage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    const loading = useAppSelector((s) => s.auth.loading);
    const cartCount = useAppSelector((s) =>
        s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
    );
    const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
    const [ordersCount, setOrdersCount] = useState(0);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/v1/orders');
                const data = await res.json();
                if (!cancelled && res.ok && data.ok) {
                    setOrdersCount(data.data.total ?? 0);
                }
            } catch {
                /* ignore */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const [tab, setTab] = useState<Tab>('overview');
    const [name, setName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const [loggingOut, setLoggingOut] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/');
        }
    }, [loading, user, router]);

    useEffect(() => {
        if (user) setName(user.name);
    }, [user]);

    const initials = useMemo(() => {
        if (!user) return '';
        return user.name
            .split(' ')
            .map((s) => s[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }, [user]);

    const memberSince = useMemo(() => {
        if (!user?.created_at) return null;
        return new Date(user.created_at).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric',
        });
    }, [user]);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }
        setSavingProfile(true);
        try {
            const data = await apiJson<{
                success: boolean;
                data: { id: string; name: string; email: string; created_at?: string };
            }>('/api/users/me', {
                method: 'PATCH',
                body: JSON.stringify({ name: name.trim() }),
            });
            dispatch(setUser(data.data));
            toast.success('Profile updated');
            setTab('overview');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('All fields are required');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setSavingPassword(true);
        try {
            await apiJson('/api/users/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });
            toast.success('Password updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await signOut({ redirect: false });
        toast.success('Signed out');
        router.push('/');
    };

    // Loading or redirect-in-progress
    if (loading || !user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <span className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Toaster />

            {/* Breadcrumb */}
            <nav className="max-w-7xl mx-auto px-4 pt-8 pb-2 flex items-center gap-2 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-400">
                <button
                    onClick={() => router.push('/')}
                    className="hover:text-gray-900 transition-colors"
                >
                    Home
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Account</span>
            </nav>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-4 pt-6 pb-10 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {/* Avatar */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-inter font-semibold tracking-wider shadow-sm">
                            {initials}
                        </div>
                        <div>
                            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-1.5">
                                Welcome back
                            </p>
                            <h1 className="font-delius-swash-caps text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-tight">
                                {user.name}
                            </h1>
                            <p className="text-sm font-inter text-gray-500 mt-1">
                                {user.email}
                                {memberSince && (
                                    <span className="text-gray-300"> · Member since {memberSince}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setConfirmLogout(true)}
                        disabled={loggingOut}
                        className="self-start sm:self-end inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 rounded-md text-gray-700 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                        </svg>
                        Sign Out
                    </button>
                </div>
            </section>

            {/* Tabs + content */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Sidebar nav */}
                    <aside className="lg:col-span-3">
                        <ul className="space-y-0.5 -ml-3">
                            {(
                                [
                                    { key: 'overview', label: 'Overview' },
                                    { key: 'edit', label: 'Personal Details' },
                                    { key: 'security', label: 'Security' },
                                ] as Array<{ key: Tab; label: string }>
                            ).map((item) => {
                                const active = tab === item.key;
                                return (
                                    <li key={item.key}>
                                        <button
                                            onClick={() => setTab(item.key)}
                                            className={`relative w-full text-left pl-3 pr-3 py-2 text-sm font-inter transition-colors duration-200 ${active
                                                ? 'text-gray-900 font-semibold'
                                                : 'text-gray-500 hover:text-gray-900'
                                                }`}
                                        >
                                            <span
                                                className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 transition-all duration-200 ${active
                                                    ? 'h-4 bg-gray-900'
                                                    : 'h-0 bg-transparent'
                                                    }`}
                                            />
                                            {item.label}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Quick stats */}
                        <div className="mt-8 space-y-2.5">
                            <Stat
                                label="In your bag"
                                value={cartCount}
                                onClick={() => router.push('/checkout')}
                            />
                            <Stat
                                label="Wishlist"
                                value={wishlistCount}
                                onClick={() => router.push('/products')}
                            />
                            <Stat
                                label="Orders"
                                value={ordersCount}
                                onClick={() => router.push('/orders')}
                            />
                        </div>
                    </aside>

                    {/* Panel */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {tab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-8"
                                >
                                    <PanelHeader
                                        eyebrow="Profile"
                                        title="Your Account at a Glance"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InfoCard label="Name" value={user.name} />
                                        <InfoCard label="Email" value={user.email} />
                                        <InfoCard
                                            label="Member since"
                                            value={memberSince ?? '—'}
                                        />
                                        <InfoCard label="Account ID" value={user.id} />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setTab('edit')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                                        >
                                            Edit Profile
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setTab('security')}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 text-gray-900 rounded-md hover:border-gray-900 transition-colors"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {tab === 'edit' && (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-8"
                                >
                                    <PanelHeader
                                        eyebrow="Personal Details"
                                        title="Manage Your Information"
                                    />

                                    <div className="space-y-5 max-w-lg">
                                        <Field
                                            label="Full name"
                                            value={name}
                                            onChange={setName}
                                        />
                                        <Field
                                            label="Email"
                                            value={user.email}
                                            onChange={() => undefined}
                                            disabled
                                            help="Email cannot be changed at the moment"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={savingProfile || name.trim() === user.name}
                                            className={`inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase rounded-md transition-colors ${savingProfile || name.trim() === user.name
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-900 text-white hover:bg-emerald-600'
                                                }`}
                                        >
                                            {savingProfile ? (
                                                <>
                                                    <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                    Saving
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setName(user.name);
                                                setTab('overview');
                                            }}
                                            className="px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 text-gray-700 rounded-md hover:border-gray-900 hover:text-gray-900 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {tab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-8"
                                >
                                    <PanelHeader
                                        eyebrow="Security"
                                        title="Update Your Password"
                                    />

                                    <div className="space-y-5 max-w-lg">
                                        <Field
                                            label="Current password"
                                            value={currentPassword}
                                            onChange={setCurrentPassword}
                                            type="password"
                                        />
                                        <Field
                                            label="New password"
                                            value={newPassword}
                                            onChange={setNewPassword}
                                            type="password"
                                            help="At least 6 characters"
                                        />
                                        <Field
                                            label="Confirm new password"
                                            value={confirmPassword}
                                            onChange={setConfirmPassword}
                                            type="password"
                                        />
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={savingPassword}
                                        className={`inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase rounded-md transition-colors ${savingPassword
                                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                                            : 'bg-gray-900 text-white hover:bg-emerald-600'
                                            }`}
                                    >
                                        {savingPassword ? (
                                            <>
                                                <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                Updating
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {confirmLogout && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
                    >
                        <button
                            onClick={() => !loggingOut && setConfirmLogout(false)}
                            aria-label="Close"
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.97 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-7"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="flex justify-center mb-5">
                                <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-red-500"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={1.8}
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                </div>
                            </div>

                            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-red-500 text-center mb-2">
                                Sign Out
                            </p>
                            <h3 className="font-delius-swash-caps text-2xl text-gray-900 text-center leading-tight mb-3">
                                Sign out of your account?
                            </h3>
                            <p className="text-sm font-inter text-gray-600 text-center leading-relaxed mb-7">
                                You'll need to sign in again to access your profile, bag, and saved items.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setConfirmLogout(false)}
                                    disabled={loggingOut}
                                    className="flex-1 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 text-gray-900 rounded-md hover:border-gray-900 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase rounded-md transition-colors ${loggingOut
                                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                                        : 'bg-red-500 text-white hover:bg-red-600'
                                        }`}
                                >
                                    {loggingOut ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Signing Out
                                        </>
                                    ) : (
                                        'Yes, Sign Out'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Helpers ─────────────────────────────────────────────────── */

function PanelHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div>
            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                {eyebrow}
            </p>
            <h2 className="font-delius-swash-caps text-3xl text-gray-900 leading-tight">
                {title}
            </h2>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-5 rounded-xl border border-gray-100 bg-white">
            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-400 mb-1.5">
                {label}
            </p>
            <p className="text-sm font-inter font-medium text-gray-900 break-words">
                {value}
            </p>
        </div>
    );
}

function Stat({
    label,
    value,
    onClick,
}: {
    label: string;
    value: number;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md border border-gray-100 transition-colors ${onClick ? 'hover:border-gray-900 cursor-pointer' : 'cursor-default'
                }`}
        >
            <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500">
                {label}
            </span>
            <span className="text-base font-inter font-semibold text-gray-900">
                {value}
            </span>
        </button>
    );
}

function Field({
    label,
    value,
    onChange,
    type = 'text',
    disabled,
    help,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    disabled?: boolean;
    help?: string;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            />
            {help && (
                <span className="text-[10px] font-inter text-gray-400 mt-1 block">
                    {help}
                </span>
            )}
        </label>
    );
}

export default ProfilePage;
