import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({})],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}