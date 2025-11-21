import {
  Controller,
  Get,
  Patch,
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
import { SettingService } from './services/setting.service';
import { Setting } from './setting.entity';
import { UpdateSettingDto } from './dtos/update-setting.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  CacheTTL,
  CacheKey,
  InvalidateCache,
} from '../../common/decorators/cache.decorator';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';

@ApiTags('Setting')
@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(3600)
  @CacheKey('setting:list')
  @ApiOperation({ summary: 'Получить все настройки с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            key: 'TRAINING_COOLDOWN',
            value: '900000',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 20,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: Setting[]; total: number; page: number; limit: number }> {
    return this.settingService.findAll(paginationDto);
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(3600)
  @CacheKey('setting::id')
  @ApiOperation({ summary: 'Получить настройку по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        key: 'TRAINING_COOLDOWN',
        value: '900000',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Настройка не найдена' })
  async findOne(@Param('id') id: string): Promise<Setting> {
    return this.settingService.findOne(+id);
  }

  @Get('key/:key')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(3600)
  @CacheKey('setting:key::key')
  @ApiOperation({ summary: 'Получить настройку по ключу' })
  @ApiParam({ name: 'key', type: String, example: 'TRAINING_COOLDOWN' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        key: 'TRAINING_COOLDOWN',
        value: '900000',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Настройка не найдена' })
  async findByKey(@Param('key') key: string): Promise<Setting | null> {
    return this.settingService.findByKey(key);
  }

  @Patch(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @InvalidateCache('setting::id', 'setting:key:*', 'setting:list')
  @ApiOperation({ summary: 'Обновить настройку' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        key: 'TRAINING_COOLDOWN',
        value: '1800000',
        updated_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Настройка не найдена' })
  async update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ): Promise<Setting> {
    return this.settingService.update(+id, updateSettingDto);
  }
}
