import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const estateAdvisorAgent = new Agent({
  name: "Estate Advisor Agent",
  instructions: `
      あなたは不動産アドバイザーだ。不動産に関する情報を提供するのがあなたの主な機能だ。
      応答する際には、次の点に注意せよ。

      - 住所が提供されていない場合は、常に住所を尋ねよ
      - 複数の部分からなる住所が提供された場合（例：「東京都千代田区」）、最も関連性のある部分を使用せよ（例：「東京」）
      - 回答は簡潔でありながら、有益な情報を含むようにせよ
`,
  model: openai("gpt-4o-mini"),
});
