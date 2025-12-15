/**
 * Download API Route
 * 
 * POST /api/download
 * 
 * Generates and returns filtered data in CSV or Excel format.
 */

import { NextRequest, NextResponse } from 'next/server';
import { toCSV, toExcel, filterByStatus, generateFilename, ExportableResult } from '@/lib/exporter';
import { VerificationStatus } from '@/lib/emailValidator';

// Type for download request
interface DownloadRequest {
    data: ExportableResult[];
    filter: 'all' | 'valid' | 'invalid' | 'risky' | 'unknown';
    format: 'csv' | 'xlsx';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body: DownloadRequest = await request.json();
        const { data, filter = 'all', format = 'csv' } = body;

        // Validate input
        if (!data || !Array.isArray(data) || data.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No data provided' },
                { status: 400 }
            );
        }

        // Filter data based on request
        let filteredData: ExportableResult[] = data;

        if (filter !== 'all') {
            const statusMap: Record<string, VerificationStatus[]> = {
                valid: ['Valid'],
                invalid: ['Invalid'],
                risky: ['Risky'],
                unknown: ['Unknown']
            };

            const statuses = statusMap[filter];
            if (statuses) {
                filteredData = filterByStatus(data, statuses);
            }
        }

        // Generate fileContent
        let fileContent: Buffer | string;
        let contentType: string;
        let extension: string;

        if (format === 'xlsx') {
            const buffer = toExcel(filteredData, 'Verification Results');
            fileContent = Buffer.from(buffer);
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            extension = 'xlsx';
        } else {
            fileContent = toCSV(filteredData);
            contentType = 'text/csv';
            extension = 'csv';
        }

        // Generate filename
        const filterSuffix = filter === 'all' ? 'full' : `${filter}-only`;
        const filename = generateFilename(`email-verification-${filterSuffix}`, extension);

        // Return file response
        return new NextResponse(fileContent, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: unknown) {
        console.error('Download error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json(
            { success: false, message: `Download failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}
