
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { prisma } from './db';
import { verifyEmail } from './emailValidator';
import { storage } from './storage';

interface WorkerOptions {
    checkMx: boolean;
    checkSmtp: boolean;
}

export async function processJob(jobId: string, options: WorkerOptions) {
    console.log(`[Worker] Starting job ${jobId}`);

    try {
        // 1. Get Job
        const job = await prisma.verificationJob.findUnique({
            where: { id: jobId }
        });

        if (!job) {
            console.error(`[Worker] Job ${jobId} not found`);
            return;
        }

        await prisma.verificationJob.update({
            where: { id: jobId },
            data: { status: 'PROCESSING' }
        });

        // 2. Read File
        const fileBuffer = await storage.getFile(job.filename);
        let records: any[] = [];

        if (job.filename.endsWith('.csv')) {
            const csvData = fileBuffer.toString('utf-8');
            const result = Papa.parse(csvData, { header: true, skipEmptyLines: true });
            records = result.data;
        } else if (job.filename.match(/\.xlsx?$/)) {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            records = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        }

        if (records.length === 0) {
            throw new Error('No records found in file');
        }

        // Update total info
        await prisma.verificationJob.update({
            where: { id: jobId },
            data: { totalRows: records.length }
        });

        const emailColumn = job.emailColumn;
        if (!emailColumn) {
            throw new Error('Email column not specified');
        }

        // 3. Process records
        let processed = 0;
        const BATCH_SIZE = 10; // Batch for DB insertion

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);
            const resultsToSave = [];

            // Process batch in parallel verification
            const batchPromises = batch.map(async (row) => {
                const email = row[emailColumn];
                if (typeof email === 'string') {
                    const verification = await verifyEmail(email, options);
                    return {
                        email: email,
                        status: verification.status,
                        details: JSON.stringify(verification),
                        rowData: JSON.stringify(row), // Save full original data
                        jobId: jobId
                    };
                }
                return null;
            });

            const processedBatch = (await Promise.all(batchPromises)).filter(Boolean);

            // Bulk Insert
            if (processedBatch.length > 0) {
                // Prisma createMany is not supported on SQLite in older versions, 
                // but checking support... standard createMany is supported in recent versions or we use a loop/transaction.
                // SQLite supports createMany in Prisma since v? Let's check. 
                // If not supported, we loop. But it should be.
                // Wait, type safety: filtered batch needs type.

                // Using transaction for safety
                await prisma.$transaction(
                    processedBatch.map((data: any) =>
                        prisma.verificationResult.create({ data })
                    )
                );
            }

            processed += batch.length;

            // Update progress occasionally
            await prisma.verificationJob.update({
                where: { id: jobId },
                data: { processedRows: processed }
            });
        }

        // 4. Complete
        await prisma.verificationJob.update({
            where: { id: jobId },
            data: { status: 'COMPLETED' }
        });

        console.log(`[Worker] Job ${jobId} completed`);

    } catch (error) {
        console.error(`[Worker] Job ${jobId} failed:`, error);
        await prisma.verificationJob.update({
            where: { id: jobId },
            data: { status: 'FAILED' }
        });
    }
}
