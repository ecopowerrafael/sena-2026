import { Global, Module } from "@nestjs/common";
import { env, type Env } from "./env";

export const ENV = "ENV";

@Global()
@Module({
  providers: [
    {
      provide: ENV,
      useFactory: (): Env => env(),
    },
  ],
  exports: [ENV],
})
export class ConfigModule {}
