

import 'dotenv/config';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

async function runTest() {
    console.log('Starting Minio Connection Test...');

    // Debug output
    console.log('Endpoint:', process.env.MINIO_ENDPOINT);
    console.log('Region:', process.env.MINIO_REGION);
    console.log('Bucket:', process.env.MINIO_BUCKET);
    console.log('Access Key Length:', process.env.MINIO_ACCESS_KEY?.length);
    console.log('Secret Key Length:', process.env.MINIO_SECRET_KEY?.length);

    const s3Client = new S3Client({
        region: process.env.MINIO_REGION || 'us-east-1',
        endpoint: process.env.MINIO_ENDPOINT,
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY || '',
            secretAccessKey: process.env.MINIO_SECRET_KEY || ''
        },
        tls: process.env.MINIO_USE_SSL === 'true'
    });

    try {
        console.log('Attempting ListBuckets...');
        const data = await s3Client.send(new ListBucketsCommand({}));
        console.log('Connection Successful!');
        console.log('Buckets:', data.Buckets?.map(b => b.Name));
    } catch (err) {
        console.error('Connection Failed:', err);
    }
}

runTest();

