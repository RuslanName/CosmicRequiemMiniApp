import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ItemTemplateType } from '../enums/item-template-type.enum';

export class CreateItemTemplateDto {
  @ApiProperty({ example: 'Red Nickname', description: 'Название продукта' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'nickname_color',
    enum: ItemTemplateType,
    description: 'Тип продукта',
  })
  @IsEnum(ItemTemplateType)
  type: ItemTemplateType;

  @ApiProperty({ example: 'red', description: 'Значение продукта' })
  @IsString()
  value: string;
}
