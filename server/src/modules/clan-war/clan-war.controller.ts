import {
  Controller,
  Get,
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
import { ClanWarService } from './services/clan-war.service';
import { ClanWar } from './entities/clan-war.entity';
import { UpdateClanWarDto } from './dtos/update-clan-war.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';

@ApiTags('ClanWar')
@Controller('wars')
@UseGuards(AdminJwtAuthGuard)
@ApiCookieAuth()
export class ClanWarController {
  constructor(private readonly clanWarService: ClanWarService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все войны с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            clan_1: { id: 1, name: 'Elite Warriors' },
            clan_2: { id: 2, name: 'Dark Knights' },
            start_time: '2024-01-01T00:00:00.000Z',
            end_time: '2024-01-01T06:00:00.000Z',
            status: 'in_progress',
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ data: ClanWar[]; total: number; page: number; limit: number }> {
    return this.clanWarService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить войну по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        clan_1: { id: 1, name: 'Elite Warriors' },
        clan_2: { id: 2, name: 'Dark Knights' },
        start_time: '2024-01-01T00:00:00.000Z',
        end_time: '2024-01-01T06:00:00.000Z',
        status: 'in_progress',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Война не найдена' })
  async findOne(@Param('id') id: string): Promise<ClanWar> {
    return this.clanWarService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить войну' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateClanWarDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        clan_1: { id: 1, name: 'Elite Warriors' },
        clan_2: { id: 2, name: 'Dark Knights' },
        status: 'completed',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Война не найдена' })
  async update(
    @Param('id') id: string,
    @Body() updateClanWarDto: UpdateClanWarDto,
  ): Promise<ClanWar> {
    return this.clanWarService.update(+id, updateClanWarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить войну' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Clan war deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Война не найдена' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.clanWarService.remove(+id);
  }
}
