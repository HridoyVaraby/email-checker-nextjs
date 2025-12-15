
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        // Try to count jobs
        const count = await prisma.verificationJob.count();
        console.log(`Database connected. Job count: ${count}`);

        // Try to create a dummy job
        const job = await prisma.verificationJob.create({
            data: {
                id: 'test-' + Date.now(),
                filename: 'test.csv',
                originalName: 'test.csv',
                status: 'PENDING',
                totalRows: 0,
                processedRows: 0
            }
        });
        console.log('Successfully created test job:', job.id);

        // Cleanup
        await prisma.verificationJob.delete({ where: { id: job.id } });
        console.log('Cleanup successful');

    } catch (error) {
        console.error('Database error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
