import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppConfigService } from "../config/app-config.service";

@Injectable()
export class StorageService {
	private readonly client: S3Client;
	private readonly bucket: string;

	constructor(private readonly config: AppConfigService) {
		this.client = new S3Client({
			region: config.getAwsRegion(),
			credentials: {
				accessKeyId: config.getAwsAccessKeyId(),
				secretAccessKey: config.getAwsSecretAccessKey(),
			},
		});
		this.bucket = config.getS3Bucket();
	}

	presignUpload(key: string, contentType: string, expiresIn: number): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,
			ContentType: contentType,
		});
		return getSignedUrl(this.client, command, { expiresIn });
	}
}
