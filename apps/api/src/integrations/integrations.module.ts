import { Module } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { IntegrationsController } from "./integrations.controller";
import { AdapterFactory } from "./adapter-factory";
import { WebhookService } from "./webhook.service";

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, AdapterFactory, WebhookService],
  exports: [IntegrationsService, WebhookService],
})
export class IntegrationsModule {}
