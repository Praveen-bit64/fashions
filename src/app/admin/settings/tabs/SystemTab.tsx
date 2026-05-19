'use client';

import type { SystemInfo } from '../SettingsClient';

const AI_PROVIDER_LABEL: Record<string, string> = {
    openai: 'OpenAI (DALL-E)',
    gemini: 'Google Gemini',
    pollinations: 'Pollinations.ai (free)',
};

const SystemTab = ({ info }: { info: SystemInfo }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card title="AI Configuration">
                    <Row
                        label="Provider"
                        value={
                            AI_PROVIDER_LABEL[info.aiProvider] ?? info.aiProvider
                        }
                        sub={`Set via AI_PROVIDER env var. Change in your deployment config and redeploy to switch providers.`}
                    />
                </Card>

                <Card title="Services & Secrets">
                    <Row
                        label="Database"
                        value={info.databaseConfigured ? 'Connected' : 'Missing'}
                        tone={info.databaseConfigured ? 'ok' : 'warn'}
                        sub="Postgres connection via DATABASE_URL"
                    />
                    <Row
                        label="NextAuth Secret"
                        value={info.nextAuthSecretConfigured ? 'Configured' : 'Missing'}
                        tone={info.nextAuthSecretConfigured ? 'ok' : 'warn'}
                        sub="Used to sign session JWTs (NEXTAUTH_SECRET)"
                    />
                    <Row
                        label="Cloudinary"
                        value={info.cloudinaryConfigured ? 'Configured' : 'Not configured'}
                        tone={info.cloudinaryConfigured ? 'ok' : 'warn'}
                        sub="Required for product, CMS, and AI image uploads"
                    />
                </Card>
            </div>

            <div className="space-y-6 lg:sticky lg:top-[100px] lg:self-start">
                <Card title="Runtime">
                    <Row label="Node" value={info.nodeVersion} mono />
                    <Row
                        label="Environment"
                        value={info.nodeEnv}
                        tone={info.nodeEnv === 'production' ? 'ok' : 'neutral'}
                    />
                </Card>

                <div className="rounded-2xl border border-dashed border-gray-200 p-5">
                    <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500 mb-2">
                        Need to change a setting?
                    </p>
                    <p className="text-[12px] font-inter text-gray-600 leading-relaxed">
                        Service credentials and AI provider are configured via environment
                        variables in <span className="font-mono">.env.local</span>. Changes
                        require a server restart to take effect.
                    </p>
                </div>
            </div>
        </div>
    );
};

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <header className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    {title}
                </h2>
            </header>
            <div className="divide-y divide-gray-100">{children}</div>
        </section>
    );
}

function Row({
    label,
    value,
    sub,
    tone = 'neutral',
    mono = false,
}: {
    label: string;
    value: string;
    sub?: string;
    tone?: 'ok' | 'warn' | 'neutral';
    mono?: boolean;
}) {
    const dot =
        tone === 'ok'
            ? 'bg-emerald-500'
            : tone === 'warn'
                ? 'bg-amber-500'
                : 'bg-gray-300';
    return (
        <div className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
                <p className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500 mb-1">
                    {label}
                </p>
                {sub && (
                    <p className="text-[11px] font-inter text-gray-500">{sub}</p>
                )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {tone !== 'neutral' && (
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                )}
                <span
                    className={`text-sm text-gray-900 ${mono ? 'font-mono' : 'font-inter font-semibold'
                        }`}
                >
                    {value}
                </span>
            </div>
        </div>
    );
}

export default SystemTab;
