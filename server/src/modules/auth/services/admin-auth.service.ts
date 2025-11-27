import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/admin.entity';
import { AdminRefreshToken } from '../entities/admin-refresh-token.entity';
import { AdminLoginDto } from '../dtos/admin-login.dto';
import * as bcrypt from 'bcrypt';
import { ENV } from '../../../config/constants';
import { AdminAuthValidateResponseDto } from '../dtos/responses/admin-auth-validate-response.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(AdminRefreshToken)
    private readonly adminRefreshTokenRepository: Repository<AdminRefreshToken>,
  ) {}

  async validateAdmin(
    loginDto: AdminLoginDto,
  ): Promise<AdminAuthValidateResponseDto> {
    const { username, password } = loginDto;

    const admin = await this.adminRepository.findOne({
      where: { username },
      relations: ['user'],
    });

    if (!admin) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const payload = {
      sub: admin.user.id,
      adminId: admin.id,
      type: 'admin',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: ENV.JWT_ADMIN_ACCESS_SECRET,
      expiresIn: ENV.JWT_ADMIN_ACCESS_EXPIRES_IN as any,
    });

    const refreshTokenPayload = {
      sub: admin.user.id,
      adminId: admin.id,
      type: 'admin_refresh',
    };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: ENV.JWT_ADMIN_REFRESH_SECRET,
      expiresIn: ENV.JWT_ADMIN_REFRESH_EXPIRES_IN as any,
    });

    const expiresAt = new Date();
    const refreshExpiresIn = this.parseExpiresIn(
      ENV.JWT_ADMIN_REFRESH_EXPIRES_IN,
    );
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshExpiresIn);

    const refreshTokenEntity = this.adminRefreshTokenRepository.create({
      token: refreshToken,
      admin_id: admin.id,
      expires_at: expiresAt,
    });
    await this.adminRefreshTokenRepository.save(refreshTokenEntity);

    return { token: accessToken, refreshToken, admin };
  }

  async refreshAdminTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: ENV.JWT_ADMIN_REFRESH_SECRET,
      });

      if (payload.type !== 'admin_refresh') {
        throw new UnauthorizedException('Неверный тип токена');
      }

      const tokenEntity = await this.adminRefreshTokenRepository.findOne({
        where: { token: refreshToken },
        relations: ['admin', 'admin.user'],
      });

      if (!tokenEntity || tokenEntity.expires_at < new Date()) {
        throw new UnauthorizedException(
          'Refresh токен истек или недействителен',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: payload.adminId },
        relations: ['user'],
      });

      if (!admin) {
        throw new UnauthorizedException('Администратор не найден');
      }

      await this.adminRefreshTokenRepository.remove(tokenEntity);

      const newPayload = {
        sub: admin.user.id,
        adminId: admin.id,
        type: 'admin',
      };
      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: ENV.JWT_ADMIN_ACCESS_SECRET,
        expiresIn: ENV.JWT_ADMIN_ACCESS_EXPIRES_IN as any,
      });

      const newRefreshTokenPayload = {
        sub: admin.user.id,
        adminId: admin.id,
        type: 'admin_refresh',
      };
      const newRefreshToken = this.jwtService.sign(newRefreshTokenPayload, {
        secret: ENV.JWT_ADMIN_REFRESH_SECRET,
        expiresIn: ENV.JWT_ADMIN_REFRESH_EXPIRES_IN as any,
      });

      const expiresAt = new Date();
      const refreshExpiresIn = this.parseExpiresIn(
        ENV.JWT_ADMIN_REFRESH_EXPIRES_IN,
      );
      expiresAt.setSeconds(expiresAt.getSeconds() + refreshExpiresIn);

      const newRefreshTokenEntity = this.adminRefreshTokenRepository.create({
        token: newRefreshToken,
        admin_id: admin.id,
        expires_at: expiresAt,
      });
      await this.adminRefreshTokenRepository.save(newRefreshTokenEntity);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  async revokeAdminRefreshToken(refreshToken: string): Promise<void> {
    const tokenEntity = await this.adminRefreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (tokenEntity) {
      await this.adminRefreshTokenRepository.remove(tokenEntity);
    }
  }

  async revokeAllAdminTokens(adminId: number): Promise<void> {
    await this.adminRefreshTokenRepository.delete({ admin_id: adminId });
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 30 * 24 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 30 * 24 * 60 * 60;
    }
  }

  async createSystemAdmin(
    vkId: number,
    username: string,
    password: string,
    userId: number,
  ): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { username },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = this.adminRepository.create({
      username,
      password_hash: passwordHash,
      is_system_admin: true,
      user_id: userId,
    });

    return await this.adminRepository.save(admin);
  }

  async findAdminByUserId(userId: number): Promise<Admin | null> {
    return await this.adminRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }
}
