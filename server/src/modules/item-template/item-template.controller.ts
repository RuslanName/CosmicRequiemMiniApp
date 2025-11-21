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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { ItemTemplateService } from './item-template.service';
import { ItemTemplate } from './item-template.entity';
import { CreateItemTemplateDto } from './dtos/create-item-template.dto';
import { UpdateItemTemplateDto } from './dtos/update-item-template.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  CacheTTL,
  CacheKey,
  InvalidateCache,
} from '../../common/decorators/cache.decorator';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';

@ApiTags('ItemTemplate')
@Controller('item-templates')
@UseGuards(AdminJwtAuthGuard)
@ApiCookieAuth()
export class ItemTemplateController {
  constructor(private readonly itemTemplateService: ItemTemplateService) {}

  @Get()
  @CacheTTL(180)
  @CacheKey('item-template:list:page::page:limit::limit')
  @ApiOperation({ summary: 'Получить все шаблоны предметов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            name: 'Red Nickname',
            type: 'nickname_color',
            value: 'red',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<{
    data: ItemTemplate[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.itemTemplateService.findAll(paginationDto);
  }

  @Get(':id')
  @CacheTTL(300)
  @CacheKey('item-template::id')
  @ApiOperation({ summary: 'Получить шаблон предмета по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        name: 'Red Nickname',
        type: 'nickname_color',
        value: 'red',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Шаблон предмета не найден' })
  async findOne(@Param('id') id: string): Promise<ItemTemplate> {
    return this.itemTemplateService.findOne(+id);
  }

  @Post()
  @InvalidateCache('item-template:list:*')
  @ApiOperation({ summary: 'Создать новый шаблон предмета' })
  @ApiBody({ type: CreateItemTemplateDto })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 1,
        name: 'Red Nickname',
        type: 'nickname_color',
        value: 'red',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Invalid value for item template type',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(
    @Body() createItemTemplateDto: CreateItemTemplateDto,
  ): Promise<ItemTemplate> {
    return this.itemTemplateService.create(createItemTemplateDto);
  }

  @Patch(':id')
  @InvalidateCache('item-template::id', 'item-template:list:*')
  @ApiOperation({ summary: 'Обновить шаблон предмета' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateItemTemplateDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        name: 'Red Nickname',
        type: 'nickname_color',
        value: 'red',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Шаблон предмета не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateItemTemplateDto: UpdateItemTemplateDto,
  ): Promise<ItemTemplate> {
    return this.itemTemplateService.update(+id, updateItemTemplateDto);
  }

  @Delete(':id')
  @InvalidateCache('item-template::id', 'item-template:list:*')
  @ApiOperation({ summary: 'Удалить шаблон предмета' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Item template deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Шаблон предмета не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.itemTemplateService.remove(+id);
  }
}
