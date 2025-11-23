import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull, Or } from 'typeorm';
import { ShopItem } from './shop-item.entity';
import { CreateShopItemDto } from './dtos/create-shop-item.dto';
import { UpdateShopItemDto } from './dtos/update-shop-item.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import {
  ShopItemsListResponseDto,
  ShopItemWithoutTemplate,
} from './dtos/responses/shop-items-list-response.dto';
import { ShopItemPurchaseResponseDto } from './dtos/responses/shop-item-purchase-response.dto';
import { ItemTemplate } from '../item-template/item-template.entity';
import { User } from '../user/user.entity';
import { UserGuard } from '../user-guard/user-guard.entity';
import { UserAccessory } from '../user-accessory/user-accessory.entity';
import { ItemTemplateType } from '../item-template/enums/item-template-type.enum';
import { Currency } from '../../common/enums/currency.enum';
import { ShopItemStatus } from './enums/shop-item-status.enum';
import { Settings } from '../../config/setting.config';
import { SettingKey } from '../setting/enums/setting-key.enum';
import { UserBoost } from '../user-boost/user-boost.entity';
import { UserBoostType } from '../user-boost/enums/user-boost-type.enum';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShopItemService {
  constructor(
    @InjectRepository(ShopItem)
    private readonly shopItemRepository: Repository<ShopItem>,
    @InjectRepository(ItemTemplate)
    private readonly itemTemplateRepository: Repository<ItemTemplate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGuard)
    private readonly userGuardRepository: Repository<UserGuard>,
    @InjectRepository(UserAccessory)
    private readonly userAccessoryRepository: Repository<UserAccessory>,
    @InjectRepository(UserBoost)
    private readonly userBoostRepository: Repository<UserBoost>,
  ) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<ShopItem>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.shopItemRepository.findAndCount({
      relations: ['item_template'],
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findAvailable(): Promise<ShopItemsListResponseDto> {
    const shopItems = await this.shopItemRepository.find({
      where: { status: ShopItemStatus.IN_STOCK },
      relations: ['item_template'],
      order: { created_at: 'DESC' },
    });

    const categories: Record<string, ShopItemWithoutTemplate[]> = {};

    for (const item of shopItems) {
      const category = item.item_template?.type || 'other';

      if (!categories[category]) {
        categories[category] = [];
      }

      categories[category].push({
        id: item.id,
        name: item.name,
        description: item.item_template?.name || '',
        price: item.price,
        image_path: item.image_path || '',
        category: category,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });
    }

    return { categories };
  }

  async findOne(id: number): Promise<ShopItem> {
    const shopItem = await this.shopItemRepository.findOne({
      where: { id },
      relations: ['item_template'],
    });

    if (!shopItem) {
      throw new NotFoundException(`ShopItem with ID ${id} not found`);
    }

    return shopItem;
  }

  private saveShopItemImage(file?: Express.Multer.File): string | null {
    if (!file) {
      return null;
    }

    const uploadDir = path.join(process.cwd(), 'data', 'shop-item-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `shop-item-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return path.join('data', 'shop-item-images', fileName).replace(/\\/g, '/');
  }

  private deleteShopItemImage(imagePath: string): void {
    if (imagePath && imagePath.startsWith('data/shop-item-images/')) {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  }

  async create(
    createShopItemDto: CreateShopItemDto,
    image?: Express.Multer.File,
  ): Promise<ShopItem> {
    const itemTemplate = await this.itemTemplateRepository.findOne({
      where: { id: createShopItemDto.item_template_id },
    });

    if (!itemTemplate) {
      throw new NotFoundException(
        `ItemTemplate with ID ${createShopItemDto.item_template_id} not found`,
      );
    }

    const imagePath = this.saveShopItemImage(image);
    const shopItem = this.shopItemRepository.create({
      name: createShopItemDto.name,
      currency: createShopItemDto.currency,
      price: createShopItemDto.price,
      status: createShopItemDto.status,
      image_path: imagePath,
      item_template_id: createShopItemDto.item_template_id,
      item_template: itemTemplate,
    });

    return this.shopItemRepository.save(shopItem);
  }

  async update(
    id: number,
    updateShopItemDto: UpdateShopItemDto,
    image?: Express.Multer.File,
  ): Promise<ShopItem> {
    const shopItem = await this.shopItemRepository.findOne({
      where: { id },
      relations: ['item_template'],
    });

    if (!shopItem) {
      throw new NotFoundException(`ShopItem with ID ${id} not found`);
    }

    if (image) {
      if (shopItem.image_path) {
        this.deleteShopItemImage(shopItem.image_path);
      }
      const imagePath = this.saveShopItemImage(image);
      updateShopItemDto = {
        ...updateShopItemDto,
        image_path: imagePath,
      } as UpdateShopItemDto;
    }

    if (updateShopItemDto.item_template_id) {
      const itemTemplate = await this.itemTemplateRepository.findOne({
        where: { id: updateShopItemDto.item_template_id },
      });

      if (!itemTemplate) {
        throw new NotFoundException(
          `ItemTemplate with ID ${updateShopItemDto.item_template_id} not found`,
        );
      }

      shopItem.item_template_id = updateShopItemDto.item_template_id;
      shopItem.item_template = itemTemplate;
    }

    Object.assign(shopItem, {
      name: updateShopItemDto.name,
      currency: updateShopItemDto.currency,
      price: updateShopItemDto.price,
      status: updateShopItemDto.status,
      image_path: updateShopItemDto.image_path,
    });

    return this.shopItemRepository.save(shopItem);
  }

  async remove(id: number): Promise<void> {
    const shopItem = await this.shopItemRepository.findOne({ where: { id } });

    if (!shopItem) {
      throw new NotFoundException(`ShopItem with ID ${id} not found`);
    }

    if (shopItem.image_path) {
      this.deleteShopItemImage(shopItem.image_path);
    }

    await this.shopItemRepository.remove(shopItem);
  }

  async purchase(
    userId: number,
    accessoryId: number,
  ): Promise<ShopItemPurchaseResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const shopItem = await this.shopItemRepository.findOne({
      where: { id: accessoryId },
      relations: ['item_template'],
    });

    if (!shopItem) {
      throw new NotFoundException('ShopItem not found');
    }

    if (shopItem.currency !== Currency.VIRTUAL) {
      throw new BadRequestException(
        'This endpoint only supports virtual currency purchases. Use VK payments for voices purchases.',
      );
    }

    if (shopItem.status !== ShopItemStatus.IN_STOCK) {
      throw new BadRequestException('ShopItem is not available');
    }

    if (Number(user.money) < shopItem.price) {
      throw new BadRequestException('Insufficient funds');
    }

    user.money = Number(user.money) - shopItem.price;

    const itemTemplate = shopItem.item_template;

    if (itemTemplate.type === ItemTemplateType.GUARD) {
      const guardStrength = parseInt(itemTemplate.value, 10);
      const guard = this.userGuardRepository.create({
        name: `Guard #${Date.now()}`,
        strength: guardStrength,
        is_first: false,
        user,
      });
      const createdGuard = await this.userGuardRepository.save(guard);
      await this.userRepository.save(user);
      return { user, created_guard: createdGuard };
    } else if (itemTemplate.type === ItemTemplateType.SHIELD) {
      const userAccessory = this.userAccessoryRepository.create({
        name: shopItem.name,
        user,
        item_template: itemTemplate,
      });
      const createdUserAccessory =
        await this.userAccessoryRepository.save(userAccessory);
      await this.userRepository.save(user);
      return { user, user_accessory: createdUserAccessory };
    } else if (
      itemTemplate.type === ItemTemplateType.REWARD_DOUBLING ||
      itemTemplate.type === ItemTemplateType.COOLDOWN_HALVING
    ) {
      const boostType =
        itemTemplate.type === ItemTemplateType.REWARD_DOUBLING
          ? UserBoostType.REWARD_DOUBLING
          : UserBoostType.COOLDOWN_HALVING;

      const boostHours = parseInt(itemTemplate.value, 10);
      const now = new Date();

      const existingActiveBoost = await this.userBoostRepository.findOne({
        where: {
          user: { id: user.id },
          type: boostType,
          end_time: Or(MoreThan(now), IsNull()),
        },
      });

      let boostEndTime: Date;
      let userBoost: UserBoost;

      if (
        existingActiveBoost &&
        existingActiveBoost.end_time &&
        existingActiveBoost.end_time > now
      ) {
        boostEndTime = new Date(
          existingActiveBoost.end_time.getTime() + boostHours * 60 * 60 * 1000,
        );
        existingActiveBoost.end_time = boostEndTime;
        userBoost = await this.userBoostRepository.save(existingActiveBoost);
      } else {
        boostEndTime = new Date(now.getTime() + boostHours * 60 * 60 * 1000);
        userBoost = this.userBoostRepository.create({
          type: boostType,
          end_time: boostEndTime,
          user,
        });
        userBoost = await this.userBoostRepository.save(userBoost);
      }

      await this.userRepository.save(user);
      return { user, user_boost: userBoost };
    } else if (
      itemTemplate.type === ItemTemplateType.NICKNAME_COLOR ||
      itemTemplate.type === ItemTemplateType.NICKNAME_ICON ||
      itemTemplate.type === ItemTemplateType.AVATAR_FRAME
    ) {
      const userAccessory = this.userAccessoryRepository.create({
        name: shopItem.name,
        user,
        item_template: itemTemplate,
      });
      const createdUserAccessory =
        await this.userAccessoryRepository.save(userAccessory);
      await this.userRepository.save(user);
      return { user, user_accessory: createdUserAccessory };
    } else {
      const userAccessory = this.userAccessoryRepository.create({
        name: shopItem.name,
        user,
        item_template: itemTemplate,
      });
      const createdUserAccessory =
        await this.userAccessoryRepository.save(userAccessory);
      await this.userRepository.save(user);
      return { user, user_accessory: createdUserAccessory };
    }
  }
}
