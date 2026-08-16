import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { API_PREFIX } from "@sena/shared";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/all-exceptions.filter";
import { JsonLogger } from "./common/json.logger";
import { ResponseEnvelopeInterceptor } from "./common/response.interceptor";
import { loadDotenv } from "./config/dotenv";
import { loadEnv } from "./config/env";

async function bootstrap(): Promise<void> {
  loadDotenv();
  const env = loadEnv();

  const app = await NestFactory.create(AppModule, {
    logger: new JsonLogger(env.NODE_ENV === "production"),
  });

  app.setGlobalPrefix(API_PREFIX.replace(/^\//, ""));
  app.enableCors({ origin: env.CORS_ORIGIN, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  if (env.SWAGGER_ENABLED && env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("SENA CRM API")
      .setDescription("API do CRM Imobiliário SENA 2026")
      .setVersion("0.1.0")
      .build();
    SwaggerModule.setup(`${API_PREFIX}/docs`.replace(/^\//, ""), app, () =>
      SwaggerModule.createDocument(app, config)
    );
  }

  await app.listen(env.API_PORT);
  new Logger("Bootstrap").log(`API disponível em http://localhost:${env.API_PORT}${API_PREFIX}`);
}

void bootstrap();
