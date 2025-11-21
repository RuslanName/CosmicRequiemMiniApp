import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей с пагинацией' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список пользователей с пагинацией',
  })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get('rating')
  @ApiOperation({ summary: 'Получить рейтинг пользователей (Для Mini App)' })
  @ApiResponse({
    status: 200,
    description: 'Возвращает рейтинг пользователей с пагинацией',
  })
  async getRating(@Query() paginationDto: PaginationDto) {
    return this.userService.getRating(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Возвращает пользователя' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить профиль текущего пользователя (Для Mini App)',
  })
  @ApiResponse({ status: 200, description: 'Возвращает профиль пользователя' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findMe(@Request() req) {
    return this.userService.findMe(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Post('me/training')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Тренировка стражей (Для Mini App)' })
  @ApiResponse({
    status: 200,
    description: 'Тренировка успешно выполнена',
    schema: {
      example: {
        user: {
          id: 1,
          money: 4900,
          last_training_time: '2024-01-02T08:00:00.000Z',
        },
        training_cost: 100,
        power_increase: 10,
        new_power: 110,
        training_cooldown_end: '2024-01-02T08:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Недостаточно средств или кулдаун активен',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async training(@Request() req) {
    return this.userService.training(req.user.id);
  }

  @Post('me/contract')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Выполнить контракт (Для Mini App)' })
  @ApiResponse({
    status: 200,
    description: 'Контракт успешно выполнен',
    schema: {
      example: {
        user: {
          id: 1,
          money: 5100,
          last_contract_time: '2024-01-02T08:00:00.000Z',
        },
        contract_income: 100,
        contract_cooldown_end: '2024-01-02T08:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Кулдаун активен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async contract(@Request() req) {
    return this.userService.contract(req.user.id);
  }

  @Get('me/boosts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить бусты пользователя (Для Mini App)' })
  @ApiResponse({ status: 200, description: 'Возвращает список бустов' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getUserBoosts(@Request() req) {
    return this.userService.getUserBoosts(req.user.id);
  }

  @Get('me/accessories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить аксессуары пользователя (Для Mini App)' })
  @ApiResponse({ status: 200, description: 'Возвращает список аксессуаров' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getUserAccessories(@Request() req) {
    return this.userService.getUserAccessories(req.user.id);
  }

  @Get('me/accessories/equipped')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить экипированные аксессуары пользователя (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    description: 'Возвращает список экипированных аксессуаров',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getEquippedAccessories(@Request() req) {
    return this.userService.getEquippedAccessories(req.user.id);
  }

  @Post('me/accessories/:id/equip')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Экипировать аксессуар (Для Mini App)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Аксессуар успешно экипирован' })
  @ApiResponse({
    status: 400,
    description: 'Аксессуар не может быть экипирован',
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Аксессуар не найден' })
  async equipAccessory(@Request() req, @Param('id') id: string) {
    return this.userService.equipAccessory(req.user.id, +id);
  }

  @Post('me/accessories/:id/unequip')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Снять аксессуар (Для Mini App)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Аксессуар успешно снят' })
  @ApiResponse({ status: 400, description: 'Аксессуар не может быть снят' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Аксессуар не найден' })
  async unequipAccessory(@Request() req, @Param('id') id: string) {
    return this.userService.unequipAccessory(req.user.id, +id);
  }
}
