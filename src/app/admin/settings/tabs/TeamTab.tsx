'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Role } from '@prisma/client';
import type { TeamMember, ViewerProfile } from '../SettingsClient';

const ADMIN_ROLES: Role[] = [
    'TAILOR',
    'PRODUCT_MANAGER',
    'CUSTOMER_SUPPORT',
    'SUPER_ADMIN',
];

const ROLE_LABEL: Record<Role, string> = {
    SUPER_ADMIN: 'Super Admin',
    PRODUCT_MANAGER: 'Product Manager',
    CUSTOMER_SUPPORT: 'Customer Support',
    TAILOR: 'Tailor',
    CUSTOMER: 'Customer',
};

const ROLE_TINT: Record<Role, string> = {
    SUPER_ADMIN: 'bg-purple-50 border-purple-200 text-purple-700',
    PRODUCT_MANAGER: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    CUSTOMER_SUPPORT: 'bg-blue-50 border-blue-200 text-blue-700',
    TAILOR: 'bg-amber-50 border-amber-200 text-amber-800',
    CUSTOMER: 'bg-gray-100 border-gray-200 text-gray-600',
};

const initials = (name: string) =>
    name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

const TeamTab = ({
    viewer,
    initial,
}: {
    viewer: ViewerProfile;
    initial: TeamMember[];
}) => {
    const router = useRouter();
    const [inviteOpen, setInviteOpen] = useState(false);

    const isSuperAdmin = viewer.role === 'SUPER_ADMIN';
    const activeMembers = useMemo(
        () => initial.filter((m) => !m.deactivated),
        [initial]
    );
    const inactiveMembers = useMemo(
        () => initial.filter((m) => m.deactivated),
        [initial]
    );

    return (
        <div className="space-y-6">
            {/* KPI strip + invite */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat label="Active Members" value={String(activeMembers.length)} />
                <Stat
                    label="Super Admins"
                    value={String(
                        activeMembers.filter((m) => m.role === 'SUPER_ADMIN').length
                    )}
                />
                <Stat
                    label="Tailors"
                    value={String(activeMembers.filter((m) => m.role === 'TAILOR').length)}
                />
                <Stat label="Inactive" value={String(inactiveMembers.length)} />
            </div>

            {!isSuperAdmin && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-inter text-amber-900">
                    Only super admins can invite or modify team members.
                </div>
            )}

            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                        Active Team ({activeMembers.length})
                    </h2>
                    {isSuperAdmin && (
                        <button
                            onClick={() => setInviteOpen((p) => !p)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.4}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            {inviteOpen ? 'Close' : 'Invite Admin'}
                        </button>
                    )}
                </header>

                <AnimatePresence initial={false}>
                    {inviteOpen && isSuperAdmin && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-b border-gray-100"
                        >
                            <InviteForm
                                onDone={() => {
                                    setInviteOpen(false);
                                    router.refresh();
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeMembers.length === 0 ? (
                    <p className="px-6 py-12 text-center text-sm font-inter text-gray-500">
                        No team members yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {activeMembers.map((m) => (
                            <MemberRow
                                key={m.id}
                                member={m}
                                viewer={viewer}
                                canManage={isSuperAdmin}
                                onChange={() => router.refresh()}
                            />
                        ))}
                    </ul>
                )}
            </section>

            {/* Inactive list */}
            {inactiveMembers.length > 0 && (
                <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <header className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500">
                            Deactivated ({inactiveMembers.length})
                        </h2>
                    </header>
                    <ul className="divide-y divide-gray-100">
                        {inactiveMembers.map((m) => (
                            <MemberRow
                                key={m.id}
                                member={m}
                                viewer={viewer}
                                canManage={isSuperAdmin}
                                onChange={() => router.refresh()}
                                inactive
                            />
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

/* ─── Invite form ──────────────────────────────────────────── */

function InviteForm({ onDone }: { onDone: () => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('PRODUCT_MANAGER');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const generatePassword = () => {
        const chars =
            'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let out = '';
        for (let i = 0; i < 14; i++) {
            out += chars[Math.floor(Math.random() * chars.length)];
        }
        setPassword(out);
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/v1/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    role,
                    phone: phone.trim() || null,
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Invite failed');
            }
            toast.success(
                `Invited ${name}. Share the password with them — it won't be shown again.`,
                { duration: 6000 }
            );
            setName('');
            setEmail('');
            setRole('PRODUCT_MANAGER');
            setPhone('');
            setPassword('');
            onDone();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Invite failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={submit} className="p-6 space-y-5 bg-gray-50/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" required>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        minLength={2}
                        maxLength={120}
                        className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
                    />
                </Field>
                <Field label="Email" required>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
                    />
                </Field>
            </div>

            <Field label="Role" required>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ADMIN_ROLES.map((r) => {
                        const active = role === r;
                        return (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setRole(r)}
                                className={`py-2.5 text-[10px] font-inter font-semibold tracking-widest uppercase rounded-md border transition-colors ${active
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                {ROLE_LABEL[r]}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Phone">
                <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Optional"
                    maxLength={20}
                    className="w-full px-4 py-2.5 text-sm font-inter rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
                />
            </Field>

            <Field
                label="Initial Password"
                required
                help="Share this securely with the new admin. They can change it after first sign-in."
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        maxLength={72}
                        placeholder="At least 8 characters"
                        className="flex-1 px-4 py-2.5 text-sm font-mono tracking-wider rounded-md border border-gray-200 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors bg-white"
                    />
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="px-3 py-2.5 text-[10px] font-inter font-semibold tracking-widest uppercase border border-gray-200 text-gray-700 rounded-md hover:bg-white transition-colors"
                    >
                        Generate
                    </button>
                </div>
            </Field>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                    {submitting ? 'Inviting…' : 'Send Invite'}
                </button>
            </div>
        </form>
    );
}

/* ─── Member row ──────────────────────────────────────────── */

function MemberRow({
    member,
    viewer,
    canManage,
    onChange,
    inactive = false,
}: {
    member: TeamMember;
    viewer: ViewerProfile;
    canManage: boolean;
    onChange: () => void;
    inactive?: boolean;
}) {
    const [busy, setBusy] = useState(false);
    const [showRoleMenu, setShowRoleMenu] = useState(false);
    const isSelf = member.id === viewer.id;

    const updateRole = async (next: Role) => {
        setBusy(true);
        setShowRoleMenu(false);
        try {
            const res = await fetch(`/api/v1/team/${member.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: next }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Update failed');
            }
            toast.success(`Role updated to ${ROLE_LABEL[next]}`);
            onChange();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setBusy(false);
        }
    };

    const deactivate = async () => {
        if (!confirm(`Deactivate ${member.name}? They won't be able to sign in.`)) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/v1/team/${member.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Deactivate failed');
            }
            toast.success(`${member.name} deactivated`);
            onChange();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Deactivate failed');
        } finally {
            setBusy(false);
        }
    };

    const reactivate = async () => {
        setBusy(true);
        try {
            const res = await fetch(`/api/v1/team/${member.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reactivate: true }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Reactivate failed');
            }
            toast.success(`${member.name} reactivated`);
            onChange();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Reactivate failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <li
            className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors ${inactive ? 'opacity-70' : ''
                }`}
        >
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-inter font-semibold tracking-wider flex-shrink-0">
                {initials(member.name)}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-inter font-semibold text-gray-900 truncate">
                        {member.name}
                    </p>
                    {isSelf && (
                        <span className="text-[9px] font-inter font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            You
                        </span>
                    )}
                </div>
                <p className="text-[11px] font-inter text-gray-500 truncate">
                    {member.email}
                    {member.phone ? ` · ${member.phone}` : ''}
                </p>
                {member.role === 'TAILOR' && member.tailoringJobsCount > 0 && (
                    <p className="text-[10px] font-inter text-gray-400 mt-0.5">
                        {member.tailoringJobsCount} active job
                        {member.tailoringJobsCount === 1 ? '' : 's'}
                    </p>
                )}
            </div>
            <div className="hidden sm:block text-[10px] font-inter text-gray-400 whitespace-nowrap">
                Joined {formatDate(member.createdAt)}
            </div>
            <div className="relative">
                <button
                    onClick={() => canManage && !isSelf && setShowRoleMenu((p) => !p)}
                    disabled={!canManage || isSelf || busy || inactive}
                    className={`inline-flex items-center text-[10px] font-inter font-semibold tracking-widest uppercase border px-2 py-0.5 rounded ${ROLE_TINT[member.role]
                        } ${canManage && !isSelf && !inactive
                            ? 'hover:opacity-80 cursor-pointer'
                            : 'cursor-default'
                        }`}
                >
                    {ROLE_LABEL[member.role]}
                    {canManage && !isSelf && !inactive && (
                        <svg
                            className="w-3 h-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.4}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    )}
                </button>
                {showRoleMenu && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-md border border-gray-200 bg-white shadow-lg py-1">
                        {ADMIN_ROLES.map((r) => (
                            <button
                                key={r}
                                onClick={() => updateRole(r)}
                                disabled={r === member.role}
                                className="w-full text-left px-3 py-2 text-xs font-inter text-gray-700 hover:bg-gray-50 disabled:text-gray-300 disabled:bg-transparent disabled:cursor-default"
                            >
                                {ROLE_LABEL[r]}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {canManage && !isSelf && (
                <div>
                    {inactive ? (
                        <button
                            onClick={reactivate}
                            disabled={busy}
                            className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase text-emerald-700 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                        >
                            Reactivate
                        </button>
                    ) : (
                        <button
                            onClick={deactivate}
                            disabled={busy}
                            className="px-3 py-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                            Deactivate
                        </button>
                    )}
                </div>
            )}
        </li>
    );
}

/* ─── Bits ──────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                {label}
            </p>
            <p className="font-delius-swash-caps text-3xl text-gray-900">{value}</p>
        </div>
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

export default TeamTab;
