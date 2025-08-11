import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'products' }, // Carpeta opcional
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse); // <- forzamos el tipo
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
