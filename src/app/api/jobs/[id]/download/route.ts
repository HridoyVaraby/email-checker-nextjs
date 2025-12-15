import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const statusFilter = searchParams.get('status'); // Optional filter

    try {
        const job = await prisma.verificationJob.findUnique({
            where: { id: id }
        });

        if (!job) {
            return new NextResponse('Job not found', { status: 404 });
        }

        // Build query
        const where: any = { jobId: id };
        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter.includes(',')) {
                const statuses = statusFilter.split(',');
                where.status = { in: statuses };
            } else {
                where.status = statusFilter;
            }
        }

        const results = await prisma.verificationResult.findMany({
            where: where,
            orderBy: { id: 'asc' }
        });

        // Flatten data
        // @ts-ignore
        const flatData = results.map(r => {
            let originalData = {};
            let details: any = {};
            try {
                if (r.rowData) originalData = JSON.parse(r.rowData);
                if (r.details) details = JSON.parse(r.details);
            } catch (e) { }

            return {
                ...originalData,
                verification_status: r.status,
                verification_reason: details.reason || '',
                // Add specific check details if useful
                mx_found: details.details?.hasMxRecord ? 'Yes' : 'No',
                disposable: details.details?.isDisposable ? 'Yes' : 'No',
                role_based: details.details?.isRoleBased ? 'Yes' : 'No',
                smtp_valid: details.details?.smtpValid === undefined ? 'N/A' : (details.details.smtpValid ? 'Yes' : 'No')
            };
        });

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(flatData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');
            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            return new NextResponse(buffer, {
                headers: {
                    'Content-Disposition': `attachment; filename="${job.originalName}_results.xlsx"`,
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });
        } else {
            // CSV
            const csv = Papa.unparse(flatData);
            return new NextResponse(csv, {
                headers: {
                    'Content-Disposition': `attachment; filename="${job.originalName}_results.csv"`,
                    'Content-Type': 'text/csv',
                },
            });
        }
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Download failed', { status: 500 });
    }
}
