import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/types/request.types';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Express } from 'express';
import { ShopItemService } from './shop-item.service';
import { ShopItem } from './shop-item.entity';
import { CreateShopItemDto } from './dtos/create-shop-item.dto';
import { UpdateShopItemDto } from './dtos/update-shop-item.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PurchaseShopItemDto } from './dtos/purchase-shop-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import {
  CacheTTL,
  CacheKey,
  InvalidateCache,
} from '../../common/decorators/cache.decorator';

@ApiTags('ShopItem')
@Controller('shop-items')
export class ShopItemController {
  constructor(private readonly shopItemService: ShopItemService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(180)
  @CacheKey('shop-item:list:page::page:limit::limit')
  @ApiOperation({ summary: 'Получить все аксессуары с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: ShopItem[]; total: number; page: number; limit: number }> {
    return this.shopItemService.findAll(paginationDto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheTTL(60)
  @CacheKey('shop-item:public-list')
  @ApiOperation({
    summary: 'Получить список доступных товаров по категориям (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getShopItemsList(): Promise<{
    categories: Record<string, Omit<ShopItem, 'item_template'>[]>;
  }> {
    return this.shopItemService.findAvailable();
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(300)
  @CacheKey('shop-item::id')
  @ApiOperation({ summary: 'Получить аксессуар по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Аксессуар не найден' })
  async findOne(@Param('id') id: string): Promise<ShopItem> {
    return this.shopItemService.findOne(+id);
  }

  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @InvalidateCache('shop-item:list:*')
  @ApiOperation({ summary: 'Создать новый товар магазина' })
  @ApiBody({ type: CreateShopItemDto })
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(
    @Body() createShopItemDto: CreateShopItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ShopItem> {
    return this.shopItemService.create(createShopItemDto, image);
  }

  @Patch(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @InvalidateCache('shop-item::id', 'shop-item:list:*')
  @ApiOperation({ summary: 'Обновить товар магазина' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateShopItemDto })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateShopItemDto: UpdateShopItemDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<ShopItem> {
    return this.shopItemService.update(+id, updateShopItemDto, image);
  }

  @Delete(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @InvalidateCache('shop-item::id', 'shop-item:list:*')
  @ApiOperation({ summary: 'Удалить аксессуар' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Аксессуар не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.shopItemService.remove(+id);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Купить аксессуар (Для Mini App)' })
  @ApiBody({ type: PurchaseShopItemDto })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({
    status: 400,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 404,
    description: 'Аксессуар или пользователь не найден',
  })
  async purchase(
    @Request() req: AuthenticatedRequest,
    @Body() purchaseShopItemDto: PurchaseShopItemDto,
  ) {
    return this.shopItemService.purchase(
      req.user.id,
      purchaseShopItemDto.shop_item_id,
    );
  }
}
