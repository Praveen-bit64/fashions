import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/admin/PageHeader';
import ProductForm from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
    });

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Products', href: '/admin/products' },
                    { label: 'New' },
                ]}
                eyebrow="Catalog"
                title="New Product"
                description="Add a new dress to the catalogue. Save as draft to keep it hidden, or publish to go live."
            />
            <ProductForm mode="create" categories={categories} />
        </>
    );
}
