import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}

function coerceChatContentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content) return "";

  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (part?.type === "text" && typeof part?.text === "string") return part.text;
        if (typeof part?.text === "string") return part.text;
        return "";
      })
      .join("");
  }

  const anyContent: any = content;
  if (typeof anyContent?.text === "string") return anyContent.text;
  return "";
}

function tryParseJsonObject(text: string): any | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const maybe = text.slice(start, end + 1);
  try {
    return JSON.parse(maybe);
  } catch {
    return null;
  }
}

function isTruthyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const creativeIdea = isTruthyString(body?.creativeIdea) ? body.creativeIdea.trim() : "";
    const musicStyle = isTruthyString(body?.musicStyle) ? body.musicStyle.trim() : "";
    const emotionalStyle = isTruthyString(body?.emotionalStyle) ? body.emotionalStyle.trim() : "";
    const vocalMode = isTruthyString(body?.vocalMode) ? body.vocalMode.trim() : "人声";

    if (!creativeIdea) {
      return withCors(
        NextResponse.json(
          { success: false, error: "Missing creativeIdea" },
          { status: 400 }
        )
      );
    }

    const instrumental =
      /纯音乐|伴奏|instrumental/i.test(vocalMode) || /no\s*vocals/i.test(vocalMode);

    // 纯音乐模式不需要歌词，仍然返回稳定字段结构
    if (instrumental) {
      const title = creativeIdea.slice(0, 90);
      const tags = [musicStyle, emotionalStyle].filter(Boolean);
      return withCors(
        NextResponse.json({
          success: true,
          lyrics: "",
          title,
          tags,
        })
      );
    }

    const apiKey = process.env.LYRICS_API_KEY;
    const baseURL = process.env.LYRICS_BASE_URL;
    const model = process.env.LYRICS_MODEL || "gemini-3-pro-preview";
    if (!apiKey) throw new Error("Missing env: LYRICS_API_KEY");
    if (!baseURL) throw new Error("Missing env: LYRICS_BASE_URL");

    const openai = new OpenAI({ apiKey, baseURL });

    const prompt = `你是一位世界顶级的音乐制作人和作词人。请根据用户提供的主题，创作一首完整的歌词，并严格按 JSON 输出。

【创作主题】：${creativeIdea}
【音乐风格】：${musicStyle || "不指定"}
【情绪氛围】：${emotionalStyle || "不指定"}

【创作要求】：
1. 语言判定：请根据“创作主题”的语言决定歌词语言。
2. 故事扩展：自行脑补画面，扩展故事细节。
3. 篇幅限制：300字以内。
4. 句子长度：每句歌词不超过15字，尽量控制在12字以内。
5. 段落长度：每段歌词不超过6句，段落内尽量押韵。
6. 对仗要求：副歌1和副歌2必须严格对仗（字数相近、结构相似、韵律对称）。

【严格结构要求】：
[Instrumental]
[Verse 1]
[Pre-Chorus]
[Powerful Chorus 1]
[Powerful Chorus 2]
[Verse 2]
[Pre-Chorus]
[Powerful Chorus 1]
[Powerful Chorus 2]
[Bridge]
[Powerful Chorus 2]
[Outro]

【输出格式（必须严格 JSON，且只能输出 JSON，不要任何多余文字）】：
{
  "title": "歌曲标题（不超过 90 字符）",
  "tags": ["风格标签1", "情绪标签2"],
  "lyrics": "完整歌词（含上述结构标签，换行用 \\n）"
}`;

    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const rawContent = chatCompletion.choices?.[0]?.message?.content ?? "";
    const text = coerceChatContentToText(rawContent).trim();
    if (!text) throw new Error("Lyrics generation returned empty content");

    const parsed = tryParseJsonObject(text);
    const titleFromInput = creativeIdea.slice(0, 90);
    const baseTags = [musicStyle, emotionalStyle].filter(Boolean);

    if (parsed && typeof parsed === "object") {
      const lyrics = isTruthyString(parsed.lyrics) ? parsed.lyrics.trim() : "";
      const title = isTruthyString(parsed.title) ? parsed.title.trim().slice(0, 90) : titleFromInput;
      const tags =
        Array.isArray(parsed.tags) && parsed.tags.every((t: any) => typeof t === "string")
          ? Array.from(new Set([...baseTags, ...parsed.tags.map((t: string) => t.trim()).filter(Boolean)]))
          : baseTags;

      if (!lyrics) throw new Error("Lyrics generation returned empty lyrics");

      return withCors(
        NextResponse.json({
          success: true,
          lyrics,
          title,
          tags,
        })
      );
    }

    // 回退：上游没严格输出 JSON，则把全文当歌词
    return withCors(
      NextResponse.json({
        success: true,
        lyrics: text,
        title: titleFromInput,
        tags: baseTags,
      })
    );
  } catch (e) {
    const message = (e as Error)?.message || "Unknown error";
    return withCors(
      NextResponse.json({ success: false, error: message }, { status: 500 })
    );
  }
}
