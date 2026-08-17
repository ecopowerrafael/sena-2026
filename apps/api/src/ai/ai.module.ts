import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiController } from "./ai.controller";
import { AiProvider } from "./ai-provider";
import { ClaudeProvider } from "./providers/claude.provider";

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    {
      provide: AiProvider,
      useFactory: () => {
        const apiKey = process.env.AI_CLAUDE_API_KEY;
        if (!apiKey) {
          console.warn("AI_CLAUDE_API_KEY not configured - AI features will be limited");
          return new ClaudeProvider("dummy-key-for-testing");
        }
        return new ClaudeProvider(apiKey);
      },
    },
  ],
  exports: [AiService],
})
export class AiModule {}
