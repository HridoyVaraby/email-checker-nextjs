import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { storage } from '@/lib/storage';
import path from 'path';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const jobs = await prisma.verificationJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json({ success: true, data: jobs });
    } catch (error) {
        console.error('Failed to list jobs:', error);
        return NextResponse.json({ success: false, message: 'Failed to list jobs' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const emailColumn = formData.get('emailColumn') as string;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const uniqueId = crypto.randomUUID();
        const originalName = file.name;
        const extension = path.extname(originalName);
        const savedFilename = `${uniqueId}${extension}`;

        // Upload to S3/Minio
        await storage.uploadFile(savedFilename, buffer, file.type || 'application/octet-stream');

        // Create Job Record
        const job = await prisma.verificationJob.create({
            data: {
                id: uniqueId,
                filename: savedFilename,
                originalName: originalName,
                status: 'PENDING',
                emailColumn: emailColumn || null
            }
        });

        return NextResponse.json({ success: true, data: job });

    } catch (error) {
        console.error('Failed to create job:', error);
        return NextResponse.json({ success: false, message: 'Failed to create job' }, { status: 500 });
    }
}
