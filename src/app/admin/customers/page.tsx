import Link from 'next/link';
import { customersService } from '@/services/customers.service';
import PageHeader from '@/components/admin/PageHeader';

export const dynamic = 'force-dynamic';

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

const formatDate = (d: Date | null) =>
    d
        ? d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : '—';

const initials = (name: string) =>
    name
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

export default async function AdminCustomersPage() {
    const { items, total } = await customersService.listAll({ take: 100 });

    const newThisMonth = items.filter((u) => {
        const d = u.createdAt;
        const now = new Date();
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth()
        );
    }).length;

    const totalLifetimeValue = items.reduce((sum, u) => sum + u.lifetimeValue, 0);
    const repeatBuyers = items.filter((u) => u.ordersCount > 1).length;

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Customers' },
                ]}
                eyebrow="Operations"
                title="Customers"
                description="Every registered shopper — their order history, addresses, and measurements."
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat label="Total Customers" value={total.toLocaleString('en-IN')} />
                <Stat label="New This Month" value={newThisMonth.toLocaleString('en-IN')} />
                <Stat label="Repeat Buyers" value={repeatBuyers.toLocaleString('en-IN')} />
                <Stat label="Lifetime Value" value={formatINR(totalLifetimeValue)} />
            </div>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        Waiting on first shopper
                    </p>
                    <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                        No customers yet
                    </h2>
                    <p className="text-sm font-inter text-gray-600 max-w-md mx-auto">
                        Once someone signs up on the storefront, they&apos;ll show up here.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {[
                                    'Customer',
                                    'Contact',
                                    'Orders',
                                    'Lifetime Value',
                                    'Last Order',
                                    'Joined',
                                    '',
                                ].map((label) => (
                                    <th
                                        key={label}
                                        className="px-5 py-3 text-left text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500"
                                    >
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((c) => (
                                <tr
                                    key={c.id}
                                    className="hover:bg-gray-50/60 transition-colors"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-inter font-semibold tracking-wider flex-shrink-0">
                                                {initials(c.name)}
                                            </div>
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/admin/customers/${c.id}`}
                                                    className="text-sm font-inter font-semibold text-gray-900 hover:text-emerald-600 transition-colors truncate block"
                                                >
                                                    {c.name}
                                                </Link>
                                                <p className="text-[11px] font-inter text-gray-500">
                                                    {c.addressesCount} address
                                                    {c.addressesCount === 1 ? '' : 'es'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-inter text-gray-900 truncate">
                                            {c.email}
                                        </p>
                                        {c.phone && (
                                            <p className="text-[11px] font-inter text-gray-500">
                                                {c.phone}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {c.ordersCount > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-900 text-xs font-inter font-semibold">
                                                {c.ordersCount}
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                        {c.lifetimeValue > 0 ? (
                                            formatINR(c.lifetimeValue)
                                        ) : (
                                            <span className="text-gray-400 font-normal">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-[11px] font-inter text-gray-500">
                                        {formatDate(c.lastOrderAt)}
                                    </td>
                                    <td className="px-5 py-4 text-[11px] font-inter text-gray-500">
                                        {formatDate(c.createdAt)}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/customers/${c.id}`}
                                            className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900"
                                        >
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

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
