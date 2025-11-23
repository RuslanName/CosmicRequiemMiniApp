import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { VKPaymentsService } from './vk-payments.service';
import { VKNotificationDto } from './dtos/vk-notification.dto';

@ApiTags('VK payments')
@Controller('vk-payments')
export class VKPaymentsController {
  constructor(private readonly vkPaymentsService: VKPaymentsService) {}

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Callback для обработки платёжных уведомлений от VK',
    description:
      'Обрабатывает уведомления get_item и order_status_change от платформы ВКонтакте',
  })
  @ApiBody({ type: VKNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'Уведомление успешно обработано',
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный формат уведомления',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверная подпись уведомления',
  })
  @ApiResponse({
    status: 404,
    description: 'Товар или пользователь не найден',
  })
  async handleCallback(@Body() notification: VKNotificationDto): Promise<any> {
    return this.vkPaymentsService.handleNotification(notification);
  }
}
