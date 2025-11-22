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
import { UserGuardService } from './user-guard.service';
import { UserGuard } from './user-guard.entity';
import { CreateUserGuardDto } from './dtos/create-user-guard.dto';
import { UpdateUserGuardDto } from './dtos/update-user-guard.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';

@ApiTags('UserGuard')
@Controller('user-guards')
@UseGuards(AdminJwtAuthGuard)
@ApiCookieAuth()
export class UserGuardController {
  constructor(private readonly userGuardService: UserGuardService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех стражей с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(@Query() paginationDto: PaginationDto): Promise<{
    data: UserGuard[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.userGuardService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить стража по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Страж не найден' })
  async findOne(@Param('id') id: string): Promise<UserGuard> {
    return this.userGuardService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать нового стража' })
  @ApiBody({ type: CreateUserGuardDto })
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(
    @Body() createUserGuardDto: CreateUserGuardDto,
  ): Promise<UserGuard> {
    return this.userGuardService.create(createUserGuardDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить стража' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateUserGuardDto })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Страж не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateUserGuardDto: UpdateUserGuardDto,
  ): Promise<UserGuard> {
    return this.userGuardService.update(+id, updateUserGuardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить стража' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Страж не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.userGuardService.remove(+id);
  }
}
