import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { productsService } from '@/services/products.service';
import PageHeader from '@/components/admin/PageHeader';
import ProductForm, {
    type ProductFormInitial,
} from '@/components/admin/ProductForm';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Ctx) {
    const { id } = await params;
    const [product, categories] = await Promise.all([
        productsService.getById(id),
        prisma.category.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true },
        }),
    ]);

    if (!product) notFound();

    const initial: ProductFormInitial = {
        id: product.id,
        slug: product.slug,
        title: product.title,
        brand: product.brand,
        description: product.description ?? '',
        categoryId: product.categoryId,
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        status: product.status,
        isCustomizable: product.isCustomizable,
        isNewArrival: product.isNewArrival,
        isBestSeller: product.isBestSeller,
        media: product.media.map((m) => ({
            url: m.url,
            publicId: m.publicId,
            alt: m.alt,
        })),
        variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            priceDelta: v.priceDelta,
            stockQty: v.stockQty,
        })),
    };

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Products', href: '/admin/products' },
                    { label: product.title },
                ]}
                eyebrow={`Editing · ${product.brand}`}
                title={product.title}
                description={`Last updated ${product.updatedAt.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })}`}
            />
            <ProductForm
                mode="edit"
                initial={initial}
                categories={categories}
            />
        </>
    );
}
