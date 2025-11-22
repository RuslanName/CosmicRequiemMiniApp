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
  ApiCookieAuth,
} from '@nestjs/swagger';
import { SettingService } from './services/setting.service';
import { Setting } from './setting.entity';
import { UpdateSettingDto } from './dtos/update-setting.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';

@ApiTags('Setting')
@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить все настройки с пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список настроек с пагинацией',
    type: [Setting],
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Setting>> {
    return this.settingService.findAll(paginationDto);
  }

  @Get('key/:key')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить настройку по ключу' })
  @ApiResponse({ status: 200, description: 'Возвращает настройку по ключу' })
  async findByKey(@Param('key') key: string): Promise<Setting | null> {
    return this.settingService.findByKey(key);
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Получить настройку по ID' })
  @ApiResponse({ status: 200, description: 'Возвращает настройку' })
  async findOne(@Param('id') id: string): Promise<Setting> {
    return this.settingService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Обновить настройку' })
  @ApiResponse({ status: 200, description: 'Возвращает обновленную настройку' })
  async update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ): Promise<Setting> {
    return this.settingService.update(+id, updateSettingDto);
  }
}
