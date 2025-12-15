/**
 * Email Validator Library
 * 
 * Provides comprehensive email validation including:
 * - Syntax validation (regex)
 * - Domain/MX record checking
 * - Disposable domain detection
 * - Role-based address detection
 * - Catch-all domain detection
 */

import { isDisposableDomain } from './disposableDomains';

// Role-based email prefixes that indicate generic/shared addresses
const ROLE_BASED_PREFIXES = [
    'info', 'admin', 'support', 'sales', 'contact', 'help',
    'billing', 'accounts', 'feedback', 'service', 'office',
    'team', 'hello', 'enquiries', 'inquiries', 'webmaster',
    'postmaster', 'hostmaster', 'abuse', 'noreply', 'no-reply',
    'mailer-daemon', 'postmaster', 'root', 'security', 'marketing',
    'hr', 'jobs', 'careers', 'legal', 'press', 'media',
    'customerservice', 'newsletter', 'subscribe', 'unsubscribe'
];

// Verification status types
export type VerificationStatus = 'Valid' | 'Invalid' | 'Risky' | 'Unknown';

// Detailed verification result
export interface EmailVerificationResult {
    email: string;
    status: VerificationStatus;
    details: {
        syntaxValid: boolean;
        domainValid: boolean | null;
        hasMxRecord: boolean | null;
        isDisposable: boolean;
        isRoleBased: boolean;
        isCatchAll: boolean | null;
        smtpValid: boolean | null;
    };
    reason: string;
}

/**
 * Validates email syntax using a comprehensive regex pattern
 * @param email - Email address to validate
 * @returns true if syntax is valid
 */
export function validateSyntax(email: string): boolean {
    if (!email || typeof email !== 'string') {
        return false;
    }

    // Comprehensive email regex pattern
    // Follows RFC 5322 specification with practical limitations
    const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

    // Additional basic checks
    if (email.length > 254) return false; // Maximum email length
    if (email.includes('..')) return false; // No consecutive dots
    if (email.startsWith('.') || email.endsWith('.')) return false;

    return emailRegex.test(email);
}

/**
 * Extracts the domain from an email address
 * @param email - Email address
 * @returns Domain string or null if invalid
 */
export function extractDomain(email: string): string | null {
    if (!email || !email.includes('@')) {
        return null;
    }
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
}

/**
 * Extracts the local part (before @) from an email address
 * @param email - Email address
 * @returns Local part string or null if invalid
 */
export function extractLocalPart(email: string): string | null {
    if (!email || !email.includes('@')) {
        return null;
    }
    const parts = email.split('@');
    return parts.length === 2 ? parts[0].toLowerCase() : null;
}

/**
 * Checks if an email is from a disposable email provider
 * @param email - Email address to check
 * @returns true if disposable
 */
export function checkDisposable(email: string): boolean {
    const domain = extractDomain(email);
    if (!domain) return false;
    return isDisposableDomain(domain);
}

/**
 * Checks if an email is a role-based address (e.g., info@, admin@)
 * @param email - Email address to check
 * @returns true if role-based
 */
export function checkRoleBased(email: string): boolean {
    const localPart = extractLocalPart(email);
    if (!localPart) return false;

    // Check if the local part matches any role-based prefix
    return ROLE_BASED_PREFIXES.some(prefix =>
        localPart === prefix || localPart.startsWith(`${prefix}.`) || localPart.startsWith(`${prefix}_`)
    );
}

/**
 * Performs DNS MX record lookup for a domain (server-side only)
 * @param domain - Domain to check
 * @returns Object with validity status and MX records
 */
