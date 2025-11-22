import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../common/types/request.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { UpdateAdminDto } from './dtos/update-admin.dto';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { AdminJwtAuthGuard } from '../auth/guards/admin-jwt-auth.guard';
import { PaginatedResponseDto } from '../../common/dtos/paginated-response.dto';
import { AdminDeleteResponseDto } from './dtos/responses/admin-delete-response.dto';

@ApiTags('Admins')
@Controller('admins')
@UseGuards(AdminJwtAuthGuard)
@ApiCookieAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех администраторов с пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    type: [Admin],
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Admin>> {
    return this.adminService.findAll(paginationDto);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Получить текущего аутентифицированного администратора',
  })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Администратор не найден' })
  async findMe(@Request() req: AuthenticatedRequest): Promise<Admin> {
    if (!req.user.adminId) {
      throw new NotFoundException('Admin ID not found in request');
    }
    return this.adminService.findOne(req.user.adminId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить администратора по ID' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Администратор не найден' })
  async findOne(@Param('id') id: string): Promise<Admin> {
    return this.adminService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать нового администратора' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    status: 201,
  })
  @ApiResponse({
    status: 400,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
    return this.adminService.create(createAdminDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить администратора' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    status: 200,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Администратор не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить администратора' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    type: AdminDeleteResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Администратор не найден' })
  async remove(@Param('id') id: string): Promise<AdminDeleteResponseDto> {
    await this.adminService.remove(+id);
    return {
      success: true,
      message: 'Admin deleted successfully',
    };
  }
}
