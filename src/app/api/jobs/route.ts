import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
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
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const emailColumn = formData.get('emailColumn') as string;

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const uniqueId = crypto.randomUUID();
        const originalName = file.name;
        const extension = path.extname(originalName);
        const savedFilename = `${uniqueId}${extension}`;
        const filePath = path.join(uploadDir, savedFilename);

        // Save file
        await writeFile(filePath, buffer);

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
