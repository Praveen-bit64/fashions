const KpiCard = ({
    label,
    value,
    delta,
    icon,
}: {
    label: string;
    value: string;
    delta?: { value: string; positive?: boolean };
    icon?: React.ReactNode;
}) => {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500">
                    {label}
                </p>
                {icon && <span className="text-gray-400">{icon}</span>}
            </div>
            <p className="mt-3 font-delius-swash-caps text-3xl text-gray-900 leading-none">
                {value}
            </p>
            {delta && (
                <p
                    className={`mt-2 text-xs font-inter font-medium ${delta.positive ? 'text-emerald-600' : 'text-red-600'
                        }`}
                >
                    {delta.positive ? '▲' : '▼'} {delta.value}
                </p>
            )}
        </div>
    );
};

export default KpiCard;
