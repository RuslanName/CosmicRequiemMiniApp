import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { Giveaway } from './giveaway.entity';
import { CreateGiveawayDto } from './dtos/create-giveaway.dto';
import { UpdateGiveawayDto } from './dtos/update-giveaway.dto';

@Injectable()
export class GiveawayService {
  constructor(
    @InjectRepository(Giveaway)
    private readonly giveawayRepository: Repository<Giveaway>,
  ) {}

  async findOne(): Promise<Giveaway | null> {
    return this.giveawayRepository.findOne({
      where: {},
      order: { created_at: 'DESC' },
    });
  }

  async findAvailable(): Promise<Giveaway | null> {
    return this.findOne();
  }

  private saveGiveawayImage(file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const uploadDir = path.join(process.cwd(), 'data', 'giveaway-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `giveaway-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return path.join('data', 'giveaway-images', fileName).replace(/\\/g, '/');
  }

  private deleteGiveawayImage(imagePath: string): void {
    if (imagePath && imagePath.startsWith('data/giveaway-images/')) {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  async create(
    createGiveawayDto: CreateGiveawayDto,
    image?: Express.Multer.File,
  ): Promise<Giveaway> {
    const existingGiveaway = await this.giveawayRepository.findOne({
      where: {},
      order: { created_at: 'DESC' },
    });

    if (existingGiveaway) {
      throw new BadRequestException(
        'Giveaway already exists. Only one giveaway can exist at a time. Please update or delete the existing one.',
      );
    }

    const imagePath = image ? this.saveGiveawayImage(image) : null;
    const giveaway = this.giveawayRepository.create({
      ...createGiveawayDto,
      image_path: imagePath,
    });
    return this.giveawayRepository.save(giveaway);
  }

  async update(
    id: number,
    updateGiveawayDto: UpdateGiveawayDto,
    image?: Express.Multer.File,
  ): Promise<Giveaway> {
    const giveaway = await this.giveawayRepository.findOne({ where: { id } });

    if (!giveaway) {
      throw new NotFoundException(`Giveaway with ID ${id} not found`);
    }

    // Если загружено новое изображение, удаляем старое и сохраняем новое
    if (image) {
      if (giveaway.image_path) {
        this.deleteGiveawayImage(giveaway.image_path);
      }
      const imagePath = this.saveGiveawayImage(image);
      updateGiveawayDto = {
        ...updateGiveawayDto,
        image_path: imagePath,
      } as UpdateGiveawayDto;
    }

    Object.assign(giveaway, updateGiveawayDto);
    return this.giveawayRepository.save(giveaway);
  }

  async remove(id: number): Promise<void> {
    const giveaway = await this.giveawayRepository.findOne({ where: { id } });

    if (!giveaway) {
      throw new NotFoundException(`Giveaway with ID ${id} not found`);
    }

    // Удаляем изображение при удалении конкурса
    if (giveaway.image_path) {
      this.deleteGiveawayImage(giveaway.image_path);
    }

    await this.giveawayRepository.remove(giveaway);
  }
}
