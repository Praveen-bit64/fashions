import { tailoringService } from '@/services/tailoring.service';
import PageHeader from '@/components/admin/PageHeader';
import TailoringBoard from './TailoringBoard';

export const dynamic = 'force-dynamic';

export default async function AdminTailoringPage() {
    const raw = await tailoringService.list();

    const jobs = raw.map((j) => ({
        id: j.id,
        status: j.status,
        orderId: j.order.id,
        orderNumber: j.order.orderNumber,
        orderTotal: j.order.total,
        orderPlacedAt: j.order.createdAt.toISOString(),
        customerName: j.order.customer.name,
        customerEmail: j.order.customer.email,
        itemTitle: j.order.items[0]?.title ?? 'Custom piece',
        itemImage: j.order.items[0]?.imageUrl ?? null,
        itemQuantity: j.order.items.reduce(
            (sum, i) => sum + i.quantity,
            0
        ),
        assignedToName: j.assignedTo?.name ?? null,
        updatedAt: j.updatedAt.toISOString(),
    }));

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'Tailoring' },
                ]}
                eyebrow="Operations"
                title="Tailoring Workflow"
                description="Production pipeline — drag every order through Measurement → Cutting → Stitching → Finishing → QC → Dispatch."
            />
            <TailoringBoard initial={jobs} />
        </>
    );
}
