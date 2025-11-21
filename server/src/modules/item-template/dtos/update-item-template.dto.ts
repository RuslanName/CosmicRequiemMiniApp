import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ItemTemplateType } from '../enums/item-template-type.enum';

export class UpdateItemTemplateDto {
  @ApiProperty({
    example: 'Red Nickname',
    required: false,
    description: 'Название продукта',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'nickname_color',
    enum: ItemTemplateType,
    required: false,
    description: 'Тип продукта',
  })
  @IsOptional()
  @IsEnum(ItemTemplateType)
  type?: ItemTemplateType;

  @ApiProperty({
    example: 'red',
    required: false,
    description: 'Значение продукта',
  })
  @IsOptional()
  @IsString()
  value?: string;
}
