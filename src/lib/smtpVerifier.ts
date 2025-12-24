/**
 * SMTP Verifier Library
 * 
 * Provides optional SMTP verification for email addresses.
 * Uses a non-intrusive handshake to verify mailbox existence.
 * 
 * Note: Many email servers block or limit SMTP verification attempts.
 * This should be used sparingly and with appropriate delays.
 */

import * as net from 'net';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

interface SmtpVerificationResult {
    email: string;
    valid: boolean | null;
    isCatchAll: boolean | null;
    message: string;
}

interface SmtpOptions {
    timeout?: number;
    sender?: string;
}

/**
 * Perform SMTP verification on an email address
 * This is a non-intrusive check that doesn't send actual emails
 * 
 * @param email - Email address to verify
 * @param options - SMTP verification options
 * @returns Verification result
 */
export async function verifySmtp(
    email: string,
    options: SmtpOptions = {}
): Promise<SmtpVerificationResult> {
    const { timeout = 10000, sender = 'verify@example.com' } = options;

    const result: SmtpVerificationResult = {
        email,
        valid: null,
        isCatchAll: null,
        message: ''
    };

    try {
        // Extract domain
        const domain = email.split('@')[1];
        if (!domain) {
            result.valid = false;
            result.message = 'Invalid email format';
            return result;
        }

        // Get MX records
        let mxRecords: dns.MxRecord[];
        try {
            mxRecords = await resolveMx(domain);
        } catch {
            result.valid = false;
            result.message = 'No MX records found';
            return result;
        }

        if (!mxRecords || mxRecords.length === 0) {
            result.valid = false;
            result.message = 'No MX records found';
            return result;
        }

        // Sort by priority and get the best MX
        mxRecords.sort((a, b) => a.priority - b.priority);
        const mxHost = mxRecords[0].exchange;

        // Perform SMTP handshake
        const smtpResult = await performSmtpHandshake(mxHost, email, sender, timeout);
        result.valid = smtpResult.valid;
        result.isCatchAll = smtpResult.isCatchAll;
        result.message = smtpResult.message;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.valid = null;
        result.message = `SMTP verification failed: ${errorMessage}`;
    }

    return result;
}

/**
 * Perform the actual SMTP handshake
 */
async function performSmtpHandshake(
    mxHost: string,
    email: string,
    sender: string,
    timeout: number
): Promise<{ valid: boolean | null; isCatchAll: boolean | null; message: string }> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let stage = 0;
        let buffer = '';
        let resolved = false;

        const cleanup = () => {
            if (!resolved) {
                resolved = true;
                socket.destroy();
            }
        };

        // Set timeout
        socket.setTimeout(timeout);

        socket.on('timeout', () => {
            cleanup();
            resolve({ valid: null, isCatchAll: null, message: 'Connection timeout' });
        });

        socket.on('error', (err) => {
            cleanup();
            resolve({ valid: null, isCatchAll: null, message: `Connection error: ${err.message}` });
        });

        socket.on('data', (data) => {
            buffer += data.toString();

            // Process complete lines
            const lines = buffer.split('\r\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (!line) continue;

                // SMTP multi-line responses use:
                // - "XXX-text" for continuation lines (hyphen after code)
                // - "XXX text" for final line (space after code)
                // We must only process the FINAL line of a multi-line response
                const isMultiLineContinuation = line.length > 3 && line[3] === '-';
                if (isMultiLineContinuation) {
                    // This is a continuation line, skip it and wait for the final line
                    continue;
                }

                const code = parseInt(line.substring(0, 3));

                switch (stage) {
                    case 0: // Initial connection
                        if (code === 220) {
                            socket.write(`HELO verify.local\r\n`);
                            stage = 1;
                        } else {
                            cleanup();
                            resolve({ valid: null, isCatchAll: null, message: 'Server rejected connection' });
                        }
                        break;

                    case 1: // HELO response
                        if (code === 250) {
                            socket.write(`MAIL FROM:<${sender}>\r\n`);
                            stage = 2;
                        } else {
                            cleanup();
                            resolve({ valid: null, isCatchAll: null, message: 'HELO rejected' });
                        }
                        break;

                    case 2: // MAIL FROM response
                        if (code === 250) {
                            socket.write(`RCPT TO:<${email}>\r\n`);
                            stage = 3;
                        } else {
                            cleanup();
                            resolve({ valid: null, isCatchAll: null, message: 'MAIL FROM rejected' });
                        }
                        break;

                    case 3: // RCPT TO response
                        socket.write('QUIT\r\n');
                        cleanup();

                        if (code === 250 || code === 251) {
                            resolve({ valid: true, isCatchAll: false, message: 'Mailbox exists' });
                        } else if (code === 550 || code === 551 || code === 552 || code === 553) {
                            resolve({ valid: false, isCatchAll: false, message: 'Mailbox does not exist' });
                        } else if (code === 450 || code === 451 || code === 452) {
                            resolve({ valid: null, isCatchAll: null, message: 'Temporary error - try again later' });
                        } else {
                            resolve({ valid: null, isCatchAll: null, message: `Unknown response: ${code}` });
                        }
                        break;
                }
            }
        });

        socket.on('close', () => {
            if (!resolved) {
                resolved = true;
                resolve({ valid: null, isCatchAll: null, message: 'Connection closed unexpectedly' });
            }
        });

        // Connect to SMTP server
        socket.connect(25, mxHost);
    });
}

/**
 * Check if a domain is a catch-all by testing with a random email
 */
export async function checkCatchAll(domain: string): Promise<boolean | null> {
    // Generate a random email that shouldn't exist
    const randomLocal = `test-${Math.random().toString(36).substring(7)}-${Date.now()}`;
    const randomEmail = `${randomLocal}@${domain}`;

    const result = await verifySmtp(randomEmail);

    if (result.valid === true) {
        // If a random email is valid, domain is likely catch-all
        return true;
    } else if (result.valid === false) {
        // Domain properly rejects invalid emails
        return false;
    }

    // Could not determine
    return null;
}
