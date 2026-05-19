import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ordersService } from '@/services/orders.service';
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge';
import OrderTimeline from '@/components/orders/OrderTimeline';
import CustomerOrderActions from './CustomerOrderActions';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

export default async function CustomerOrderDetailPage({ params }: Ctx) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect('/?signin=1');

    const { id } = await params;
    const order = await ordersService.getById(id, {
        customerId: session.user.id,
    });
    if (!order) notFound();

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
                <Link
                    href="/orders"
                    className="hover:text-gray-900 transition-colors"
                >
                    My Orders
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">#{order.orderNumber}</span>
            </nav>

            {/* Hero */}
            <section className="max-w-5xl mx-auto px-4 pt-6 pb-10 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                            Order Placed{' '}
                            {order.createdAt.toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                        <h1 className="font-delius-swash-caps text-4xl md:text-5xl text-gray-900 leading-tight">
                            #{order.orderNumber}
                        </h1>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-4 py-10 space-y-6">
                {/* Timeline */}
                <OrderTimeline status={order.status} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Items */}
                        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <header className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                    Items ({order.items.length})
                                </h2>
                            </header>
                            <ul className="divide-y divide-gray-100">
                                {order.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center gap-4 px-6 py-4"
                                    >
                                        <div className="relative w-16 h-20 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                                            {item.imageUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : null}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500">
                                                {item.brand}
                                            </p>
                                            <p className="text-sm font-inter font-medium text-gray-900 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] font-inter text-gray-500 mt-0.5">
                                                {item.size} · {item.color} · Qty {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                            {formatINR(item.unitPrice * item.quantity)}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            {/* Totals */}
                            <div className="px-6 py-4 border-t border-gray-100 space-y-2 text-sm font-inter">
                                <Row label="Subtotal" value={formatINR(order.subtotal)} />
                                {order.discount > 0 && (
                                    <Row
                                        label={
                                            <span className="flex items-center gap-2">
                                                Discount
                                                {order.couponCode && (
                                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                        {order.couponCode}
                                                    </span>
                                                )}
                                            </span>
                                        }
                                        value={`-${formatINR(order.discount)}`}
                                        valueClass="text-emerald-600"
                                    />
                                )}
                                <Row
                                    label="Shipping"
                                    value={
                                        order.shipping === 0
                                            ? 'Free'
                                            : formatINR(order.shipping)
                                    }
                                />
                                <div className="h-px bg-gray-100 my-2" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gray-900">
                                        Total
                                    </span>
                                    <span className="text-xl font-inter font-semibold text-gray-900">
                                        {formatINR(order.total)}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Shipping address */}
                        {order.shippingAddress && (
                            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                                <header className="px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                        Shipping To
                                    </h2>
                                </header>
                                <div className="px-6 py-4 text-sm font-inter text-gray-700 leading-relaxed">
                                    <p className="font-semibold text-gray-900">
                                        {order.shippingAddress.fullName}
                                    </p>
                                    <p>{order.shippingAddress.phone}</p>
                                    <p className="mt-2">{order.shippingAddress.line1}</p>
                                    {order.shippingAddress.line2 && (
                                        <p>{order.shippingAddress.line2}</p>
                                    )}
                                    <p>
                                        {order.shippingAddress.city},{' '}
                                        {order.shippingAddress.state}{' '}
                                        {order.shippingAddress.postalCode}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment */}
                        {order.payment && (
                            <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mb-4">
                                    Payment
                                </h2>
                                <dl className="space-y-3 text-sm font-inter">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-500">Method</dt>
                                        <dd className="text-gray-900 font-medium">
                                            {order.payment.method}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-500">Status</dt>
                                        <dd>
                                            <PaymentStatusBadge
                                                status={order.payment.status}
                                            />
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-500">Amount</dt>
                                        <dd className="text-gray-900 font-semibold">
                                            {formatINR(order.payment.amount)}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        )}

                        {/* Actions */}
                        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                            <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mb-4">
                                Need Help?
                            </h2>
                            <div className="space-y-3">
                                <CustomerOrderActions
                                    orderId={order.id}
                                    status={order.status}
                                />
                                <a
                                    href="mailto:support@fashion.example"
                                    className="block w-full py-3 text-center text-[11px] font-inter font-semibold tracking-[0.25em] uppercase border border-gray-200 text-gray-900 rounded-md hover:border-gray-900 transition-colors"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </section>

                        {/* Tracking note */}
                        {(order.status === 'SHIPPED' ||
                            order.status === 'READY_TO_SHIP') && (
                                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                                    <p className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-emerald-700 mb-2">
                                        On the way
                                    </p>
                                    <p className="text-sm font-inter text-emerald-900 leading-relaxed">
                                        We'll email you a tracking link as soon as it's
                                        available.
                                    </p>
                                </section>
                            )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function Row({
    label,
    value,
    valueClass = '',
}: {
    label: React.ReactNode;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-gray-600">{label}</dt>
            <dd className={`text-gray-900 ${valueClass}`}>{value}</dd>
        </div>
    );
}
