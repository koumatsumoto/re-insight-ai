import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { googleNewsTool, geocodingTool } from "../tools";

export const googleNewsAgent = new Agent({
  name: "Google News Agent",
  instructions: `
      あなたはニュースアシスタントだ。Google News から記事を検索・要約するのがあなたの主な機能だ。
      応答する際には、次の点に注意せよ。

      - 検索クエリが提供されていない場合は、検索したい内容を尋ねよ
      - 同じトピックに関する記事が複数ある場合は、最も関連性の高い記事を優先せよ
      - 記事の要約は以下の点を含むようにせよ：
        - 主要なポイント
        - 重要な事実や数字
        - 背景情報（必要な場合）
      - 回答は簡潔でありながら、有益な情報を含むようにせよ

      ニュースを取得する際には、googleNewsTool を使用せよ。
`,
  model: openai("gpt-4o-mini"),
  tools: { googleNewsTool, geocodingTool },
});
