'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';
import type {
    HeroData,
    PromoSpringData,
    PromoDenimData,
} from '@/lib/validation/cms';

type SectionRow = {
    id: string;
    key: string;
    active: boolean;
    label: string;
    description: string;
    editable: boolean;
};

type Tab = 'hero' | 'promo-spring' | 'promo-denim' | 'sections';

const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'hero', label: 'Hero' },
    { id: 'promo-spring', label: 'Spring Promo' },
    { id: 'promo-denim', label: 'Denim Promo' },
    { id: 'sections', label: 'Toggle Sections' },
];

const CmsClient = ({
    sections,
    heroId,
    heroData,
    promoSpringId,
    promoSpringData,
    promoDenimId,
    promoDenimData,
}: {
    sections: SectionRow[];
    heroId: string;
    heroData: HeroData;
    promoSpringId: string;
    promoSpringData: PromoSpringData;
    promoDenimId: string;
    promoDenimData: PromoDenimData;
}) => {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('hero');
    const [rows, setRows] = useState(sections);
    const [savingId, setSavingId] = useState<string | null>(null);

    const [hero, setHero] = useState<HeroData>(heroData);
    const [promoSpring, setPromoSpring] =
        useState<PromoSpringData>(promoSpringData);
    const [promoDenim, setPromoDenim] = useState<PromoDenimData>(promoDenimData);

    const [savingHero, setSavingHero] = useState(false);
    const [savingSpring, setSavingSpring] = useState(false);
    const [savingDenim, setSavingDenim] = useState(false);

    const saveSection = async (
        sectionId: string,
        data: unknown,
        setSaving: (s: boolean) => void,
        successMessage: string
    ) => {
        if (!sectionId) {
            toast.error('Section not found');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/v1/cms/sections/${sectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }),
            });
            const body = await res.json();
            if (!res.ok || !body.ok) {
                throw new Error(body?.error?.message ?? 'Save failed');
            }
            toast.success(successMessage);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = async (id: string, next: boolean) => {
        setSavingId(id);
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, active: next } : r))
        );
        try {
            const res = await fetch(`/api/v1/cms/sections/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: next }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Update failed');
            }
            toast.success(next ? 'Section enabled' : 'Section hidden');
            router.refresh();
        } catch (err) {
            setRows((prev) =>
                prev.map((r) => (r.id === id ? { ...r, active: !next } : r))
            );
            toast.error(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setSavingId(null);
        }
    };

    return (
        <>
            <Toaster />

            {/* Tabs */}
            <div className="relative flex items-center border-b border-gray-200 mb-8 overflow-x-auto">
                {TABS.map((t) => {
                    const active = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`relative whitespace-nowrap px-5 pb-3 text-[11px] font-inter font-semibold tracking-[0.25em] uppercase transition-colors ${active
                                ? 'text-gray-900'
                                : 'text-gray-400 hover:text-gray-700'
                                }`}
                        >
                            {t.label}
                            {active && (
                                <motion.span
                                    layoutId="cms-tab-underline"
                                    className="absolute -bottom-px left-3 right-3 h-[2px] bg-gray-900"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 320,
                                        damping: 28,
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
                <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto pb-3 text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Preview ↗
                </a>
            </div>

            {tab === 'hero' && (
                <HeroPanel
                    value={hero}
                    onChange={setHero}
                    onReset={() => setHero(heroData)}
                    onSave={() =>
                        saveSection(heroId, hero, setSavingHero, 'Hero updated')
                    }
                    saving={savingHero}
                />
            )}

            {tab === 'promo-spring' && (
                <PromoSpringPanel
                    value={promoSpring}
                    onChange={setPromoSpring}
                    onReset={() => setPromoSpring(promoSpringData)}
                    onSave={() =>
                        saveSection(
                            promoSpringId,
                            promoSpring,
                            setSavingSpring,
                            'Spring Promo updated'
                        )
                    }
                    saving={savingSpring}
                />
            )}

            {tab === 'promo-denim' && (
                <PromoDenimPanel
                    value={promoDenim}
                    onChange={setPromoDenim}
                    onReset={() => setPromoDenim(promoDenimData)}
                    onSave={() =>
                        saveSection(
                            promoDenimId,
                            promoDenim,
                            setSavingDenim,
                            'Denim Promo updated'
                        )
                    }
                    saving={savingDenim}
                />
            )}

            {tab === 'sections' && (
                <SectionsPanel
                    rows={rows}
                    savingId={savingId}
                    onToggle={toggleSection}
                />
            )}
        </>
    );
};

/* ─── Panels ──────────────────────────────────────────────────── */

function HeroPanel({
    value,
    onChange,
    onReset,
    onSave,
    saving,
}: {
    value: HeroData;
    onChange: (v: HeroData) => void;
    onReset: () => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <Card title="Hero Banner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ImageUploader
                    label="Background image"
                    value={value.backgroundImage}
                    onChange={(url) => onChange({ ...value, backgroundImage: url })}
                    aspect="16/9"
                    help="Used full-bleed behind the headline. 16:9 or wider works best."
                />

                <div className="space-y-4">
                    <Field
                        label="Eyebrow"
                        value={value.eyebrow}
                        onChange={(v) => onChange({ ...value, eyebrow: v })}
                    />
                    <Field
                        label="Title line 1"
                        value={value.titleLine1}
                        onChange={(v) => onChange({ ...value, titleLine1: v })}
                    />
                    <Field
                        label="Title line 2"
                        value={value.titleLine2}
                        onChange={(v) => onChange({ ...value, titleLine2: v })}
                        help="Rendered bolder than line 1."
                    />
                    <TextArea
                        label="Subtitle"
                        value={value.subtitle}
                        onChange={(v) => onChange({ ...value, subtitle: v })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                <Field
                    label="Primary CTA label"
                    value={value.primaryCtaLabel}
                    onChange={(v) => onChange({ ...value, primaryCtaLabel: v })}
                />
                <Field
                    label="Primary CTA URL"
                    value={value.primaryCtaHref}
                    onChange={(v) => onChange({ ...value, primaryCtaHref: v })}
                />
                <Field
                    label="Secondary CTA label"
                    value={value.secondaryCtaLabel}
                    onChange={(v) => onChange({ ...value, secondaryCtaLabel: v })}
                />
                <Field
                    label="Secondary CTA URL"
                    value={value.secondaryCtaHref}
                    onChange={(v) => onChange({ ...value, secondaryCtaHref: v })}
                />
            </div>

            <Footer onReset={onReset} onSave={onSave} saving={saving} />
        </Card>
    );
}

function PromoSpringPanel({
    value,
    onChange,
    onReset,
    onSave,
    saving,
}: {
    value: PromoSpringData;
    onChange: (v: PromoSpringData) => void;
    onReset: () => void;
    onSave: () => void;
    saving: boolean;
}) {
    const updateColumn = (
        idx: number,
        patch: Partial<PromoSpringData['columns'][number]>
    ) => {
        const next = [...value.columns];
        next[idx] = { ...next[idx], ...patch };
        onChange({ ...value, columns: next as PromoSpringData['columns'] });
    };

    return (
        <Card title="Spring Promo — 3-column showcase">
            <Field
                label="Section title"
                value={value.title}
                onChange={(v) => onChange({ ...value, title: v })}
            />
            <TextArea
                label="Section subtitle"
                value={value.subtitle}
                onChange={(v) => onChange({ ...value, subtitle: v })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-6 border-t border-gray-100">
                {value.columns.map((col, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50"
                    >
                        <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500">
                            Column {i + 1}
                        </p>
                        <ImageUploader
                            value={col.image}
                            onChange={(url) => updateColumn(i, { image: url })}
                            aspect="3/4"
                        />
                        <Field
                            label="Title"
                            value={col.title}
                            onChange={(v) => updateColumn(i, { title: v })}
                        />
                        <TextArea
                            label="Description"
                            value={col.description}
                            onChange={(v) => updateColumn(i, { description: v })}
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                <Field
                    label="CTA label"
                    value={value.ctaLabel}
                    onChange={(v) => onChange({ ...value, ctaLabel: v })}
                    help="Leave empty to hide the button."
                />
                <Field
                    label="CTA URL"
                    value={value.ctaHref}
                    onChange={(v) => onChange({ ...value, ctaHref: v })}
                />
            </div>

            <Footer onReset={onReset} onSave={onSave} saving={saving} />
        </Card>
    );
}

function PromoDenimPanel({
    value,
    onChange,
    onReset,
    onSave,
    saving,
}: {
    value: PromoDenimData;
    onChange: (v: PromoDenimData) => void;
    onReset: () => void;
    onSave: () => void;
    saving: boolean;
}) {
    const updateCard = (
        key: 'mainCard' | 'card2' | 'card3',
        patch: Partial<PromoDenimData['mainCard']>
    ) => {
        onChange({ ...value, [key]: { ...value[key], ...patch } });
    };

    return (
        <Card title="Denim Promo — main hero + two cards">
            <Field
                label="Section title"
                value={value.title}
                onChange={(v) => onChange({ ...value, title: v })}
            />
            <TextArea
                label="Section subtitle"
                value={value.subtitle}
                onChange={(v) => onChange({ ...value, subtitle: v })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-6 border-t border-gray-100">
                <div className="lg:col-span-2 rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50">
                    <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500">
                        Main Card
                    </p>
                    <ImageUploader
                        value={value.mainCard.image}
                        onChange={(url) => updateCard('mainCard', { image: url })}
                        aspect="16/9"
                    />
                    <Field
                        label="Title"
                        value={value.mainCard.title}
                        onChange={(v) => updateCard('mainCard', { title: v })}
                    />
                    <Field
                        label="Subtitle"
                        value={value.mainCard.subtitle}
                        onChange={(v) => updateCard('mainCard', { subtitle: v })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <Field
                            label="CTA label"
                            value={value.mainCard.ctaLabel}
                            onChange={(v) => updateCard('mainCard', { ctaLabel: v })}
                        />
                        <Field
                            label="CTA URL"
                            value={value.mainCard.ctaHref}
                            onChange={(v) => updateCard('mainCard', { ctaHref: v })}
                        />
                    </div>
                </div>

                <div className="space-y-5">
                    {(['card2', 'card3'] as const).map((key) => (
                        <div
                            key={key}
                            className="rounded-xl border border-gray-100 p-4 space-y-3 bg-gray-50/50"
                        >
                            <p className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-500">
                                {key === 'card2' ? 'Card 2' : 'Card 3'}
                            </p>
                            <ImageUploader
                                value={value[key].image}
                                onChange={(url) => updateCard(key, { image: url })}
                                aspect="square"
                            />
                            <Field
                                label="Title"
                                value={value[key].title}
                                onChange={(v) => updateCard(key, { title: v })}
                            />
                            <Field
                                label="Subtitle"
                                value={value[key].subtitle}
                                onChange={(v) => updateCard(key, { subtitle: v })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Field
                                    label="CTA label"
                                    value={value[key].ctaLabel}
                                    onChange={(v) =>
                                        updateCard(key, { ctaLabel: v })
                                    }
                                />
                                <Field
                                    label="CTA URL"
                                    value={value[key].ctaHref}
                                    onChange={(v) => updateCard(key, { ctaHref: v })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer onReset={onReset} onSave={onSave} saving={saving} />
        </Card>
    );
}

function SectionsPanel({
    rows,
    savingId,
    onToggle,
}: {
    rows: SectionRow[];
    savingId: string | null;
    onToggle: (id: string, next: boolean) => void;
}) {
    return (
        <Card title="Toggle sections on / off">
            <ul className="divide-y divide-gray-100">
                {rows.map((s) => (
                    <li
                        key={s.id}
                        className="flex items-start justify-between gap-3 py-4"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-inter font-semibold text-gray-900">
                                {s.label}
                            </p>
                            <p className="text-[11px] font-inter text-gray-500 mt-0.5 leading-tight">
                                {s.description}
                            </p>
                            <p className="text-[10px] font-inter font-medium tracking-widest uppercase text-gray-400 mt-1.5">
                                {s.editable ? 'Editable' : 'Toggle only'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onToggle(s.id, !s.active)}
                            disabled={savingId === s.id}
                            role="switch"
                            aria-checked={s.active}
                            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 mt-1 ${s.active ? 'bg-gray-900' : 'bg-gray-200'
                                } ${savingId === s.id ? 'opacity-50' : ''}`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.active ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

/* ─── Shared bits ─────────────────────────────────────────────── */

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
            <div className="p-6 space-y-4">{children}</div>
        </section>
    );
}

function Footer({
    onReset,
    onSave,
    saving,
}: {
    onReset: () => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
                type="button"
                onClick={onReset}
                className="text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-500 hover:text-gray-900"
            >
                Reset
            </button>
            <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className={`inline-flex items-center gap-2 px-6 py-3 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase rounded-md transition-colors ${saving
                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                    : 'bg-gray-900 text-white hover:bg-emerald-600'
                    }`}
            >
                {saving ? 'Saving…' : 'Save Changes'}
            </button>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    help,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    help?: string;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                {label}
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
            />
            {help && (
                <span className="text-[10px] font-inter text-gray-400 mt-1 block">
                    {help}
                </span>
            )}
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                {label}
            </span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-y"
            />
        </label>
    );
}

export default CmsClient;
