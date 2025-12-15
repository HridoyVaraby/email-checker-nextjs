/**
 * Email Verification API Route
 * 
 * POST /api/verify
 * 
 * Accepts email data and returns verification results.
 * Supports batch processing with progress tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail, getVerificationStats, VerificationStatus, EmailVerificationResult } from '@/lib/emailValidator';

// Type for incoming data records
interface DataRecord {
    [key: string]: string | number | boolean | null | undefined;
}

// Type for verification request
interface VerifyRequest {
    data: DataRecord[];
    emailColumn: string;
    options?: {
        checkMx?: boolean;
        checkSmtp?: boolean;
    };
}

// Type for verification response
interface VerifyResponse {
    success: boolean;
    data: DataRecord[];
    stats: {
        total: number;
        valid: number;
        invalid: number;
        risky: number;
        unknown: number;
    };
    message?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyResponse>> {
    try {
        const body: VerifyRequest = await request.json();
        const { data, emailColumn, options = {} } = body;

        // Validate input
        if (!data || !Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    data: [],
                    stats: { total: 0, valid: 0, invalid: 0, risky: 0, unknown: 0 },
                    message: 'No data provided'
                },
                { status: 400 }
            );
        }

        if (!emailColumn) {
            return NextResponse.json(
                {
                    success: false,
                    data: [],
                    stats: { total: 0, valid: 0, invalid: 0, risky: 0, unknown: 0 },
                    message: 'Email column not specified'
                },
                { status: 400 }
            );
        }

        // Verify that email column exists in data
        if (data.length > 0 && !(emailColumn in data[0])) {
            return NextResponse.json(
                {
                    success: false,
                    data: [],
                    stats: { total: 0, valid: 0, invalid: 0, risky: 0, unknown: 0 },
                    message: `Email column "${emailColumn}" not found in data`
                },
                { status: 400 }
            );
        }

        // Process emails in batches to avoid timeout
        const batchSize = 10;
        const results: EmailVerificationResult[] = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(row => {
                    const email = String(row[emailColumn] || '');
                    return verifyEmail(email, {
                        checkMx: options.checkMx ?? true,
                        checkSmtp: options.checkSmtp ?? false
                    });
                })
            );
            results.push(...batchResults);
        }

        // Append verification_status to original data
        const enrichedData = data.map((row, index) => ({
            ...row,
            verification_status: results[index]?.status || 'Unknown' as VerificationStatus,
            verification_reason: results[index]?.reason || ''
        }));

        // Calculate statistics
        const stats = getVerificationStats(results);

        return NextResponse.json({
            success: true,
            data: enrichedData,
            stats,
            message: `Successfully verified ${data.length} email(s)`
        });

    } catch (error: unknown) {
        console.error('Verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            {
                success: false,
                data: [],
                stats: { total: 0, valid: 0, invalid: 0, risky: 0, unknown: 0 },
                message: `Verification failed: ${errorMessage}`
            },
            { status: 500 }
        );
    }
}
