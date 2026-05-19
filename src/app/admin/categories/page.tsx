import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/admin/PageHeader';
import CategoriesClient from './CategoriesClient';

export const dynamic = 'force-dynamic';

async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
    });
}

export default async function AdminCategoriesPage() {
    const categories = await getCategories();
    const serialised = categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        productCount: c._count.products,
    }));

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Categories' },
                ]}
                eyebrow="Catalog"
                title="Categories"
                description="Top-level groupings for your catalogue. Products must belong to a category."
            />
            <CategoriesClient initial={serialised} />
        </>
    );
}
