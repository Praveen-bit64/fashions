import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/admin/PageHeader';

export const dynamic = 'force-dynamic';

const formatINR = (paise: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise);

const statusColor: Record<string, string> = {
    PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DRAFT: 'bg-amber-50 text-amber-800 border-amber-200',
    ARCHIVED: 'bg-gray-100 text-gray-600 border-gray-200',
};

async function getProducts() {
    return prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            category: { select: { name: true } },
            media: { take: 1, orderBy: { position: 'asc' } },
            _count: { select: { variants: true } },
        },
    });
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Products' },
                ]}
                eyebrow="Catalog"
                title="Products"
                description="Manage the entire dress catalogue, variants, pricing and visibility."
                actions={
                    <Link
                        href="/admin/products/new"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
                    >
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Product
                    </Link>
                }
            />

            {products.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {[
                                    'Product',
                                    'Category',
                                    'Status',
                                    'Variants',
                                    'Price',
                                    'Updated',
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
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative w-12 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                {p.media[0]?.url ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={p.media[0].url}
                                                        alt={p.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            <circle cx="9" cy="9" r="2" />
                                                            <path d="M21 15l-5-5L5 21" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-inter font-semibold text-gray-900 truncate">
                                                    {p.title}
                                                </p>
                                                <p className="text-[11px] font-inter text-gray-500 truncate">
                                                    {p.brand}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-inter text-gray-700">
                                        {p.category.name}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span
                                            className={`px-2.5 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase rounded-sm border ${statusColor[p.status]
                                                }`}
                                        >
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-inter text-gray-700">
                                        {p._count.variants}
                                    </td>
                                    <td className="px-5 py-4 text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                        {p.discountPrice ? (
                                            <>
                                                {formatINR(p.discountPrice)}{' '}
                                                <span className="text-xs font-normal text-gray-400 line-through">
                                                    {formatINR(p.basePrice)}
                                                </span>
                                            </>
                                        ) : (
                                            formatINR(p.basePrice)
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-[11px] font-inter text-gray-500">
                                        {p.updatedAt.toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Link
                                            href={`/admin/products/${p.id}`}
                                            className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900"
                                        >
                                            Edit
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

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-gray-200 p-16 text-center bg-white">
            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                No products yet
            </p>
            <h2 className="font-delius-swash-caps text-3xl text-gray-900 mb-3">
                Start building your catalogue
            </h2>
            <p className="text-sm font-inter text-gray-600 max-w-md mx-auto mb-6">
                Add your first product to make it visible on the storefront. You can
                start with a draft and publish when ready.
            </p>
            <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase bg-gray-900 text-white rounded-md hover:bg-emerald-600 transition-colors"
            >
                Create First Product
            </Link>
        </div>
    );
}
