import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const job = await prisma.verificationJob.findUnique({
            where: { id: id },
            include: {
                _count: {
                    select: { results: true }
                }
            }
        });

        if (!job) {
            return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
        }

        // Calculate stats on the fly or rely on what's in DB.
        // For detailed breakdown (valid, invalid...), we can query aggregation
        const stats = await prisma.verificationResult.groupBy({
            by: ['status'],
            where: { jobId: id },
            _count: {
                status: true
            }
        });

        const formattedStats = {
            total: job.totalRows,
            processed: job.processedRows,
            valid: 0,
            invalid: 0,
            risky: 0,
            unknown: 0
        };

        stats.forEach(s => {
            const count = s._count.status;
            if (s.status === 'Valid') formattedStats.valid = count;
            else if (s.status === 'Invalid') formattedStats.invalid = count;
            else if (s.status === 'Risky') formattedStats.risky = count;
            else if (s.status === 'Unknown') formattedStats.unknown = count;
        });

        return NextResponse.json({
            success: true,
            data: {
                ...job,
                stats: formattedStats
            }
        });

    } catch (error) {
        console.error('Failed to get job:', error);
        return NextResponse.json({ success: false, message: 'Failed to get job' }, { status: 500 });
    }
}
