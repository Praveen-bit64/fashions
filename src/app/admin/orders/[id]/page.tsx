import { notFound } from 'next/navigation';
import { ordersService } from '@/services/orders.service';
import PageHeader from '@/components/admin/PageHeader';
import {
    OrderStatusBadge,
    PaymentStatusBadge,
} from '@/components/admin/OrderStatusBadge';
import OrderStatusActions from './OrderStatusActions';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

export default async function AdminOrderDetailPage({ params }: Ctx) {
    const { id } = await params;
    const order = await ordersService.getById(id);
    if (!order) notFound();

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Orders', href: '/admin/orders' },
                    { label: `#${order.orderNumber}` },
                ]}
                eyebrow={`Placed ${order.createdAt.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}`}
                title={`Order #${order.orderNumber}`}
                description={`Customer: ${order.customer.name} · ${order.customer.email}`}
                actions={<OrderStatusBadge status={order.status} />}
            />

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
                                <li key={item.id} className="flex items-center gap-4 px-6 py-4">
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

                    {/* Customer notes */}
                    {order.notes && (
                        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <header className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                    Customer Notes
                                </h2>
                            </header>
                            <p className="px-6 py-4 text-sm font-inter text-gray-700 whitespace-pre-line">
                                {order.notes}
                            </p>
                        </section>
                    )}

                    {/* Shipping address */}
                    {order.shippingAddress && (
                        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <header className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                                    Shipping Address
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
                                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
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
                                        <PaymentStatusBadge status={order.payment.status} />
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Amount</dt>
                                    <dd className="text-gray-900 font-semibold">
                                        {formatINR(order.payment.amount)}
                                    </dd>
                                </div>
                                {order.payment.paidAt && (
                                    <div className="flex items-center justify-between">
                                        <dt className="text-gray-500">Paid</dt>
                                        <dd className="text-gray-700 text-xs">
                                            {order.payment.paidAt.toLocaleString('en-IN')}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </section>
                    )}

                    {/* Customer */}
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                        <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mb-4">
                            Customer
                        </h2>
                        <p className="text-sm font-inter font-semibold text-gray-900">
                            {order.customer.name}
                        </p>
                        <p className="text-xs font-inter text-gray-500 mt-0.5">
                            {order.customer.email}
                        </p>
                        {order.customer.phone && (
                            <p className="text-xs font-inter text-gray-500">
                                {order.customer.phone}
                            </p>
                        )}
                    </section>

                    {/* Status actions */}
                    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
                        <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mb-4">
                            Actions
                        </h2>
                        <OrderStatusActions
                            orderId={order.id}
                            currentStatus={order.status}
                        />
                    </section>
                </div>
            </div>
        </>
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
