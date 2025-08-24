import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from './storage-client-factory';

export class StorageClient {
    async upload(params: {
        bucket: string;
        key: string;
        body: Buffer | ReadableStream | string;
        contentType: string;
    }): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: params.bucket,
            Key: params.key,
            Body: params.body,
            ContentType: params.contentType,
        });

        await s3.send(command);
    }

    async getSignedUrlForGetObject(params: { bucket: string; key: string; expiresIn?: number }): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: params.bucket,
            Key: params.key,
        });

        return getSignedUrl(s3, command, { expiresIn: params.expiresIn ?? 3600 });
    }

    async delete(params: { bucket: string; key: string }): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: params.bucket,
            Key: params.key,
        });

        await s3.send(command);
    }
}
