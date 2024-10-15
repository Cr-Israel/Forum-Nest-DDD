import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { EnvService } from "../env/env.service";
import { Uploader, UploadParams } from "@/domain/forum/application/storage/uploader";

@Injectable()
export class TebiStorage implements Uploader {
  private client: S3Client;

  constructor(private envService: EnvService) {
    const credentials = {
      accessKeyId: envService.get('TEBI_ACCESS_KEY_ID'),
      secretAccessKey: envService.get('TEBI_SECRET_ACCESS_KEY'),
    }

    // const bucketName = envService.get('TEBI_BUCKET_NAME')

    // console.log(credentials)

    this.client = new S3Client({
      endpoint: `https://s3.tebi.io/${envService.get('TEBI_BUCKET_NAME')}`,
      credentials: credentials,
      region: 'global',
    })
  }

  async upload({
    fileName,
    fileType,
    body,
  }: UploadParams): Promise<{ url: string; }> {
      const uploadId = randomUUID()
      const uniqueFileName = `${uploadId}-${fileName}`
      const bucketName = this.envService.get('TEBI_BUCKET_NAME')

      await this.client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: uniqueFileName,
          // ContentType: fileType,
          Body: body,
        }),
      )

      return {
        url: uniqueFileName
      }
  }
}