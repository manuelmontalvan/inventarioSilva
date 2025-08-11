import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Recibe el archivo con campo 'file'
  async uploadFile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    const result = await this.cloudinaryService.uploadImage(file);

    if (!result || !result.secure_url) {
      throw new BadRequestException('Error al subir la imagen');
    }

    return {
      url: result.secure_url, // URL pública para usar en frontend o guardar en BD
      public_id: result.public_id,
      format: result.format,
    };
  }
}
