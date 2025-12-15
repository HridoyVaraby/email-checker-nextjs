/**
 * Disposable Email Domains List
 * 
 * This file contains logic to check against a comprehensive list of disposable/temporary email domains.
 * The actual list is loaded from 'disposableDomains.json'.
 */

import domains from './disposableDomains.json';

// Create a Set for O(1) lookups
const disposableDomains: Set<string> = new Set(domains);

/**
 * Check if an email domain is a known disposable email provider
 * @param domain - The email domain to check
 * @returns true if the domain is disposable
 */
export function isDisposableDomain(domain: string): boolean {
  return disposableDomains.has(domain.toLowerCase());
}
