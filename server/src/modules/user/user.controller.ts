import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  Query,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/types/request.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  CacheTTL,
  CacheKey,
  InvalidateCache,
} from '../../common/decorators/cache.decorator';
import { UserBoost } from '../user-boost/user-boost.entity';
import { UserAccessory } from '../user-accessory/user-accessory.entity';
import { UserGuard } from '../user-guard/user-guard.entity';
import { EventHistory } from '../event-history/event-history.entity';
import { EquipAccessoryDto } from '../user-accessory/dtos/equip-accessory.dto';
import { AttackPlayerDto } from './dtos/attack-player.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(60)
  @CacheKey('user:list:page::page:limit::limit')
  @ApiOperation({ summary: 'Получить всех пользователей с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            vk_id: 123456789,
            first_name: 'Иван',
            last_name: 'Иванов',
            sex: 2,
            avatar_url: 'https://example.com/avatar.jpg',
            money: 10000,
            strength: 250,
            guards_count: 5,
            equipped_accessories: [],
            referral_link: 'https://vk.com/app123456?start=ref_abc123',
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
    data: (User & {
      strength: number;
      guards_count: number;
      referral_link?: string;
    })[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.userService.findAll(paginationDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Получить текущего аутентифицированного пользователя (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        vk_id: 123456789,
        first_name: 'Иван',
        last_name: 'Иванов',
        sex: 2,
        avatar_url: 'https://example.com/avatar.jpg',
        money: 10000,
        strength: 250,
        guards_count: 5,
        equipped_accessories: [],
        referral_link: 'https://vk.com/app123456?start=ref_abc123',
        contract_income: 275,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findMe(@Request() req: AuthenticatedRequest): Promise<
    User & {
      strength: number;
      guards_count: number;
      equipped_accessories: UserAccessory[];
      referral_link?: string;
      contract_income: number;
    }
  > {
    return this.userService.findMe(req.user.id);
  }

  @Post('training')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Тренировка стражей пользователя (Для Mini App)' })
  @ApiBody({ required: false })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        user: { id: 1, money: 4500 },
        training_cost: 500,
        power_increase: 25,
        new_power: 275,
        training_cooldown_end: '2024-01-01T12:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Training cooldown is still active',
        cooldown_end: '2024-01-01T12:15:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async training(@Request() req: AuthenticatedRequest): Promise<{
    user: User;
    training_cost: number;
    power_increase: number;
    new_power: number;
    training_cooldown_end: Date;
  }> {
    return this.userService.training(req.user.id);
  }

  @Post('contract')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Выполнить контракт для заработка денег (Для Mini App)',
  })
  @ApiBody({ required: false })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        user: { id: 1, money: 5500 },
        contract_income: 275,
        contract_cooldown_end: '2024-01-01T12:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Contract cooldown is still active',
        cooldown_end: '2024-01-01T12:15:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async contract(@Request() req: AuthenticatedRequest): Promise<{
    user: User;
    contract_income: number;
    contract_cooldown_end: Date;
  }> {
    return this.userService.contract(req.user.id);
  }

  @Get('rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheTTL(60)
  @CacheKey('user:rating')
  @ApiOperation({ summary: 'Получить рейтинг пользователей (Для Mini App)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            first_name: 'Иван',
            last_name: 'Иванов',
            strength: 500,
          },
        ],
        total: 100,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getRating(@Query() paginationDto: PaginationDto): Promise<{
    data: (User & {
      strength: number;
      money: number;
      guards_count: number;
      guards: UserGuard[];
    })[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.userService.getRating(paginationDto);
  }

  @Get('attackable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheTTL(60)
  @CacheKey('user:attackable')
  @ApiOperation({
    summary: 'Получить список пользователей для атаки (Для Mini App)',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['top', 'suitable', 'friends'],
    example: 'top',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 2,
            first_name: 'Петр',
            last_name: 'Петров',
            strength: 300,
            referral_link: 'https://vk.com/app123456?start=ref_xyz789',
          },
        ],
        total: 50,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Filter parameter must be one of: top, suitable, friends',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getAttackableUsers(
    @Request() req: AuthenticatedRequest,
    @Query('filter') filter?: 'top' | 'suitable' | 'friends',
    @Query() paginationDto?: PaginationDto,
  ): Promise<{
    data: (User & {
      strength: number;
      money: number;
      guards_count: number;
      guards: UserGuard[];
    })[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (filter && !['top', 'suitable', 'friends'].includes(filter)) {
      throw new BadRequestException(
        'Filter parameter must be one of: top, suitable, friends',
      );
    }
    return this.userService.getAttackableUsers(
      req.user.id,
      filter,
      paginationDto,
    );
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @CacheTTL(120)
  @CacheKey('user::id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        vk_id: 123456789,
        first_name: 'Иван',
        last_name: 'Иванов',
        sex: 2,
        avatar_url: 'https://example.com/avatar.jpg',
        money: 10000,
        strength: 250,
        guards_count: 5,
        equipped_accessories: [],
        referral_link: 'https://vk.com/app123456?start=ref_abc123',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id') id: string): Promise<
    User & {
      strength: number;
      guards_count: number;
      referral_link?: string;
    }
  > {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiCookieAuth()
  @InvalidateCache('user::id', 'user:list:*')
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        vk_id: 123456789,
        first_name: 'Иван',
        last_name: 'Иванов',
        sex: 2,
        avatar_url: 'https://example.com/avatar.jpg',
        money: 10000,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @Get('me/inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Получить инвентарь текущего пользователя (бусты и аксессуары) (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        boosts: [
          {
            id: 1,
            type: 'cooldown_halving',
            end_time: '2024-01-01T12:00:00.000Z',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ],
        accessories: [
          {
            id: 1,
            name: 'Меч силы',
            currency: 'money',
            price: 1000,
            status: 'unequipped',
            created_at: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getInventory(@Request() req: AuthenticatedRequest): Promise<{
    boosts: UserBoost[];
    accessories: UserAccessory[];
  }> {
    return this.userService.getInventory(req.user.id);
  }

  @Get('me/guards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить стражей текущего пользователя (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        example: {
          id: 1,
          name: 'Страж Альфа',
          strength: 150,
          is_first: false,
          user_id: 5,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getMyGuards(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserGuard[]> {
    return this.userService.getUserGuards(req.user.id);
  }

  @Get('me/equipped-accessories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить надетые аксессуары пользователя (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'array',
      items: {
        example: {
          id: 1,
          name: 'Меч силы',
          currency: 'money',
          price: 1000,
          status: 'equipped',
          created_at: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getEquippedAccessories(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserAccessory[]> {
    return this.userService.getEquippedAccessories(req.user.id);
  }

  @Post('equip-accessory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Надеть аксессуар (Для Mini App)' })
  @ApiBody({ type: EquipAccessoryDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        name: 'Меч силы',
        currency: 'money',
        price: 1000,
        status: 'equipped',
        created_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Аксессуар не принадлежит пользователю',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Аксессуар не найден' })
  async equipAccessory(
    @Request() req: AuthenticatedRequest,
    @Body() equipAccessoryDto: EquipAccessoryDto,
  ): Promise<UserAccessory> {
    return this.userService.equipAccessory(
      req.user.id,
      equipAccessoryDto.accessory_id,
    );
  }

  @Post('unequip-accessory/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Снять аксессуар (Для Mini App)' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        name: 'Меч силы',
        currency: 'money',
        price: 1000,
        status: 'unequipped',
        created_at: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Аксессуар не принадлежит пользователю или уже снят',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Аксессуар не найден' })
  async unequipAccessory(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<UserAccessory> {
    return this.userService.unequipAccessory(req.user.id, +id);
  }

  @Get('me/referral-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить реферальную ссылку пользователя (Для Mini App)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        referral_link: 'https://vk.com/app123456?start=ref_abc123...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getReferralLink(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ referral_link: string }> {
    return this.userService.getUserReferralLink(req.user.id);
  }

  @Post('attack')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Атаковать игрока (Для Mini App)' })
  @ApiBody({ type: AttackPlayerDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        win_chance: 65.5,
        is_win: true,
        stolen_money: 1500,
        captured_guards: 2,
        attack_cooldown_end: '2024-01-01T12:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      example: {
        message: 'Active shield on defender, cannot attack',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async attackPlayer(
    @Request() req: AuthenticatedRequest,
    @Body() attackPlayerDto: AttackPlayerDto,
  ): Promise<{
    win_chance: number;
    is_win: boolean;
    stolen_money: number;
    captured_guards: number;
    attack_cooldown_end: Date;
  }> {
    return this.userService.attackPlayer(
      req.user.id,
      attackPlayerDto.target_user_id,
    );
  }

  @Get('me/event-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @CacheTTL(30)
  @ApiOperation({
    summary: 'Получить историю событий пользователя (Для Mini App)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            id: 1,
            type: 'attack',
            user_id: 5,
            stolen_items: [
              {
                id: 1,
                type: 'money',
                amount: 1500,
              },
            ],
            created_at: '2024-01-01T12:00:00.000Z',
          },
        ],
        total: 50,
        page: 1,
        limit: 10,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getEventHistory(
    @Request() req: AuthenticatedRequest,
    @Query() paginationDto?: PaginationDto,
  ): Promise<{
    data: (Omit<EventHistory, 'stolen_items'> & {
      strength: number;
      money: number;
      guards_count: number;
    })[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.userService.getEventHistory(req.user.id, paginationDto);
  }
}
