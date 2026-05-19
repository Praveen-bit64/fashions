import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { teamService } from '@/services/team.service';
import PageHeader from '@/components/admin/PageHeader';
import SettingsClient, { type SystemInfo, type TeamMember, type ViewerProfile } from './SettingsClient';

export const dynamic = 'force-dynamic';

const cloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

export default async function AdminSettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const { tab } = await searchParams;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect('/?signin=1');

    const [viewerRaw, teamRaw] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        }),
        teamService.listAll(),
    ]);

    if (!viewerRaw) redirect('/?signin=1');

    const viewer: ViewerProfile = {
        id: viewerRaw.id,
        name: viewerRaw.name,
        email: viewerRaw.email,
        phone: viewerRaw.phone,
        role: viewerRaw.role,
        createdAt: viewerRaw.createdAt.toISOString(),
    };

    const team: TeamMember[] = teamRaw.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        phone: m.phone,
        createdAt: m.createdAt.toISOString(),
        deactivated: Boolean(m.deletedAt),
        tailoringJobsCount: m._count.tailoringJobs,
    }));

    const system: SystemInfo = {
        aiProvider: (process.env.AI_PROVIDER ?? 'pollinations').toLowerCase(),
        cloudinaryConfigured,
        nextAuthSecretConfigured: Boolean(process.env.NEXTAUTH_SECRET),
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV ?? 'development',
    };

    const activeTab =
        tab === 'team' || tab === 'system' ? tab : 'profile';

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Settings' },
                ]}
                eyebrow="System"
                title="Settings"
                description="Your profile, team management, and system configuration."
            />

            <SettingsClient
                viewer={viewer}
                team={team}
                system={system}
                activeTab={activeTab}
            />
        </>
    );
}
