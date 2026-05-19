'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { ViewerProfile } from '../SettingsClient';

const ROLE_LABEL: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    PRODUCT_MANAGER: 'Product Manager',
    CUSTOMER_SUPPORT: 'Customer Support',
    TAILOR: 'Tailor',
    CUSTOMER: 'Customer',
};

const ProfileTab = ({ viewer }: { viewer: ViewerProfile }) => {
    const router = useRouter();

    // Profile form
    const [name, setName] = useState(viewer.name);
    const [phone, setPhone] = useState(viewer.phone ?? '');
    const [savingProfile, setSavingProfile] = useState(false);

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name is required');
            return;
        }
        setSavingProfile(true);
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data?.error ?? 'Save failed');
            }
            toast.success('Profile updated');
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSavingProfile(false);
        }
    };

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('All password fields are required');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        setSavingPassword(true);
        try {
            const res = await fetch('/api/users/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data?.error ?? 'Password change failed');
            }
            toast.success('Password changed');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Password change failed');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
                {/* Profile */}
                <Card title="Personal Details">
                    <form onSubmit={saveProfile} className="space-y-5">
                        <Field label="Full Name" required>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                            />
                        </Field>

                        <Field label="Email" help="Email is your sign-in identifier and can't be changed here.">
                            <input
                                value={viewer.email}
                                disabled
                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 bg-gray-50 text-gray-500"
                            />
                        </Field>

                        <Field label="Phone">
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Optional"
                                maxLength={20}
                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                            />
                        </Field>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="px-6 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                                {savingProfile ? 'Saving…' : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </Card>

                {/* Password */}
                <Card title="Change Password">
                    <form onSubmit={changePassword} className="space-y-5">
                        <Field label="Current Password" required>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoComplete="current-password"
                                className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="New Password" required>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={6}
                                    className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                                />
                            </Field>
                            <Field label="Confirm New Password" required>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    minLength={6}
                                    className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
                                />
                            </Field>
                        </div>

                        <p className="text-[11px] font-inter text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
                            Use at least 6 characters. A mix of letters, numbers, and
                            symbols is strongest.
                        </p>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="px-6 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            >
                                {savingPassword ? 'Updating…' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-[100px] lg:self-start">
                <Card title="Your Account">
                    <div className="space-y-4">
                        <Detail label="Role" value={ROLE_LABEL[viewer.role] ?? viewer.role} />
                        <Detail
                            label="Member Since"
                            value={new Date(viewer.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        />
                        <Detail label="User ID" value={viewer.id.slice(0, 8) + '…'} mono />
                    </div>
                </Card>
            </div>
        </div>
    );
};

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <header className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    {title}
                </h2>
            </header>
            <div className="p-6">{children}</div>
        </section>
    );
}

function Field({
    label,
    required,
    help,
    children,
}: {
    label: string;
    required?: boolean;
    help?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-700 mb-2">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {help && (
                <p className="text-[11px] font-inter text-gray-400 mt-1.5">{help}</p>
            )}
        </div>
    );
}

function Detail({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div>
            <p className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500 mb-1">
                {label}
            </p>
            <p
                className={`text-sm text-gray-900 ${mono ? 'font-mono' : 'font-inter font-medium'
                    }`}
            >
                {value}
            </p>
        </div>
    );
}

export default ProfileTab;
