const ComingSoon = ({ area }: { area: string }) => {
    return (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center bg-white">
            <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                Coming Soon
            </p>
            <h2 className="font-delius-swash-caps text-2xl text-gray-900 mb-2">
                {area} module under construction
            </h2>
            <p className="text-sm font-inter text-gray-500 max-w-md mx-auto">
                This admin area is scaffolded. The full CRUD experience will land in
                upcoming phases.
            </p>
        </div>
    );
};

export default ComingSoon;
