import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processJob } from '@/lib/worker';

// Start processing a job
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { checkMx = true, checkSmtp = false } = body;

        const job = await prisma.verificationJob.findUnique({
            where: { id: id }
        });

        if (!job) {
            return NextResponse.json({ success: false, message: 'Job not found' }, { status: 404 });
        }

        if (job.status === 'PROCESSING' || job.status === 'COMPLETED') {
            return NextResponse.json({ success: false, message: 'Job is already processed or processing' }, { status: 400 });
        }

        // Trigger processing in background (do not await)
        processJob(id, { checkMx, checkSmtp }).catch(err => {
            console.error('Background processing error:', err);
        });

        return NextResponse.json({ success: true, message: 'Processing started in background' });

    } catch (error) {
        console.error('Failed to start job:', error);
        return NextResponse.json({ success: false, message: 'Failed to start job' }, { status: 500 });
    }
}
