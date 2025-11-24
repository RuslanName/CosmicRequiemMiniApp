import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemTemplate } from './item-template.entity';
import { ItemTemplateController } from './item-template.controller';
import { ItemTemplateService } from './item-template.service';
import { ShopItem } from '../shop-item/shop-item.entity';
import { Kit } from '../kit/kit.entity';
import { UserAccessory } from '../user-accessory/user-accessory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemTemplate, ShopItem, Kit, UserAccessory]),
  ],
  controllers: [ItemTemplateController],
  providers: [ItemTemplateService],
  exports: [ItemTemplateService, TypeOrmModule],
})
export class ItemTemplateModule {}
