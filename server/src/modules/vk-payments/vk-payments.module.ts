import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VKPaymentsController } from './vk-payments.controller';
import { VKPaymentsService } from './vk-payments.service';
import { User } from '../user/user.entity';
import { ShopItem } from '../shop-item/shop-item.entity';
import { ItemTemplate } from '../item-template/item-template.entity';
import { UserGuard } from '../user-guard/user-guard.entity';
import { UserAccessory } from '../user-accessory/user-accessory.entity';
import { UserBoost } from '../user-boost/user-boost.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ShopItem,
      ItemTemplate,
      UserGuard,
      UserAccessory,
      UserBoost,
    ]),
  ],
  controllers: [VKPaymentsController],
  providers: [VKPaymentsService],
  exports: [VKPaymentsService],
})
export class VKPaymentsModule {}
