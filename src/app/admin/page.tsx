import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/admin/PageHeader';
import KpiCard from '@/components/admin/KpiCard';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
        productCount,
        publishedCount,
        customerCount,
        orderCount,
        recentOrders,
        pendingTailoring,
        revenueAggregate,
    ] = await Promise.all([
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.product.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
        prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
        prisma.order.count(),
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                orderNumber: true,
                total: true,
                status: true,
                createdAt: true,
                customer: { select: { name: true, email: true } },
            },
        }),
        prisma.tailoringJob.count({
            where: { status: { not: 'DISPATCHED' } },
        }),
        prisma.order.aggregate({
            _sum: { total: true },
            where: {
                createdAt: { gte: since30d },
                status: { notIn: ['CANCELLED', 'RETURNED'] },
            },
        }),
    ]);

    return {
        productCount,
        publishedCount,
        customerCount,
        orderCount,
        recentOrders,
        pendingTailoring,
        revenueLast30d: revenueAggregate._sum.total ?? 0,
    };
}

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-50 text-blue-800 border-blue-200',
    IN_PRODUCTION: 'bg-purple-50 text-purple-800 border-purple-200',
    READY_TO_SHIP: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    SHIPPED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    DELIVERED: 'bg-gray-100 text-gray-800 border-gray-200',
    CANCELLED: 'bg-red-50 text-red-800 border-red-200',
    RETURNED: 'bg-red-50 text-red-800 border-red-200',
};

export default async function AdminDashboardPage() {
    const data = await getDashboardData();

    return (
        <>
            <PageHeader
                eyebrow="Command Center"
                title="Dashboard"
                description="Snapshot of revenue, orders, customers, and active tailoring jobs."
            />

            {/* KPIs */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <KpiCard
                    label="Revenue (30d)"
                    value={formatINR(data.revenueLast30d)}
                    delta={{ value: 'vs prev period', positive: true }}
                />
                <KpiCard label="Total Orders" value={data.orderCount.toLocaleString()} />
                <KpiCard
                    label="Active Customers"
                    value={data.customerCount.toLocaleString()}
                />
                <KpiCard
                    label="Tailoring In Flight"
                    value={data.pendingTailoring.toLocaleString()}
                />
            </section>

            {/* Two-up */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent orders */}
                <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                        <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                            Recent Orders
                        </h2>
                        <a
                            href="/admin/orders"
                            className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900"
                        >
                            View all →
                        </a>
                    </div>
                    {data.recentOrders.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm font-inter text-gray-500">
                            No orders yet. They'll appear here as customers check out.
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {data.recentOrders.map((o) => (
                                <li
                                    key={o.id}
                                    className="flex items-center justify-between gap-4 px-6 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-inter font-semibold text-gray-900 truncate">
                                            #{o.orderNumber}
                                        </p>
                                        <p className="text-xs font-inter text-gray-500 truncate">
                                            {o.customer.name} · {o.customer.email}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-2.5 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase rounded-sm border ${statusColor[o.status] ??
                                            'bg-gray-50 text-gray-700 border-gray-200'
                                            }`}
                                    >
                                        {o.status.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                        {formatINR(o.total)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Catalog snapshot */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                            Catalog
                        </h2>
                    </div>
                    <dl className="px-6 py-5 space-y-4 text-sm font-inter">
                        <Row label="Total products" value={data.productCount} />
                        <Row label="Published" value={data.publishedCount} />
                        <Row
                            label="Drafts"
                            value={data.productCount - data.publishedCount}
                        />
                    </dl>
                    <div className="px-6 pb-5">
                        <a
                            href="/admin/products"
                            className="inline-flex items-center justify-center w-full py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                        >
                            Manage Products
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}

function Row({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-gray-600">{label}</dt>
            <dd className="font-inter font-semibold text-gray-900">{value}</dd>
        </div>
    );
}
