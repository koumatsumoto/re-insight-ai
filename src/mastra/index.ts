import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { googleNewsAgent } from "./agents";

export const mastra = new Mastra({
  agents: { googleNewsAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
