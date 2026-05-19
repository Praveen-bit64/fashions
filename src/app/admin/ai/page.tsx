import Link from 'next/link';
import { aiCustomizationsService } from '@/services/aiCustomizations.service';
import PageHeader from '@/components/admin/PageHeader';
import AiGenerationsGrid, { type GenerationItem } from './AiGenerationsGrid';

export const dynamic = 'force-dynamic';

const ANON_LIFETIME_QUOTA = Number(process.env.ANON_LIFETIME_QUOTA ?? 2);
const USER_DAILY_QUOTA = Number(process.env.USER_DAILY_QUOTA ?? 10);

const PROVIDER_LABEL: Record<string, string> = {
    openai: 'OpenAI (DALL-E)',
    gemini: 'Google Gemini',
    pollinations: 'Pollinations.ai',
};

const formatDate = (d: Date | null) =>
    d
        ? d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : '—';

type SearchParams = Promise<{ provider?: string }>;

export default async function AdminAiPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const { provider } = await searchParams;

    const [stats, recent, topProducts, topConsumers] = await Promise.all([
        aiCustomizationsService.stats(),
        aiCustomizationsService.listRecent({
            take: 60,
            provider: provider || undefined,
        }),
        aiCustomizationsService.topProducts(5),
        aiCustomizationsService.topQuotaConsumers(10),
    ]);

    const conversionRate =
        stats.total > 0
            ? Math.round((stats.conversions / stats.total) * 100)
            : 0;
    const topProvider = stats.byProvider[0]?.provider ?? '—';
    const activeProvider = (process.env.AI_PROVIDER ?? 'pollinations').toLowerCase();

    const generations: GenerationItem[] = recent.map((g) => ({
        id: g.id,
        provider: g.provider,
        generatedUrl: g.generatedUrl,
        bodyImageUrl: g.bodyImageUrl,
        faceImageUrl: g.faceImageUrl,
        config: g.config,
        convertedToOrderId: g.convertedToOrderId,
        createdAt: g.createdAt.toISOString(),
        product: g.product
            ? {
                id: g.product.id,
                slug: g.product.slug,
                title: g.product.title,
                image: g.product.media[0]?.url ?? null,
            }
            : null,
    }));

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: 'Admin', href: '/admin' },
                    { label: 'AI' },
                ]}
                eyebrow="Engagement"
                title="AI Customizations"
                description="Every generation customers have made, the provider serving them, and quota usage."
            />

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Stat label="Total Generations" value={stats.total.toLocaleString('en-IN')} />
                <Stat label="Today" value={stats.today.toLocaleString('en-IN')} />
                <Stat label="Last 7 Days" value={stats.thisWeek.toLocaleString('en-IN')} />
                <Stat
                    label="Converted to Orders"
                    value={`${stats.conversions} · ${conversionRate}%`}
                    sub={conversionRate >= 10 ? 'Healthy' : 'Watch'}
                    tone={conversionRate >= 10 ? 'ok' : 'warn'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Provider config */}
                <Card title="Active Provider">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-inter text-gray-500">
                            Set via{' '}
                            <span className="font-mono text-[12px] text-gray-700">
                                AI_PROVIDER
                            </span>
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-inter font-semibold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Live
                        </span>
                    </div>
                    <p className="font-delius-swash-caps text-2xl text-gray-900 mb-1">
                        {PROVIDER_LABEL[activeProvider] ?? activeProvider}
                    </p>
                    <p className="text-[11px] font-inter text-gray-500">
                        Most-used historically:{' '}
                        <span className="text-gray-900 font-semibold">
                            {PROVIDER_LABEL[topProvider] ?? topProvider}
                        </span>
                    </p>
                </Card>

                {/* Quota config */}
                <Card title="Quota Limits">
                    <Row label="Anonymous (lifetime)" value={`${ANON_LIFETIME_QUOTA} generations`} />
                    <Row label="Signed-in (daily)" value={`${USER_DAILY_QUOTA} per 24h`} />
                    <p className="text-[11px] font-inter text-gray-500 mt-3">
                        Adjust via{' '}
                        <span className="font-mono text-[11px]">ANON_LIFETIME_QUOTA</span> and{' '}
                        <span className="font-mono text-[11px]">USER_DAILY_QUOTA</span>.
                    </p>
                </Card>

                {/* Provider breakdown */}
                <Card title="Provider Mix">
                    {stats.byProvider.length === 0 ? (
                        <p className="text-sm font-inter text-gray-500">
                            No generations yet.
                        </p>
                    ) : (
                        <ul className="space-y-2.5">
                            {stats.byProvider.map((p) => {
                                const pct =
                                    stats.total > 0
                                        ? Math.round((p.count / stats.total) * 100)
                                        : 0;
                                return (
                                    <li key={p.provider}>
                                        <div className="flex items-center justify-between text-[12px] font-inter mb-1">
                                            <span className="text-gray-900 font-semibold">
                                                {PROVIDER_LABEL[p.provider] ?? p.provider}
                                            </span>
                                            <span className="text-gray-500">
                                                {p.count.toLocaleString('en-IN')} · {pct}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className="h-full bg-gray-900"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Top products */}
                <Card title="Most Customized Products" className="lg:col-span-2">
                    {topProducts.length === 0 ? (
                        <p className="text-sm font-inter text-gray-500">
                            No data yet.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {topProducts.map(({ product, count }) => (
                                <li
                                    key={product.id}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-10 h-12 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                                        {product.media[0]?.url && (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={product.media[0].url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${product.slug}`}
                                            target="_blank"
                                            className="text-sm font-inter font-semibold text-gray-900 hover:text-emerald-600 transition-colors truncate block"
                                        >
                                            {product.title}
                                        </Link>
                                    </div>
                                    <span className="text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                                        {count.toLocaleString('en-IN')} gen
                                        {count === 1 ? '' : 's'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                {/* Top consumers */}
                <Card title="Top Consumers">
                    {topConsumers.length === 0 ? (
                        <p className="text-sm font-inter text-gray-500">
                            No quota usage yet.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {topConsumers.slice(0, 6).map((c, idx) => (
                                <li
                                    key={`${c.kind}-${c.sub}-${idx}`}
                                    className="flex items-center gap-3"
                                >
                                    <span
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-inter font-semibold ${c.kind === 'user'
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {c.kind === 'user'
                                            ? c.label
                                                .split(' ')
                                                .map((s) => s[0])
                                                .slice(0, 2)
                                                .join('')
                                                .toUpperCase()
                                            : '·'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-inter font-semibold text-gray-900 truncate">
                                            {c.label}
                                        </p>
                                        <p className="text-[10px] font-inter text-gray-500 truncate">
                                            {c.sub}
                                        </p>
                                    </div>
                                    <span className="text-sm font-inter font-semibold text-gray-900">
                                        {c.usedCount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            {/* Recent generations grid */}
            <AiGenerationsGrid
                generations={generations}
                allProviders={stats.byProvider.map((p) => p.provider)}
                activeProviderFilter={provider ?? null}
            />

            <p className="mt-6 text-[10px] font-inter text-gray-400 text-center">
                Showing the most recent {generations.length} generations. Last sync{' '}
                {formatDate(new Date())}.
            </p>
        </>
    );
}

function Stat({
    label,
    value,
    sub,
    tone,
}: {
    label: string;
    value: string;
    sub?: string;
    tone?: 'ok' | 'warn';
}) {
    const subTone =
        tone === 'ok'
            ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
            : tone === 'warn'
                ? 'text-amber-800 bg-amber-50 border-amber-100'
                : 'text-gray-500 bg-gray-50 border-gray-100';
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                {label}
            </p>
            <p className="font-delius-swash-caps text-3xl text-gray-900">{value}</p>
            {sub && (
                <p
                    className={`text-[10px] font-inter font-semibold tracking-widest uppercase border px-2 py-0.5 rounded inline-block mt-2 ${subTone}`}
                >
                    {sub}
                </p>
            )}
        </div>
    );
}

function Card({
    title,
    children,
    className = '',
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section
            className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${className}`}
        >
            <header className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    {title}
                </h2>
            </header>
            <div className="p-5">{children}</div>
        </section>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 text-sm font-inter">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-semibold">{value}</span>
        </div>
    );
}
