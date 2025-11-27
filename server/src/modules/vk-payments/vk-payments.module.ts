import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VKPaymentsController } from './vk-payments.controller';
import { VKPaymentsService } from './vk-payments.service';
import { User } from '../user/user.entity';
import { ShopItem } from '../shop-item/shop-item.entity';
import { Kit } from '../kit/kit.entity';
import { ItemTemplate } from '../item-template/item-template.entity';
import { UserGuard } from '../user-guard/user-guard.entity';
import { UserAccessory } from '../user-accessory/user-accessory.entity';
import { UserBoost } from '../user-boost/user-boost.entity';
import { KitModule } from '../kit/kit.module';
import { UserBoostModule } from '../user-boost/user-boost.module';
import { ShopItemModule } from '../shop-item/shop-item.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ShopItem,
      Kit,
      ItemTemplate,
      UserGuard,
      UserAccessory,
      UserBoost,
    ]),
    KitModule,
    UserBoostModule,
    ShopItemModule,
    UserModule,
  ],
  controllers: [VKPaymentsController],
  providers: [VKPaymentsService],
  exports: [VKPaymentsService],
})
export class VKPaymentsModule {}
