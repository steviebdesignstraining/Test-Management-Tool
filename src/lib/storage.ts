import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { safeFileName } from "./files";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export interface StorageConfig {
  useS3: boolean;
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface UploadedFile {
  key: string;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  storagePath: string;
}

function getStorageConfig(): StorageConfig {
  return {
    useS3: process.env.USE_S3 === "true" || process.env.USE_R2 === "true",
    bucket: process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || process.env.BUCKET_NAME,
    region: process.env.AWS_REGION || process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT || process.env.AWS_S3_ENDPOINT,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
  };
}

function getS3Client(config: StorageConfig): S3Client {
  const clientConfig: any = {
    region: config.region,
  };
  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
    clientConfig.forcePathStyle = true;
  }
  if (config.accessKeyId && config.secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    };
  }
  return new S3Client(clientConfig);
}

export class StorageService {
  private config: StorageConfig;
  private s3Client: S3Client | null = null;

  constructor() {
    this.config = getStorageConfig();
    if (this.config.useS3) {
      this.s3Client = getS3Client(this.config);
    } else {
      this.ensureLocalDir();
    }
  }

  private ensureLocalDir() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(file: File, options?: { prefix?: string }): Promise<UploadedFile> {
    const originalName = file.name;
    const sanitized = safeFileName(originalName);
    const uuid = randomUUID();
    const key = options?.prefix ? `${options.prefix}/${uuid}-${sanitized}` : `${uuid}-${sanitized}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const size = buffer.length;

    if (this.config.useS3 && this.s3Client && this.config.bucket) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          Metadata: {
            originalName: encodeURIComponent(originalName),
          },
        })
      );
      return {
        key,
        url: key,
        filename: key,
        originalName,
        size,
        mimeType,
        storagePath: key,
      };
    } else {
      const filePath = join(UPLOAD_DIR, key.replace(/[^a-zA-Z0-9._-]/g, "_"));
      writeFileSync(filePath, buffer);
      return {
        key,
        url: `/api/v1/attachments/${key.split('/').pop()}`,
        filename: key.split('/').pop() || key,
        originalName,
        size,
        mimeType,
        storagePath: filePath,
      };
    }
  }

  async download(key: string): Promise<{ buffer: Buffer; mimeType: string; originalName: string }> {
    if (this.config.useS3 && this.s3Client && this.config.bucket) {
      const result = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
      const chunks: Uint8Array[] = [];
      const stream = result.Body as any;
      if (stream && typeof stream[Symbol.asyncIterator] === "function") {
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
      } else {
        const buffer = await stream?.transformToByteArray?.();
        if (buffer) chunks.push(buffer);
      }
      const buffer = Buffer.concat(chunks);
      return {
        buffer,
        mimeType: result.ContentType || "application/octet-stream",
        originalName: decodeURIComponent(result.Metadata?.originalName || key),
      };
    } else {
      const filePath = join(UPLOAD_DIR, key);
      if (!existsSync(filePath)) {
        throw new Error("File not found");
      }
      const buffer = readFileSync(filePath);
      return {
        buffer,
        mimeType: "application/octet-stream",
        originalName: key,
      };
    }
  }

  async delete(key: string): Promise<void> {
    if (this.config.useS3 && this.s3Client && this.config.bucket) {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        })
      );
    } else {
      const filePath = join(UPLOAD_DIR, key);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    if (this.config.useS3 && this.s3Client && this.config.bucket) {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } else {
      return `/api/v1/attachments/${key.split('/').pop()}`;
    }
  }

  isS3Enabled(): boolean {
    return this.config.useS3 && !!this.config.bucket;
  }
}

export const storageService = new StorageService();
