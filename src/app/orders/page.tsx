import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ordersService } from '@/services/orders.service';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Orders · Fashion' };

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect('/?signin=1');

    const orders = await ordersService.listForCustomer(session.user.id);

    return (
        <div className="min-h-screen bg-white">
            {/* Breadcrumb */}
            <nav className="max-w-5xl mx-auto px-4 pt-8 pb-2 flex items-center gap-2 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-400">
                <Link
                    href="/"
                    className="hover:text-gray-900 transition-colors"
                >
                    Home
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">My Orders</span>
            </nav>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 pt-6 pb-10 border-b border-gray-100">
                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                    Your Account
                </p>
                <h1 className="font-delius-swash-caps text-4xl md:text-5xl text-gray-900 leading-tight">
                    My Orders
                </h1>
                <p className="mt-3 text-sm font-inter text-gray-600">
                    {orders.length === 0
                        ? "You haven't placed any orders yet."
                        : `${orders.length} order${orders.length === 1 ? '' : 's'} placed.`}
                </p>
            </section>

            {/* Body */}
            <section className="max-w-5xl mx-auto px-4 py-10">
                {orders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
                        <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                            Your closet awaits
                        </p>
                        <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                            No orders yet
                        </h2>
                        <p className="text-sm font-inter text-gray-600 max-w-md mx-auto mb-6">
                            Browse the latest arrivals and your first order will live
                            here.
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                        >
                            Start Shopping
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {orders.map((o) => {
                            const firstItem = o.items[0];
                            return (
                                <li key={o.id}>
                                    <Link
                                        href={`/orders/${o.id}`}
                                        className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
                                    >
                                        {firstItem?.imageUrl ? (
                                            <div className="relative w-16 h-20 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={firstItem.imageUrl}
                                                    alt={firstItem.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-20 rounded-md bg-gray-100 flex-shrink-0" />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-inter font-semibold text-gray-900">
                                                    #{o.orderNumber}
                                                </p>
                                                <OrderStatusBadge status={o.status} />
                                            </div>
                                            <p className="text-xs font-inter text-gray-500 mt-0.5 truncate">
                                                {firstItem?.title ?? 'Custom piece'}
                                                {firstItem?.size
                                                    ? ` · ${firstItem.size}`
                                                    : ''}
                                                {firstItem?.color
                                                    ? ` · ${firstItem.color}`
                                                    : ''}
                                            </p>
                                            <p className="text-[11px] font-inter text-gray-400 mt-1">
                                                Placed{' '}
                                                {o.createdAt.toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-base font-inter font-semibold text-gray-900">
                                                {formatINR(o.total)}
                                            </p>
                                            <p className="text-[11px] font-inter text-gray-400 mt-1 flex items-center justify-end gap-1">
                                                View details
                                                <svg
                                                    className="w-3 h-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
