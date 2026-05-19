import Link from 'next/link';
import { notFound } from 'next/navigation';
import { customersService } from '@/services/customers.service';
import PageHeader from '@/components/admin/PageHeader';
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

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

export default async function AdminCustomerDetailPage({ params }: Ctx) {
    const { id } = await params;
    const customer = await customersService.getById(id);
    if (!customer) notFound();

    const measurementEntries = customer.measurement
        ? Object.entries(
            (customer.measurement.data ?? {}) as Record<string, unknown>
        ).filter(([, v]) => v !== null && v !== undefined && v !== '')
        : [];

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Customers', href: '/admin/customers' },
                    { label: customer.name },
                ]}
                eyebrow={`Joined ${formatDate(customer.createdAt)}`}
                title={customer.name}
                description={customer.email}
            />

            {/* Identity strip */}
            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 mb-6">
                <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-inter font-semibold tracking-wider flex-shrink-0">
                        {initials(customer.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="font-delius-swash-caps text-2xl text-gray-900">
                                {customer.name}
                            </h2>
                            {customer.emailVerified && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-inter font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Verified
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-inter text-gray-600">
                            {customer.email}
                        </p>
                        {customer.phone && (
                            <p className="text-sm font-inter text-gray-600">
                                {customer.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <MiniStat
                        label="Orders"
                        value={customer.stats.ordersCount.toLocaleString('en-IN')}
                    />
                    <MiniStat
                        label="Lifetime Value"
                        value={formatINR(customer.stats.lifetimeValue)}
                    />
                    <MiniStat
                        label="Avg Order"
                        value={
                            customer.stats.avgOrderValue > 0
                                ? formatINR(customer.stats.avgOrderValue)
                                : '—'
                        }
                    />
                    <MiniStat
                        label="Last Order"
                        value={formatDate(customer.stats.lastOrderAt)}
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                Order History ({customer.orders.length})
                            </h2>
                        </header>
                        {customer.orders.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-inter text-gray-500">
                                    This customer hasn&apos;t placed an order yet.
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {['Order', 'Items', 'Status', 'Payment', 'Total', 'Placed', ''].map(
                                            (label) => (
                                                <th
                                                    key={label}
                                                    className="px-5 py-3 text-left text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500"
                                                >
                                                    {label}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customer.orders.map((o) => (
                                        <tr
                                            key={o.id}
                                            className="hover:bg-gray-50/60 transition-colors"
                                        >
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/admin/orders/${o.id}`}
                                                    className="text-sm font-inter font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                                                >
                                                    #{o.orderNumber}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-inter text-gray-700">
                                                {o._count.items}
                                            </td>
                                            <td className="px-5 py-4">
                                                <OrderStatusBadge status={o.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                {o.payment ? (
                                                    <PaymentStatusBadge status={o.payment.status} />
                                                ) : (
                                                    <span className="text-[11px] text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                                {formatINR(o.total)}
                                            </td>
                                            <td className="px-5 py-4 text-[11px] font-inter text-gray-500">
                                                {formatDate(o.createdAt)}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/admin/orders/${o.id}`}
                                                    className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Addresses */}
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <header className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                Addresses ({customer.addresses.length})
                            </h2>
                        </header>
                        {customer.addresses.length === 0 ? (
                            <p className="px-5 py-6 text-sm font-inter text-gray-500">
                                No saved addresses.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {customer.addresses.map((a) => (
                                    <li key={a.id} className="px-5 py-4 text-sm font-inter">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {a.fullName}
                                            </p>
                                            {a.isDefault && (
                                                <span className="text-[9px] font-inter font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{a.phone}</p>
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            {a.line1}
                                            {a.line2 ? `, ${a.line2}` : ''}
                                            <br />
                                            {a.city}, {a.state} {a.postalCode}
                                            <br />
                                            {a.country}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    {/* Measurements */}
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <header className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                Measurements
                            </h2>
                            {customer.measurement && (
                                <span className="text-[10px] font-inter text-gray-400 uppercase tracking-wider">
                                    {customer.measurement.unit}
                                </span>
                            )}
                        </header>
                        {!customer.measurement || measurementEntries.length === 0 ? (
                            <p className="px-5 py-6 text-sm font-inter text-gray-500">
                                Customer hasn&apos;t submitted measurements yet.
                            </p>
                        ) : (
                            <dl className="divide-y divide-gray-100">
                                {measurementEntries.map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between px-5 py-2.5 text-sm font-inter"
                                    >
                                        <dt className="text-gray-500 capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </dt>
                                        <dd className="text-gray-900 font-medium">
                                            {String(value)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-1">
                {label}
            </p>
            <p className="text-lg font-inter font-semibold text-gray-900">
                {value}
            </p>
        </div>
    );
}
