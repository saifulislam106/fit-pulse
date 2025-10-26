import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
// import mime from 'mime-types';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as Multer from 'multer';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFileDto } from './dto/create-file.dto';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // @HandleError('Error creating file', 'file')
  async create(createFileDto: CreateFileDto) {
    try {
      const file = await this.prisma.fileInstance.create({
        data: createFileDto,
      });
      return file;
    } catch (err) {
      this.logger.error('Error saving file to DB', err);
      throw new BadRequestException('Error saving file');
    }
  }

  // @HandleError('Error finding file', 'file')
  async findOne(id: string) {
    const file = await this.prisma.fileInstance.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(400, 'Error creating file');
    }

    return file;
  }

  // @HandleError('Error finding file', 'file')
  async findByFilename(filename: string) {
    const file = await this.prisma.fileInstance.findFirst({
      where: { filename },
    });

    if (!file) {
      throw new NotFoundException(400, 'Error creating file');
    }

    return file;
  }

  // @HandleError('Error deleting file', 'file')
  async remove(id: string): Promise<void> {
    const file = await this.findOne(id);

    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.warn(`Could not delete physical file at ${file.path}:`, error);
      throw new BadRequestException(400, 'Error deleting file');
    }

    await this.prisma.fileInstance.delete({
      where: { id },
    });
  }

  // @HandleError('Error processing uploaded file', 'file')
  async processUploadedFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    try {
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      const fileUrl = `${this.configService.getOrThrow<string>(
        'BACKEND_BASE_URL',
      )}/files/${filename}`;

      // ✅ Write buffer to disk
      // if (file.buffer) {
      //   fs.writeFileSync(filePath, file.buffer);
      // } else {
      //   throw new BadRequestException('File buffer missing');
      // }
      console.log({ file });
      if (file.path) {
        const fileBuffer = fs.readFileSync(file.path);
        fs.writeFileSync(filePath, fileBuffer);
      } else {
        throw new BadRequestException('File path missing');
      }

      const createFileDto: CreateFileDto = {
        filename,
        originalFilename: file.originalname,
        path: filePath,
        url: fileUrl,
        mimeType: file.mimetype,
        fileType: file.mimetype.split('/')[0],
        size: file.size,
      };

      return this.create(createFileDto);
    } catch (err) {
      this.logger.error('Error processing uploaded file', err);
      throw new BadRequestException('Error processing uploaded file');
    }
  }

  async saveFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    try {
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const filename = `${fileId}${fileExt}`;

      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      const fileUrl = `${process.env.BACKEND_BASE_URL}/uploads/${filename}`;

      // Save file from buffer (Multer memory storage) or temp path
      if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        const fileBuffer = fs.readFileSync(file.path);
        fs.writeFileSync(filePath, fileBuffer);
      } else {
        throw new BadRequestException('File buffer or path missing');
      }

      return {
        filename,
        originalFilename: file.originalname,
        path: filePath,
        url: fileUrl,
        mimeType: file.mimetype,
        fileType: file.mimetype.split('/')[0],
        size: file.size,
      };
    } catch (error) {
      this.logger.error('Error saving uploaded file', error);
      throw new BadRequestException('Error saving uploaded file');
    }
  }
}
