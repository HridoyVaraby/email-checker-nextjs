import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
        const results = await prisma.verificationResult.findMany({
            where: { jobId: id },
            take: limit,
            skip: offset,
            orderBy: { id: 'asc' }
        });

        // Transform to flat format suitable for table
        const flatData = results.map(r => {
            let originalData = {};
            let details = {};
            try {
                if (r.rowData) originalData = JSON.parse(r.rowData);
                if (r.details) details = JSON.parse(r.details);
            } catch (e) {
                // Ignore parse errors
            }

            return {
                ...originalData,
                verification_status: r.status,
                // @ts-ignore
                verification_reason: details.reason || ''
            };
        });

        return NextResponse.json({ success: true, data: flatData });
    } catch (error) {
        console.error('Failed to get records:', error);
        return NextResponse.json({ success: false, message: 'Failed to get records' }, { status: 500 });
    }
}
