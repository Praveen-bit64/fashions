import type { TailoringStatus } from '@prisma/client';

/**
 * Forward-only with one exception: QC can bounce back to STITCHING for re-work.
 */
export const TAILORING_TRANSITIONS: Record<TailoringStatus, TailoringStatus[]> = {
    PENDING: ['MEASUREMENT_RECEIVED'],
    MEASUREMENT_RECEIVED: ['CUTTING'],
    CUTTING: ['STITCHING'],
    STITCHING: ['FINISHING'],
    FINISHING: ['QC'],
    QC: ['STITCHING', 'DISPATCHED'], // bounce back if QC fails
    DISPATCHED: [],
};

export function canTransition(
    from: TailoringStatus,
    to: TailoringStatus
): boolean {
    return TAILORING_TRANSITIONS[from].includes(to);
}

export const TAILORING_STATUS_LABEL: Record<TailoringStatus, string> = {
    PENDING: 'Pending',
    MEASUREMENT_RECEIVED: 'Measurement',
    CUTTING: 'Cutting',
    STITCHING: 'Stitching',
    FINISHING: 'Finishing',
    QC: 'QC',
    DISPATCHED: 'Dispatched',
};

/** Order of columns on the kanban (left → right) */
export const TAILORING_PIPELINE: TailoringStatus[] = [
    'PENDING',
    'MEASUREMENT_RECEIVED',
    'CUTTING',
    'STITCHING',
    'FINISHING',
    'QC',
    'DISPATCHED',
];

/**
 * Timestamp column to stamp when entering each status.
 */
export const TAILORING_TIMESTAMP_FIELD: Partial<
    Record<TailoringStatus, string>
> = {
    MEASUREMENT_RECEIVED: 'measurementsAt',
    CUTTING: 'cuttingAt',
    STITCHING: 'stitchingAt',
    FINISHING: 'finishingAt',
    QC: 'qcAt',
    DISPATCHED: 'dispatchAt',
};
