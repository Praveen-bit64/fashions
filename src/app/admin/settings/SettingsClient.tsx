'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import type { Role } from '@prisma/client';
import ProfileTab from './tabs/ProfileTab';
import TeamTab from './tabs/TeamTab';
import SystemTab from './tabs/SystemTab';

export type ViewerProfile = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: Role;
    createdAt: string;
};

export type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: Role;
    phone: string | null;
    createdAt: string;
    deactivated: boolean;
    tailoringJobsCount: number;
};

export type SystemInfo = {
    aiProvider: string;
    cloudinaryConfigured: boolean;
    nextAuthSecretConfigured: boolean;
    databaseConfigured: boolean;
    nodeVersion: string;
    nodeEnv: string;
};

type ActiveTab = 'profile' | 'team' | 'system';

const TABS: { key: ActiveTab; label: string }[] = [
    { key: 'profile', label: 'My Profile' },
    { key: 'team', label: 'Team' },
    { key: 'system', label: 'System' },
];

type Props = {
    viewer: ViewerProfile;
    team: TeamMember[];
    system: SystemInfo;
    activeTab: ActiveTab;
};

const SettingsClient = ({ viewer, team, system, activeTab }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const switchTab = (next: ActiveTab) => {
        const params = new URLSearchParams(searchParams.toString());
        if (next === 'profile') params.delete('tab');
        else params.set('tab', next);
        const qs = params.toString();
        router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    };

    return (
        <>
            <Toaster />

            {/* Tabs */}
            <div className="border-b border-gray-100 mb-6 -mt-2">
                <div className="flex gap-1">
                    {TABS.map((t) => {
                        const active = t.key === activeTab;
                        return (
                            <button
                                key={t.key}
                                onClick={() => switchTab(t.key)}
                                className={`relative px-4 py-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase transition-colors ${active
                                    ? 'text-gray-900'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {t.label}
                                {active && (
                                    <motion.span
                                        layoutId="settings-tab-underline"
                                        className="absolute left-0 right-0 -bottom-px h-[2px] bg-gray-900"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeTab === 'profile' && <ProfileTab viewer={viewer} />}
            {activeTab === 'team' && (
                <TeamTab viewer={viewer} initial={team} />
            )}
            {activeTab === 'system' && <SystemTab info={system} />}

            {/* Footer helper */}
            <div className="mt-10 text-center">
                <Link
                    href="/admin"
                    className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </>
    );
};

export default SettingsClient;
