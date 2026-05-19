import type { TailoringStatus } from '@prisma/client';
import { TAILORING_STATUS_LABEL } from '@/features/tailoring/state-machine';

const COLORS: Record<TailoringStatus, string> = {
    PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
    MEASUREMENT_RECEIVED: 'bg-blue-50 text-blue-800 border-blue-200',
    CUTTING: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
    STITCHING: 'bg-purple-50 text-purple-800 border-purple-200',
    FINISHING: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    QC: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    DISPATCHED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export default function TailoringStatusBadge({
    status,
}: {
    status: TailoringStatus;
}) {
    return (
        <span
            className={`inline-block px-2.5 py-1 text-[10px] font-inter font-semibold tracking-widest uppercase rounded-sm border ${COLORS[status]}`}
        >
            {TAILORING_STATUS_LABEL[status]}
        </span>
    );
}
