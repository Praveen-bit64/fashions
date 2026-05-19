import Link from 'next/link';
import { ordersService } from '@/services/orders.service';
import PageHeader from '@/components/admin/PageHeader';
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge';

export const dynamic = 'force-dynamic';

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

export default async function AdminOrdersPage() {
    const { items } = await ordersService.listAll({ take: 100 });

    return (
        <>
            <PageHeader
                breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Orders' }]}
                eyebrow="Operations"
                title="Orders"
                description="View, fulfil, and track every order placed on the storefront."
            />

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        Quiet so far
                    </p>
                    <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                        No orders yet
                    </h2>
                    <p className="text-sm font-inter text-gray-600 max-w-md mx-auto">
                        New orders placed on the storefront will appear here in real time.
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {[
                                    'Order',
                                    'Customer',
                                    'Items',
                                    'Status',
                                    'Payment',
                                    'Total',
                                    'Placed',
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
                            {items.map((o) => (
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
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-inter text-gray-900 truncate">
                                            {o.customer.name}
                                        </p>
                                        <p className="text-[11px] font-inter text-gray-500 truncate">
                                            {o.customer.email}
                                        </p>
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
                                        {o.createdAt.toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
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
                </div>
            )}
        </>
    );
}
