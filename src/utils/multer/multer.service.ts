import { Injectable } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage, memoryStorage } from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ANY = 'any',
}

@Injectable()
export class MulterService {
  private mimeTypesMap: Record<FileType, string[]> = {
    [FileType.IMAGE]: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ],
    [FileType.DOCUMENT]: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ],
    [FileType.VIDEO]: [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/avi',
      'video/quicktime',
    ],
    [FileType.AUDIO]: [
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      'audio/mp3',
      'audio/aac',
    ],
    [FileType.ANY]: [], // যেকোনো ফাইল
  };

  /**
   * Single file upload option
   */
  public createMulterOptions(
    destinationFolder: string,
    prefix: string,
    fileType: FileType = FileType.IMAGE,
    fileSizeLimit = 10 * 1024 * 1024,
  ): MulterOptions {
    const allowedMimeTypes =
      fileType === FileType.ANY ? null : this.mimeTypesMap[fileType];

    // Ensure upload folder exists
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, destinationFolder);
        },
        filename: (req, file, cb) => {
          // Generate unique filename
          const ext = path.extname(file.originalname);
          const uniqueName = `${prefix}-${uuid()}${ext}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: fileSizeLimit },
      fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes || allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
    };
  }
  /**
   * Helper: validate if a file matches expected type
   */
  public isValidFileType(
    file: Express.Multer.File,
    fileType: FileType,
  ): boolean {
    if (fileType === FileType.ANY) return true;
    return this.mimeTypesMap[fileType].includes(file.mimetype);
  }

  /**
   * Helper: generate unique filename
   */
  public generateFileName(prefix: string, originalName: string): string {
    const ext = path.extname(originalName);
    return `${prefix}-${uuid()}${ext}`;
  }
}
