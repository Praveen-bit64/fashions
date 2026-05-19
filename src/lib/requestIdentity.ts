/**
 * Resolves "who is asking" for an API route — used for quota tracking.
 *
 * MVP NOTE: there is no server-side session in this app today; the client
 * supplies `x-user-id` if signed in. This is good-enough for cost-control
 * during prototyping, but should be replaced with a verified session token
 * before production launch.
 */
export type Identity =
    | { kind: 'user'; id: string }
    | { kind: 'anon'; ip: string };

export function getIdentity(req: Request): Identity {
    const userId = req.headers.get('x-user-id');
    if (userId && userId.trim().length > 0) {
        return { kind: 'user', id: userId.trim() };
    }
    const forwarded = req.headers.get('x-forwarded-for');
    const ip =
        forwarded?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown';
    return { kind: 'anon', ip };
}
