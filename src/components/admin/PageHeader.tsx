import Link from 'next/link';

type Breadcrumb = { label: string; href?: string };

const PageHeader = ({
    eyebrow,
    title,
    description,
    breadcrumbs,
    actions,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
}) => {
    return (
        <div className="mb-8">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-400 mb-4">
                    {breadcrumbs.map((crumb, i) => {
                        const last = i === breadcrumbs.length - 1;
                        return (
                            <span key={crumb.label} className="flex items-center gap-2">
                                {crumb.href && !last ? (
                                    <Link
                                        href={crumb.href}
                                        className="hover:text-gray-900 transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span
                                        className={last ? 'text-gray-900' : 'text-gray-400'}
                                    >
                                        {crumb.label}
                                    </span>
                                )}
                                {!last && <span className="text-gray-300">/</span>}
                            </span>
                        );
                    })}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    {eyebrow && (
                        <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="font-delius-swash-caps text-3xl md:text-4xl text-gray-900 leading-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 text-sm font-inter text-gray-600 max-w-xl">
                            {description}
                        </p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
