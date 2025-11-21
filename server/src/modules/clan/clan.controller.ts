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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ClanService } from './clan.service';
import { CreateClanDto } from './dtos/create-clan.dto';
import { UpdateClanDto } from './dtos/update-clan.dto';
import { DeclareWarDto } from './dtos/declare-war.dto';
import { AttackEnemyDto } from './dtos/attack-enemy.dto';
import { CreateClanApplicationDto } from './dtos/create-clan-application.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Clan')
@Controller('clans')
export class ClanController {
  constructor(private readonly clanService: ClanService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все кланы с пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список кланов с пагинацией',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.clanService.findAll(paginationDto);
  }

  @Get('rating')
  @ApiOperation({ summary: 'Получить рейтинг кланов (Для Mini App)' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает рейтинг кланов с пагинацией',
  })
  async getRating(@Query() paginationDto?: PaginationDto) {
    return this.clanService.getClanRating(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить клан по ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Возвращает клан' })
  @ApiResponse({ status: 404, description: 'Клан не найден' })
  async findOne(@Param('id') id: string) {
    return this.clanService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Создать клан' })
  @ApiBody({ type: CreateClanDto })
  @ApiResponse({ status: 201, description: 'Клан успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(
    @Request() req,
    @Body() createClanDto: CreateClanDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.clanService.create(createClanDto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Обновить клан' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateClanDto })
  @ApiResponse({ status: 200, description: 'Клан успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Клан не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(
    @Param('id') id: string,
    @Body() updateClanDto: UpdateClanDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.clanService.update(+id, updateClanDto, image);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить клан' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Клан успешно удален' })
  @ApiResponse({ status: 404, description: 'Клан не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id') id: string) {
    return this.clanService.remove(+id);
  }

  @Get('me/leader')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить клан текущего пользователя (Для Mini App)',
  })
  @ApiResponse({ status: 200, description: 'Возвращает клан лидера' })
  @ApiResponse({
    status: 404,
    description: 'Клан не найден или пользователь не является лидером',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getLeaderClan(@Request() req) {
    return this.clanService.getLeaderClan(req.user.id);
  }

  @Get('me/clan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить клан текущего пользователя (Для Mini App)',
  })
  @ApiResponse({ status: 200, description: 'Возвращает клан пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не в клане' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getUserClan(@Request() req) {
    return this.clanService.getUserClan(req.user.id);
  }

  @Get('me/available-for-war')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить доступные кланы для объявления войны (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список доступных кланов',
  })
  @ApiResponse({ status: 400, description: 'Кулдаун на войну еще активен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не является лидером клана',
  })
  async getAvailableClansForWar(@Request() req) {
    return this.clanService.getAvailableClansForWar(req.user.id);
  }

  @Post('declare-war')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Объявить войну клану (Для Mini App)' })
  @ApiBody({ type: DeclareWarDto })
  @ApiResponse({ status: 201, description: 'Война успешно объявлена' })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные или кулдаун активен',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Целевой клан не найден' })
  async declareWar(@Request() req, @Body() declareWarDto: DeclareWarDto) {
    return this.clanService.declareWar(
      req.user.id,
      declareWarDto.target_clan_id,
    );
  }

  @Get('me/enemy-members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить членов вражеских кланов (Для Mini App)' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список вражеских членов',
  })
  @ApiResponse({ status: 400, description: 'Пользователь не в клане' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getEnemyClanMembers(@Request() req) {
    return this.clanService.getEnemyClanMembers(req.user.id);
  }

  @Post('attack-enemy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Атаковать вражеского пользователя (Для Mini App)' })
  @ApiBody({ type: AttackEnemyDto })
  @ApiResponse({ status: 200, description: 'Атака выполнена' })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные или кулдаун активен',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Целевой пользователь не найден' })
  async attackEnemy(@Request() req, @Body() attackEnemyDto: AttackEnemyDto) {
    return this.clanService.attackEnemy(
      req.user.id,
      attackEnemyDto.target_user_id,
    );
  }

  @Post('leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Покинуть клан (Для Mini App)' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно покинул клан',
  })
  @ApiResponse({
    status: 400,
    description: 'Пользователь не в клане или является лидером',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async leaveClan(@Request() req) {
    return this.clanService.leaveClan(req.user.id);
  }

  @Post('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Подать заявку на вступление в клан (Для Mini App)',
  })
  @ApiBody({ type: CreateClanApplicationDto })
  @ApiResponse({ status: 201, description: 'Заявка успешно создана' })
  @ApiResponse({
    status: 400,
    description: 'Неверные данные или заявка уже существует',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Клан не найден' })
  async createApplication(
    @Request() req,
    @Body() createClanApplicationDto: CreateClanApplicationDto,
  ) {
    return this.clanService.createApplication(
      req.user.id,
      createClanApplicationDto.clan_id,
    );
  }

  @Get('me/applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить заявки на вступление в клан (Для Mini App)',
  })
  @ApiResponse({ status: 200, description: 'Возвращает список заявок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не является лидером клана',
  })
  async getApplications(@Request() req) {
    return this.clanService.getApplications(req.user.id);
  }

  @Post('applications/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Принять заявку на вступление в клан (Для Mini App)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Заявка успешно принята' })
  @ApiResponse({ status: 400, description: 'Заявка не может быть принята' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async acceptApplication(@Request() req, @Param('id') id: string) {
    return this.clanService.acceptApplication(req.user.id, +id);
  }

  @Post('applications/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Отклонить заявку на вступление в клан (Для Mini App)',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Заявка успешно отклонена' })
  @ApiResponse({ status: 400, description: 'Заявка не может быть отклонена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  async rejectApplication(@Request() req, @Param('id') id: string) {
    return this.clanService.rejectApplication(req.user.id, +id);
  }

  @Get(':id/wars/active')
  @ApiOperation({ summary: 'Получить активные войны клана (Для Mini App)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Возвращает список активных войн' })
  async getActiveWars(@Param('id') id: string) {
    return this.clanService.getActiveWars(+id);
  }

  @Get(':id/wars')
  @ApiOperation({ summary: 'Получить все войны клана (Для Mini App)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Возвращает список всех войн' })
  async getAllWars(@Param('id') id: string) {
    return this.clanService.getAllWars(+id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Получить членов клана (Для Mini App)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Возвращает список членов клана' })
  @ApiResponse({ status: 404, description: 'Клан не найден' })
  async getClanMembers(@Param('id') id: string) {
    return this.clanService.getClanMembers(+id);
  }
}
