import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
// If port is 443 and https is in endpoint, we might not strictly need port in some SDK configs, but let's parse it if present.
const MINIO_PORT = process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : undefined;
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'emailchecker';
const MINIO_REGION = process.env.MINIO_REGION || 'us-east-1';

// Configure S3 Client for Minio
const s3Config: any = {
    region: MINIO_REGION,
    endpoint: MINIO_ENDPOINT,
    forcePathStyle: true, // Required for Minio
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY
    },
    tls: MINIO_USE_SSL
};

// Only add port if it's explicitly defined and not standard (though endpoint usually handles it)
// The AWS SDK often extracts port from endpoint. 
// However, if we want to be explicit:
// s3Config.endpoint = `${MINIO_ENDPOINT}:${MINIO_PORT}`; // No this is dangerous if endpoint already has protocol/port.
// Best to rely on endpoint string from env.

const s3Client = new S3Client(s3Config);

class StorageService {
    private isBucketChecked = false;

    private async ensureBucketExists() {
        if (this.isBucketChecked) return;

        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: MINIO_BUCKET }));
            this.isBucketChecked = true;
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                console.log(`Bucket ${MINIO_BUCKET} not found, creating...`);
                try {
                    await s3Client.send(new CreateBucketCommand({ Bucket: MINIO_BUCKET }));
                    this.isBucketChecked = true;
                    console.log(`Bucket ${MINIO_BUCKET} created successfully.`);
                } catch (createError) {
                    console.error('Failed to create bucket:', createError);
                    throw createError;
                }
            } else {
                // If 403 Forbidden, we might not have permissions to check/create, 
                // but we can try to proceed if the bucket exists.
                console.error('Error checking bucket existence:', error);
                // We don't throw here to allow trying upload, maybe we just can't list buckets.
            }
        }
    }

    async uploadFile(key: string, body: Buffer | Uint8Array | Blob | string | Readable, contentType: string = 'application/octet-stream') {
        await this.ensureBucketExists();

        try {
            const command = new PutObjectCommand({
                Bucket: MINIO_BUCKET,
                Key: key,
                Body: body,
                ContentType: contentType
            });
            await s3Client.send(command);
            return key;
        } catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error(`Failed to upload file to storage: ${error}`);
        }
    }

    async getFile(key: string): Promise<Buffer> {
        // await this.ensureBucketExists(); // Optimization: skip check on read

        try {
            const command = new GetObjectCommand({
                Bucket: MINIO_BUCKET,
                Key: key
            });
            const response = await s3Client.send(command);

            if (!response.Body) {
                throw new Error('File body is empty');
            }

            // Convert stream to buffer
            const byteArray = await response.Body.transformToByteArray();
            return Buffer.from(byteArray);
        } catch (error) {
            console.error('S3 Get Error:', error);
            throw new Error(`Failed to retrieve file from storage: ${error}`);
        }
    }
}

export const storage = new StorageService();
