'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearCart, lineKey } from '@/redux/slices/cartSlice';

type Delivery = 'standard' | 'express';
type Payment = 'cod' | 'upi' | 'card';

type FormState = {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    delivery: Delivery;
    payment: Payment;
    cardNumber: string;
    cardName: string;
    cardExpiry: string;
    cardCvv: string;
    upiId: string;
    promoCode: string;
    notes: string;
};

const INITIAL: FormState = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    delivery: 'standard',
    payment: 'cod',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
    promoCode: '',
    notes: '',
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const formatCardNumber = (raw: string) =>
    raw
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(.{4})/g, '$1 ')
        .trim();

const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const CheckoutPage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const cartItems = useAppSelector((s) => s.cart.items);
    const user = useAppSelector((s) => s.auth.user);

    const [form, setForm] = useState<FormState>({
        ...INITIAL,
        email: user?.name ? `${user.name.toLowerCase().replace(/\s+/g, '.')}@example.com` : '',
        firstName: user?.name?.split(' ')[0] ?? '',
        lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string;
        discount: number;
    } | null>(null);
    const [promoBusy, setPromoBusy] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
        setForm((p) => ({ ...p, [k]: v }));
        if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    };

    const subtotal = useMemo(
        () =>
            cartItems.reduce(
                (sum, i) =>
                    sum + (i.discountedPrice ?? i.originalPrice) * i.quantity,
                0
            ),
        [cartItems]
    );

    const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

    const shipping = useMemo(() => {
        if (form.delivery === 'express') return 199;
        return subtotal >= 999 ? 0 : 99;
    }, [form.delivery, subtotal]);

    // The applied discount comes from the server (/api/v1/coupons/validate).
    // We cap it by the current subtotal in case the cart shrank after applying.
    const discount = appliedPromo
        ? Math.min(appliedPromo.discount, subtotal)
        : 0;

    const total = Math.max(0, subtotal - discount + shipping);

    const applyPromo = async () => {
        const code = form.promoCode.trim().toUpperCase();
        if (!code) return;
        if (!user) {
            toast.error('Please sign in to apply a coupon');
            return;
        }
        setPromoBusy(true);
        try {
            const res = await fetch('/api/v1/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal }),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Invalid promo code');
            }
            setAppliedPromo({ code: data.data.code, discount: data.data.discount });
            toast.success(`Promo applied: ${data.data.code}`);
        } catch (err) {
            setAppliedPromo(null);
            toast.error(err instanceof Error ? err.message : 'Invalid promo code');
        } finally {
            setPromoBusy(false);
        }
    };

    const removePromo = () => {
        setAppliedPromo(null);
        set('promoCode', '');
    };

    const validate = (): boolean => {
        const next: Partial<Record<keyof FormState, string>> = {};
        if (!form.email.trim()) next.email = 'Required';
        else if (!isEmail(form.email)) next.email = 'Invalid email';
        if (!form.firstName.trim()) next.firstName = 'Required';
        if (!form.lastName.trim()) next.lastName = 'Required';
        if (!form.phone.trim()) next.phone = 'Required';
        else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '')))
            next.phone = 'Enter 10 digits';
        if (!form.address1.trim()) next.address1 = 'Required';
        if (!form.city.trim()) next.city = 'Required';
        if (!form.state.trim()) next.state = 'Required';
        if (!form.postalCode.trim()) next.postalCode = 'Required';
        else if (!/^\d{6}$/.test(form.postalCode))
            next.postalCode = 'Enter 6 digits';

        if (form.payment === 'card') {
            if (form.cardNumber.replace(/\s/g, '').length !== 16)
                next.cardNumber = 'Enter 16 digits';
            if (!form.cardName.trim()) next.cardName = 'Required';
            if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry))
                next.cardExpiry = 'MM/YY';
            if (!/^\d{3,4}$/.test(form.cardCvv)) next.cardCvv = 'Invalid CVV';
        }
        if (form.payment === 'upi') {
            if (!/^[\w.\-]+@[\w]+$/.test(form.upiId))
                next.upiId = 'e.g. name@bank';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const placeOrder = async () => {
        if (!validate()) {
            toast.error('Please fix the errors above');
            return;
        }
        if (!user) {
            toast.error('Please sign in to place an order');
            router.push('/');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                email: form.email,
                items: cartItems.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                })),
                shipping: {
                    fullName: `${form.firstName} ${form.lastName}`.trim(),
                    phone: form.phone,
                    line1: form.address1,
                    line2: form.address2 || null,
                    city: form.city,
                    state: form.state,
                    postalCode: form.postalCode,
                    country: form.country,
                },
                delivery: form.delivery,
                payment: form.payment.toUpperCase() as 'COD' | 'UPI' | 'CARD',
                couponCode: appliedPromo?.code ?? null,
                notes: form.notes || null,
            };

            const res = await fetch('/api/v1/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.ok) {
                throw new Error(data?.error?.message ?? 'Order failed');
            }

            setOrderId(data.data.orderNumber);
            dispatch(clearCart());
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Order failed');
        } finally {
            setSubmitting(false);
        }
    };

    // Empty cart guard
    if (cartItems.length === 0 && !orderId) {
        return (
            <div className="min-h-[80vh] bg-white flex items-center justify-center px-4">
                <Toaster />
                <div className="text-center max-w-md">
                    <p className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-emerald-600 mb-3">
                        Your bag is empty
                    </p>
                    <h1 className="font-delius-swash-caps text-4xl md:text-5xl text-gray-900 mb-4">
                        Nothing to check out
                    </h1>
                    <p className="font-inter text-sm text-gray-600 mb-8">
                        Browse our latest pieces and add something you love.
                    </p>
                    <button
                        onClick={() => router.push('/products')}
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-md text-[11px] font-inter font-semibold tracking-[0.25em] uppercase hover:bg-emerald-600 transition-colors"
                    >
                        Continue Shopping
                        <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    // Success state
    if (orderId) {
        return (
            <div className="min-h-[80vh] bg-white flex items-center justify-center px-4 py-16">
                <Toaster />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-lg"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}
                        className="mx-auto mb-8 w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
                    >
                        <svg
                            className="w-9 h-9 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <motion.path
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </motion.div>

                    <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                        Order Confirmed
                    </p>
                    <h1 className="font-delius-swash-caps text-4xl md:text-5xl text-gray-900 mb-4">
                        Thank you, {form.firstName || 'friend'}
                    </h1>
                    <p className="font-inter text-sm text-gray-600 leading-relaxed mb-6">
                        Your order is on its way. A confirmation email has been sent to{' '}
                        <span className="text-gray-900 font-medium">{form.email}</span>.
                    </p>

                    <div className="inline-flex items-center gap-3 px-5 py-3 border border-gray-200 rounded-md mb-10">
                        <span className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-400">
                            Order ID
                        </span>
                        <span className="text-sm font-inter font-semibold tracking-wider text-gray-900">
                            {orderId}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => router.push('/products')}
                            className="bg-gray-900 text-white px-7 py-3 rounded-md text-[11px] font-inter font-semibold tracking-[0.25em] uppercase hover:bg-emerald-600 transition-colors"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="border border-gray-200 text-gray-900 px-7 py-3 rounded-md text-[11px] font-inter font-semibold tracking-[0.25em] uppercase hover:border-gray-900 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Toaster />

            {/* Breadcrumb */}
            <nav className="max-w-7xl mx-auto px-4 pt-8 pb-2 flex items-center gap-2 text-[11px] font-inter font-medium tracking-wider uppercase text-gray-400">
                <button onClick={() => router.push('/')} className="hover:text-gray-900 transition-colors">
                    Home
                </button>
                <span className="text-gray-300">/</span>
                <button onClick={() => router.push('/products')} className="hover:text-gray-900 transition-colors">
                    Products
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">Checkout</span>
            </nav>

            {/* Hero */}
            <section className="max-w-7xl mx-auto px-4 pt-6 pb-10 text-center border-b border-gray-100">
                <p className="text-[11px] font-inter font-semibold tracking-[0.4em] uppercase text-emerald-600 mb-3">
                    Final Steps
                </p>
                <h1 className="font-delius-swash-caps text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-[1.05]">
                    Checkout
                </h1>
                <div className="flex items-center justify-center gap-3 mt-5">
                    <span className="h-px w-10 bg-gray-300" />
                    <span className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-500">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="h-px w-10 bg-gray-300" />
                </div>
            </section>

            {/* Mobile collapsible summary */}
            <div className="lg:hidden border-b border-gray-100">
                <button
                    onClick={() => setSummaryOpen((p) => !p)}
                    className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between"
                >
                    <span className="flex items-center gap-2 text-sm font-inter">
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="font-semibold text-gray-900">
                            Order summary
                        </span>
                        <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                    <span className="text-base font-inter font-semibold text-gray-900">
                        ₹{total.toLocaleString()}
                    </span>
                </button>
                <AnimatePresence initial={false}>
                    {summaryOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="max-w-7xl mx-auto px-4 pb-4">
                                <OrderSummaryInner
                                    cartItems={cartItems}
                                    subtotal={subtotal}
                                    shipping={shipping}
                                    discount={discount}
                                    total={total}
                                    appliedPromo={appliedPromo}
                                    onRemovePromo={removePromo}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main */}
            <section className="max-w-7xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                    {/* Form column */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* Contact */}
                        <Section number="01" title="Contact">
                            <Field
                                label="Email"
                                value={form.email}
                                onChange={(v) => set('email', v)}
                                error={errors.email}
                                placeholder="you@example.com"
                                type="email"
                                autoComplete="email"
                            />
                            <label className="flex items-center gap-2 mt-3 text-xs font-inter text-gray-600">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-gray-900"
                                    defaultChecked
                                />
                                Email me with news and offers
                            </label>
                        </Section>

                        {/* Shipping */}
                        <Section number="02" title="Shipping Address">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field
                                    label="First name"
                                    value={form.firstName}
                                    onChange={(v) => set('firstName', v)}
                                    error={errors.firstName}
                                    autoComplete="given-name"
                                />
                                <Field
                                    label="Last name"
                                    value={form.lastName}
                                    onChange={(v) => set('lastName', v)}
                                    error={errors.lastName}
                                    autoComplete="family-name"
                                />
                            </div>
                            <Field
                                label="Phone"
                                value={form.phone}
                                onChange={(v) => set('phone', v.replace(/\D/g, '').slice(0, 10))}
                                error={errors.phone}
                                placeholder="10-digit mobile"
                                inputMode="tel"
                                autoComplete="tel"
                            />
                            <Field
                                label="Address"
                                value={form.address1}
                                onChange={(v) => set('address1', v)}
                                error={errors.address1}
                                placeholder="House number, street name"
                                autoComplete="address-line1"
                            />
                            <Field
                                label="Apartment, suite, etc. (optional)"
                                value={form.address2}
                                onChange={(v) => set('address2', v)}
                                autoComplete="address-line2"
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <Field
                                    label="City"
                                    value={form.city}
                                    onChange={(v) => set('city', v)}
                                    error={errors.city}
                                    autoComplete="address-level2"
                                />
                                <Field
                                    label="State"
                                    value={form.state}
                                    onChange={(v) => set('state', v)}
                                    error={errors.state}
                                    autoComplete="address-level1"
                                />
                                <Field
                                    label="PIN code"
                                    value={form.postalCode}
                                    onChange={(v) =>
                                        set('postalCode', v.replace(/\D/g, '').slice(0, 6))
                                    }
                                    error={errors.postalCode}
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                />
                            </div>
                            <Field
                                label="Country"
                                value={form.country}
                                onChange={(v) => set('country', v)}
                                autoComplete="country-name"
                            />
                        </Section>

                        {/* Delivery */}
                        <Section number="03" title="Delivery">
                            <DeliveryOption
                                selected={form.delivery === 'standard'}
                                onSelect={() => set('delivery', 'standard')}
                                title="Standard Delivery"
                                description="5–7 business days"
                                price={subtotal >= 999 ? 'Free' : '₹99'}
                            />
                            <DeliveryOption
                                selected={form.delivery === 'express'}
                                onSelect={() => set('delivery', 'express')}
                                title="Express Delivery"
                                description="2–3 business days"
                                price="₹199"
                            />
                        </Section>

                        {/* Payment */}
                        <Section number="04" title="Payment">
                            <PaymentOption
                                selected={form.payment === 'cod'}
                                onSelect={() => set('payment', 'cod')}
                                title="Cash on Delivery"
                                description="Pay when your order arrives"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <rect x="3" y="6" width="18" height="13" rx="2" />
                                        <path d="M3 10h18M7 15h3" />
                                    </svg>
                                }
                            />
                            <PaymentOption
                                selected={form.payment === 'upi'}
                                onSelect={() => set('payment', 'upi')}
                                title="UPI"
                                description="Pay via Google Pay, PhonePe, Paytm"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <rect x="4" y="3" width="16" height="18" rx="2" />
                                        <path strokeLinecap="round" d="M9 18h6" />
                                    </svg>
                                }
                            >
                                {form.payment === 'upi' && (
                                    <Field
                                        label="UPI ID"
                                        value={form.upiId}
                                        onChange={(v) => set('upiId', v)}
                                        error={errors.upiId}
                                        placeholder="yourname@bank"
                                    />
                                )}
                            </PaymentOption>
                            <PaymentOption
                                selected={form.payment === 'card'}
                                onSelect={() => set('payment', 'card')}
                                title="Credit / Debit Card"
                                description="Visa, Mastercard, Rupay"
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                        <rect x="2" y="6" width="20" height="12" rx="2" />
                                        <path d="M2 10h20" />
                                    </svg>
                                }
                            >
                                {form.payment === 'card' && (
                                    <div className="space-y-3">
                                        <Field
                                            label="Card number"
                                            value={form.cardNumber}
                                            onChange={(v) => set('cardNumber', formatCardNumber(v))}
                                            error={errors.cardNumber}
                                            placeholder="0000 0000 0000 0000"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                        />
                                        <Field
                                            label="Name on card"
                                            value={form.cardName}
                                            onChange={(v) => set('cardName', v)}
                                            error={errors.cardName}
                                            autoComplete="cc-name"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field
                                                label="Expiry (MM/YY)"
                                                value={form.cardExpiry}
                                                onChange={(v) => set('cardExpiry', formatExpiry(v))}
                                                error={errors.cardExpiry}
                                                placeholder="MM/YY"
                                                inputMode="numeric"
                                                autoComplete="cc-exp"
                                            />
                                            <Field
                                                label="CVV"
                                                value={form.cardCvv}
                                                onChange={(v) => set('cardCvv', v.replace(/\D/g, '').slice(0, 4))}
                                                error={errors.cardCvv}
                                                placeholder="•••"
                                                inputMode="numeric"
                                                autoComplete="cc-csc"
                                            />
                                        </div>
                                        <p className="text-[11px] font-inter text-gray-500 flex items-center gap-1.5">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <rect x="5" y="11" width="14" height="9" rx="1.5" />
                                                <path d="M8 11V7a4 4 0 118 0v4" />
                                            </svg>
                                            Your card details are encrypted end-to-end
                                        </p>
                                    </div>
                                )}
                            </PaymentOption>
                        </Section>

                        {/* Notes */}
                        <Section number="05" title="Order Notes (Optional)">
                            <textarea
                                value={form.notes}
                                onChange={(e) => set('notes', e.target.value)}
                                rows={3}
                                placeholder="Gift wrapping, delivery instructions, etc."
                                className="w-full px-4 py-3 border border-gray-200 rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-none"
                            />
                        </Section>
                    </div>

                    {/* Summary column */}
                    <aside className="hidden lg:block lg:col-span-5">
                        <div className="sticky top-[120px] space-y-6">
                            <OrderSummaryInner
                                cartItems={cartItems}
                                subtotal={subtotal}
                                shipping={shipping}
                                discount={discount}
                                total={total}
                                appliedPromo={appliedPromo}
                                onRemovePromo={removePromo}
                            />

                            {/* Promo */}
                            <div className="rounded-2xl border border-gray-100 p-5">
                                <h4 className="text-[11px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-900 mb-3">
                                    Promo code
                                </h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={form.promoCode}
                                        onChange={(e) => set('promoCode', e.target.value)}
                                        placeholder="WELCOME10"
                                        disabled={Boolean(appliedPromo)}
                                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-md text-sm font-inter font-semibold tracking-wider uppercase text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                                    />
                                    {appliedPromo ? (
                                        <button
                                            onClick={removePromo}
                                            className="px-4 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase text-gray-700 border border-gray-200 rounded-md hover:border-red-400 hover:text-red-600 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    ) : (
                                        <button
                                            onClick={applyPromo}
                                            disabled={promoBusy || !form.promoCode.trim()}
                                            className="px-4 py-2.5 text-[11px] font-inter font-semibold tracking-widest uppercase text-white bg-gray-900 rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {promoBusy ? 'Checking…' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] font-inter text-gray-400 mt-2">
                                    Try <span className="font-semibold">WELCOME10</span> for 10% off
                                </p>
                            </div>

                            {/* Place order */}
                            <PlaceOrderButton
                                submitting={submitting}
                                onSubmit={placeOrder}
                                total={total}
                            />

                            {/* Trust signals */}
                            <div className="grid grid-cols-3 gap-3 pt-2">
                                {[
                                    { label: 'Secure', sub: 'SSL encrypted' },
                                    { label: 'Returns', sub: '30-day policy' },
                                    { label: 'Support', sub: '24/7 chat' },
                                ].map((t) => (
                                    <div key={t.label} className="text-center px-1">
                                        <p className="text-[10px] font-inter font-semibold tracking-wider uppercase text-gray-900">
                                            {t.label}
                                        </p>
                                        <p className="text-[10px] font-inter text-gray-500 mt-0.5">
                                            {t.sub}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Mobile place order */}
                    <div className="lg:hidden">
                        <PlaceOrderButton
                            submitting={submitting}
                            onSubmit={placeOrder}
                            total={total}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

/* ─── Reusable inline components ────────────────────────────────── */

type CartItemView = {
    id: string;
    title: string;
    brand: string;
    image: string;
    originalPrice: number;
    discountedPrice?: number;
    size: string;
    color: string;
    quantity: number;
};

function OrderSummaryInner({
    cartItems,
    subtotal,
    shipping,
    discount,
    total,
    appliedPromo,
    onRemovePromo,
}: {
    cartItems: CartItemView[];
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    appliedPromo: { code: string; discount: number } | null;
    onRemovePromo: () => void;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 p-5 bg-white">
            <h3 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900 mb-5">
                Order Summary
            </h3>

            <ul className="space-y-4 mb-5 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                    <li key={lineKey(item)} className="flex gap-3">
                        <div className="w-16 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div className="min-w-0">
                                <p className="text-[10px] font-inter font-semibold tracking-widest uppercase text-gray-500 truncate">
                                    {item.brand}
                                </p>
                                <p className="text-sm font-inter font-medium text-gray-900 truncate">
                                    {item.title}
                                </p>
                            </div>
                            <p className="text-[11px] font-inter text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span>{item.size}</span>
                                <span className="text-gray-300">·</span>
                                <span>{item.color}</span>
                                <span className="text-gray-300">·</span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold text-[10px]">
                                    Qty {item.quantity}
                                </span>
                            </p>
                        </div>
                        <p className="text-sm font-inter font-semibold text-gray-900 self-center whitespace-nowrap">
                            ₹
                            {(
                                (item.discountedPrice ?? item.originalPrice) * item.quantity
                            ).toLocaleString()}
                        </p>
                    </li>
                ))}
            </ul>

            <dl className="space-y-2 pt-4 border-t border-gray-100 text-sm font-inter">
                <Row label="Subtotal" value={`₹${subtotal.toLocaleString()}`} />
                {discount > 0 && (
                    <Row
                        label={
                            <span className="flex items-center gap-2">
                                Discount{' '}
                                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {appliedPromo?.code}
                                </span>
                                <button
                                    onClick={onRemovePromo}
                                    aria-label="Remove promo"
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        }
                        value={`-₹${discount.toLocaleString()}`}
                        valueClass="text-emerald-600"
                    />
                )}
                <Row
                    label="Shipping"
                    value={shipping === 0 ? 'Free' : `₹${shipping.toLocaleString()}`}
                    valueClass={shipping === 0 ? 'text-emerald-600 font-semibold' : ''}
                />
            </dl>

            <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-gray-200">
                <span className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    Total
                </span>
                <span className="text-2xl font-inter font-semibold text-gray-900">
                    ₹{total.toLocaleString()}
                </span>
            </div>
            <p className="text-[10px] font-inter text-gray-400 mt-1 text-right">
                Inclusive of all taxes
            </p>
        </div>
    );
}

function Section({
    number,
    title,
    children,
}: {
    number: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-400">
                    {number}
                </span>
                <span className="h-px flex-1 bg-gray-100" />
                <h2 className="text-[11px] font-inter font-semibold tracking-[0.3em] uppercase text-gray-900">
                    {title}
                </h2>
            </div>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    placeholder,
    type = 'text',
    inputMode,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
    type?: string;
    inputMode?: 'text' | 'numeric' | 'tel' | 'email';
    autoComplete?: string;
}) {
    return (
        <div>
            <label className="block">
                <span className="text-[10px] font-inter font-semibold tracking-[0.25em] uppercase text-gray-600 mb-1.5 block">
                    {label}
                </span>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    inputMode={inputMode}
                    autoComplete={autoComplete}
                    className={`w-full px-4 py-3 border rounded-md text-sm font-inter text-gray-900 placeholder:text-gray-400 focus:outline-none transition-colors ${error
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-gray-900'
                        }`}
                />
            </label>
            {error && (
                <p className="text-[10px] font-inter text-red-600 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
}

function DeliveryOption({
    selected,
    onSelect,
    title,
    description,
    price,
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    description: string;
    price: string;
}) {
    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-colors duration-200 ${selected
                ? 'border-gray-900 bg-gray-900/[0.02]'
                : 'border-gray-200 hover:border-gray-400'
                }`}
        >
            <span
                className={`relative w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-gray-900' : 'border-gray-300'
                    }`}
            >
                {selected && (
                    <span className="absolute inset-1 rounded-full bg-gray-900" />
                )}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-inter font-semibold text-gray-900">{title}</p>
                <p className="text-[11px] font-inter text-gray-500 mt-0.5">
                    {description}
                </p>
            </div>
            <span className="text-sm font-inter font-semibold text-gray-900 whitespace-nowrap">
                {price}
            </span>
        </button>
    );
}

function PaymentOption({
    selected,
    onSelect,
    title,
    description,
    icon,
    children,
}: {
    selected: boolean;
    onSelect: () => void;
    title: string;
    description: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-xl border transition-colors duration-200 ${selected
                ? 'border-gray-900 bg-gray-900/[0.02]'
                : 'border-gray-200 hover:border-gray-400'
                }`}
        >
            <button
                type="button"
                onClick={onSelect}
                aria-pressed={selected}
                className="w-full text-left flex items-center gap-4 p-4"
            >
                <span
                    className={`relative w-4 h-4 rounded-full border-2 flex-shrink-0 ${selected ? 'border-gray-900' : 'border-gray-300'
                        }`}
                >
                    {selected && (
                        <span className="absolute inset-1 rounded-full bg-gray-900" />
                    )}
                </span>
                <span className="text-gray-700">{icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-inter font-semibold text-gray-900">{title}</p>
                    <p className="text-[11px] font-inter text-gray-500 mt-0.5">
                        {description}
                    </p>
                </div>
            </button>
            {children && <div className="px-4 pb-4 space-y-3">{children}</div>}
        </div>
    );
}

function Row({
    label,
    value,
    valueClass = '',
}: {
    label: React.ReactNode;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-gray-600">{label}</dt>
            <dd className={`text-gray-900 ${valueClass}`}>{value}</dd>
        </div>
    );
}

function PlaceOrderButton({
    submitting,
    onSubmit,
    total,
}: {
    submitting: boolean;
    onSubmit: () => void;
    total: number;
}) {
    return (
        <button
            onClick={onSubmit}
            disabled={submitting}
            className={`w-full py-4 text-[11px] font-inter font-semibold tracking-[0.3em] uppercase rounded-md transition-colors duration-200 ${submitting
                ? 'bg-gray-100 text-gray-400 cursor-wait'
                : 'bg-gray-900 text-white hover:bg-emerald-600'
                }`}
        >
            {submitting ? (
                <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Placing Order
                </span>
            ) : (
                `Place Order · ₹${total.toLocaleString()}`
            )}
        </button>
    );
}

export default CheckoutPage;