export async function checkDomainMX(domain: string): Promise<{
    valid: boolean;
    hasMx: boolean;
    records: string[];
}> {
    try {
        // Dynamic import to avoid client-side issues
        const dns = await import('dns').then(m => m.promises);

        const mxRecords = await dns.resolveMx(domain);

        return {
            valid: true,
            hasMx: mxRecords.length > 0,
            records: mxRecords.map(r => r.exchange)
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // ENODATA or ENOTFOUND means no MX records
        if (errorMessage.includes('ENODATA') || errorMessage.includes('ENOTFOUND')) {
            return { valid: false, hasMx: false, records: [] };
        }
        // Other errors - domain might still exist
        return { valid: false, hasMx: false, records: [] };
    }
}

/**
 * Detects if a domain is a catch-all (accepts all emails)
 * This is a heuristic check and may not be 100% accurate
 * @param domain - Domain to check
 * @returns true if likely catch-all, null if unable to determine
 */
export async function detectCatchAll(domain: string): Promise<boolean | null> {
    // This would require SMTP verification to properly detect
    // For now, we return null to indicate unknown
    // The SMTP verifier can update this
    return null;
}

/**
 * Comprehensive email verification
 * @param email - Email address to verify
 * @param options - Verification options
 * @returns Detailed verification result
 */
export async function verifyEmail(
    email: string,
    options: {
        checkMx?: boolean;
        checkSmtp?: boolean;
    } = {}
): Promise<EmailVerificationResult> {
    const { checkMx = true } = options;

    const result: EmailVerificationResult = {
        email: email.trim().toLowerCase(),
        status: 'Unknown',
        details: {
            syntaxValid: false,
            domainValid: null,
            hasMxRecord: null,
            isDisposable: false,
            isRoleBased: false,
            isCatchAll: null,
            smtpValid: null,
        },
        reason: ''
    };

    // Step 1: Syntax validation
    result.details.syntaxValid = validateSyntax(email);
    if (!result.details.syntaxValid) {
        result.status = 'Invalid';
        result.reason = 'Invalid email syntax';
        return result;
    }

    const domain = extractDomain(email);
    if (!domain) {
        result.status = 'Invalid';
        result.reason = 'Could not extract domain';
        return result;
    }

    // Step 2: Check for disposable domain
    result.details.isDisposable = checkDisposable(email);

    // Step 3: Check for role-based address
    result.details.isRoleBased = checkRoleBased(email);

    // Step 4: Domain/MX check (if enabled)
    if (checkMx) {
        const mxResult = await checkDomainMX(domain);
        result.details.domainValid = mxResult.valid;
        result.details.hasMxRecord = mxResult.hasMx;

        if (!mxResult.valid && !mxResult.hasMx) {
            result.status = 'Invalid';
            result.reason = 'Domain has no valid MX records';
            return result;
        }
    }

    // Step 5: Determine final status
    if (result.details.isDisposable) {
        result.status = 'Risky';
        result.reason = 'Disposable email domain';
    } else if (result.details.isRoleBased) {
        result.status = 'Risky';
        result.reason = 'Role-based email address';
    } else if (result.details.hasMxRecord) {
        result.status = 'Valid';
        result.reason = 'Email appears valid';
    } else {
        result.status = 'Unknown';
        result.reason = 'Could not fully verify email';
    }

    return result;
}

/**
 * Batch verify multiple emails
 * @param emails - Array of email addresses
 * @param options - Verification options
 * @returns Array of verification results
 */
export async function verifyEmails(
    emails: string[],
    options: {
        checkMx?: boolean;
        checkSmtp?: boolean;
        concurrency?: number;
    } = {}
): Promise<EmailVerificationResult[]> {
    const { concurrency = 5 } = options;

    const results: EmailVerificationResult[] = [];

    // Process in batches to avoid overwhelming DNS servers
    for (let i = 0; i < emails.length; i += concurrency) {
        const batch = emails.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(email => verifyEmail(email, options))
        );
        results.push(...batchResults);
    }

    return results;
}

/**
 * Get verification statistics from results
 * @param results - Array of verification results
 * @returns Statistics object
 */
export function getVerificationStats(results: EmailVerificationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    risky: number;
    unknown: number;
} {
    return {
        total: results.length,
        valid: results.filter(r => r.status === 'Valid').length,
        invalid: results.filter(r => r.status === 'Invalid').length,
        risky: results.filter(r => r.status === 'Risky').length,
        unknown: results.filter(r => r.status === 'Unknown').length,
    };
}
