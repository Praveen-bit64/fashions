import { notFound } from 'next/navigation';
import { couponsService } from '@/services/coupons.service';
import PageHeader from '@/components/admin/PageHeader';
import CouponForm from '../CouponForm';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const toDateInput = (d: Date | null): string | null =>
    d ? d.toISOString().slice(0, 10) : null;

export default async function EditCouponPage({ params }: Ctx) {
    const { id } = await params;
    const coupon = await couponsService.getById(id);
    if (!coupon) notFound();

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Coupons', href: '/admin/coupons' },
                    { label: coupon.code },
                ]}
                eyebrow={`Used ${coupon.usedCount} time${coupon.usedCount === 1 ? '' : 's'}`}
                title={coupon.code}
                description="Edit discount value, rules, and validity window. Code is immutable."
            />
            <CouponForm
                mode="edit"
                initial={{
                    id: coupon.id,
                    code: coupon.code,
                    type: coupon.type,
                    value: coupon.value,
                    minSubtotal: coupon.minSubtotal,
                    validFrom: toDateInput(coupon.validFrom),
                    validUntil: toDateInput(coupon.validUntil),
                    usageLimit: coupon.usageLimit,
                    active: coupon.active,
                }}
            />
        </>
    );
}
