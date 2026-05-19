import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Toaster } from 'react-hot-toast';
import { authOptions, isAdmin } from '@/lib/auth';
import Sidebar from '@/components/layout/admin/Sidebar';
import Topbar from '@/components/layout/admin/Topbar';

export const metadata = {
    title: 'Fashion · Admin',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) redirect('/sign-in?callbackUrl=/admin');
    if (!isAdmin(session.user.role)) redirect('/');

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Toaster />
            <Sidebar
                userName={session.user.name ?? 'Admin'}
                userRole={session.user.role}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar userName={session.user.name ?? 'Admin'} />
                <main className="flex-1 px-6 lg:px-8 py-8">{children}</main>
            </div>
        </div>
    );
}
