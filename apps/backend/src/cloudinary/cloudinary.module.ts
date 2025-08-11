// src/cloudinary/cloudinary.module.ts
import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import {UploadsController} from './upload.controller';

@Module({
  providers: [CloudinaryService],
  controllers: [UploadsController],
  exports: [CloudinaryService]
})
export class CloudinaryModule {}
