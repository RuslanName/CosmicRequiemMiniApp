import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../admin/admin.entity';
import { User } from '../../user/user.entity';
import { ENV } from '../../../config/constants';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies && req.cookies['admin_access_token']) {
          return req.cookies['admin_access_token'];
        }
        if (req && req.cookies && req.cookies['admin_token']) {
          return req.cookies['admin_token'];
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: ENV.JWT_ADMIN_ACCESS_SECRET,
    });
  }

  async validate(payload: { sub: number; adminId: number; type: string }) {
    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Неверный тип токена');
    }

    const admin = await this.adminRepository.findOne({
      where: { id: payload.adminId },
      relations: ['user'],
    });

    if (!admin) {
      throw new UnauthorizedException('Администратор не найден');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      adminId: admin.id,
      username: admin.username,
      isSystemAdmin: admin.is_system_admin,
    };
  }
}
