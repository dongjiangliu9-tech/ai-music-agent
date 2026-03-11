// app/api/create/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { checkZeelinBalance, deductZeelinBalance, ZEELIN_COST_PER_GENERATION } from "@/app/lib/zeelin";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.LYRICS_API_KEY,
  baseURL: process.env.LYRICS_BASE_URL,
});

function coerceChatContentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!content) return "";
  if (Array.isArray(content)) {
    return content.map((part: any) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" && typeof part?.text === "string") return part.text;
      if (typeof part?.text === "string") return part.text;
      return "";
    }).join("");
  }
  const anyContent: any = content;
  if (typeof anyContent?.text === "string") return anyContent.text;
  return "";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, topic, customTitle, styleLabel, styleTags, mood, isInstrumental, customLyrics } = body;

    // ─── 1. 生成歌词（免费，不扣额度）──────────────────────────
    if (action === "generate_lyrics") {
      const prompt = `你是一位世界顶级的音乐制作人和作词人。请根据用户提供的主题，创作一首完整的歌词。
      【用户输入主题】：${topic}
      【音乐风格】：${styleLabel}
      【情绪基调】：${mood}
      【创作要求】：
      1. 语言判定：请根据"${topic}"的语言决定歌词语言。
      2. 故事扩展：自行脑补画面，扩展故事细节。
      3. 篇幅限制：300字以内。
      4. 句子长度：每句歌词不超过15字，尽量控制在12字以内。
      5. 段落长度：每段歌词不超过6句，段落内保持押韵。
      6. 对仗要求：副歌1和副歌2必须严格对仗（字数相近、结构相似、韵律对称）。
      【严格结构要求】：
      [Instrumental]
      [Verse 1] (主歌1：铺垫背景，引入故事，最多6句，每句≤15字)
      [Pre-Chorus] (预副歌：情绪爬升，最多6句，每句≤15字)
      [Powerful Chorus 1] (副歌1：情感爆发，核心记忆点，最多6句，每句≤15字)
      [Powerful Chorus 2] (副歌2：必须与副歌1严格对仗，深化主题，最多6句，每句≤15字)
      [Verse 2] (主歌2：推进情节，细节描写，最多6句，每句≤15字)
      [Pre-Chorus] (预副歌：情绪爬升，最多6句，每句≤15字)
      [Powerful Chorus 1] (副歌1回归：最后的高潮，最多6句，每句≤15字)
      [Powerful Chorus 2] (副歌2回归：必须与副歌1严格对仗，最后的高潮，最多6句，每句≤15字)
      [Bridge] (桥段：节奏或视角的转变，情绪转折，最多6句，每句≤15字)
      [Powerful Chorus 2] (副歌2回归：必须与副歌1严格对仗，最后的高潮，最多6句，每句≤15字)
      [Outro] (结尾：余韵悠长，逐渐淡出，最多6句，每句≤15字)
      【输出格式】：只输出歌词正文。`;

      const chatCompletion = await openai.chat.completions.create({
        model: process.env.LYRICS_MODEL || "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const rawContent = chatCompletion.choices?.[0]?.message?.content ?? "";
      const lyrics = coerceChatContentToText(rawContent).trim();
      if (!lyrics) throw new Error("歌词生成结果为空");
      return NextResponse.json({ success: true, lyrics });
    }

    // ─── 2. 生成音乐（消耗 200 额度）───────────────────────────
    if (action === "generate_music") {
      const finalTitle = (customTitle || topic || "Untitled").slice(0, 90);

      // 用户自己的 App-Key（必须）
      const userAppKey = typeof body.zeelin_app_key === "string" ? body.zeelin_app_key.trim() : "";
      if (!userAppKey) {
        return NextResponse.json(
          { success: false, error: "请先配置你的智灵 App-Key，前往 https://skills.zeelin.cn 注册获取" },
          { status: 401 }
        );
      }

      // ── 第一步：智灵余额校验 ──────────────────────────────────
      let preOrderId: string;
      let remainCalls: number;
      try {
        const result = await checkZeelinBalance(userAppKey, `生成AI音乐: ${finalTitle}`);
        preOrderId = result.pre_order_id;
        remainCalls = result.remain_calls;
        console.log(`✅ 智灵校验通过，剩余: ${remainCalls}，预订单: ${preOrderId}`);
      } catch (err) {
        const msg = (err as Error).message;
        console.error("❌ 智灵校验失败:", msg);
        const status = msg.includes("余额不足") || msg.includes("Key 无效") ? 402 : 503;
        return NextResponse.json({ success: false, error: msg }, { status });
      }

      // ── 第二步：提交 Suno 任务 ────────────────────────────────
      const sunoBaseUrl = process.env.SUNO_BASE_URL;
      const sunoApiKey = process.env.SUNO_API_KEY;
      if (!sunoBaseUrl || !sunoApiKey) throw new Error("Missing Suno env config");

      const sunoPayload = {
        prompt: isInstrumental ? topic : customLyrics,
        style: styleTags,
        title: finalTitle,
        model: "suno-v5",
        customMode: true,
        instrumental: isInstrumental,
        callBackUrl: "https://www.google.com",
      };

      const sunoRes = await fetch(`${sunoBaseUrl}/v1/music/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sunoApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(sunoPayload),
      });

      if (!sunoRes.ok) {
        const errText = await sunoRes.text().catch(() => "");
        // Suno 提交失败 → 不扣费
        throw new Error(`Suno 请求失败 (${sunoRes.status}): ${errText}`);
      }

      const sunoData = await sunoRes.json();
      const taskId = sunoData.task_id;
      if (!taskId) throw new Error("Suno 未返回 task_id");

      console.log(`🎵 Suno 任务已提交: ${taskId}`);

      // ── 第三步：轮询（最多 55 秒，超时交给前端继续轮询）──────
      const startedAt = Date.now();
      let musicDone = false;

      while (Date.now() - startedAt < 55_000) {
        await sleep(4_000);
        try {
          const statusRes = await fetch(`${sunoBaseUrl}/v1/music/result`, {
            method: "POST",
            headers: { Authorization: `Bearer ${sunoApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "suno-v5", task_id: taskId }),
          });
          if (!statusRes.ok) continue;
          const sd = await statusRes.json();
          const status = sd?.data?.status || sd?.status || "processing";
          if (status === "SUCCESS" || status === "completed") { musicDone = true; break; }
          if (["FAILED", "error", "CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED"].includes(status)) break;
        } catch { /* 继续轮询 */ }
      }

      // ── 第四步：成功则立即扣费，超时则把 pre_order_id 交给前端 ─
      if (musicDone) {
        try {
          const deduct = await deductZeelinBalance(userAppKey, preOrderId, ZEELIN_COST_PER_GENERATION);
          console.log(`💰 扣费成功，扣 ${deduct.cost_balance}，剩余 ${deduct.remain_calls}`);
        } catch (e) {
          console.error("⚠️ 扣费失败（音乐已生成）:", (e as Error).message);
        }
        return NextResponse.json({ success: true, taskId });
      } else {
        // 超时：把 pre_order_id 和 appKey 哈希返回，前端轮询到成功后调 /api/zeelin-confirm
        console.log(`⏳ 超时，taskId=${taskId}，交前端轮询`);
        return NextResponse.json({
          success: true,
          taskId,
          zeelin_pre_order_id: preOrderId,
          // 注意：appKey 不回传给前端（前端自己存着），此字段仅内部标记
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
