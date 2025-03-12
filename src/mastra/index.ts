import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { googleNewsAgent, reinfolibAgent } from "./agents";

export const mastra = new Mastra({
  agents: { googleNewsAgent, reinfolibAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
