import PageHeader from '@/components/admin/PageHeader';
import CouponForm, { EMPTY_COUPON } from '../CouponForm';

export const dynamic = 'force-dynamic';

export default function NewCouponPage() {
    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Coupons', href: '/admin/coupons' },
                    { label: 'New' },
                ]}
                eyebrow="New Promotion"
                title="Create Coupon"
                description="Set the code, discount, and any restrictions. Customers will be able to apply it at checkout once active."
            />
            <CouponForm initial={EMPTY_COUPON} mode="create" />
        </>
    );
}
