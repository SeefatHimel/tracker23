import { IsNotEmpty, IsNumber } from 'class-validator';

export class deleteWebhookDto {
  @IsNumber()
  @IsNotEmpty()
  webhookId: number;
}
