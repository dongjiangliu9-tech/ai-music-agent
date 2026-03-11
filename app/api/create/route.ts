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

    // ─── 1. 生成歌词（不需要扣费）───────────────────────────────
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
      if (!lyrics) throw new Error("歌词生成结果为空（上游返回 content 为空或结构不兼容）");
      return NextResponse.json({ success: true, lyrics });
    }

    // ─── 2. 生成音乐（需要智灵余额校验 + 扣费）─────────────────
    if (action === "generate_music") {
      const finalTitle = (customTitle || topic || "Untitled").slice(0, 90);
      console.log(`🎵 提交作曲: [${finalTitle}]`);

      // ── 验证用户 app-key ──────────────────────────────────────
      const userAppKey = typeof body.zeelin_app_key === "string" ? body.zeelin_app_key.trim() : "";
      if (!userAppKey) {
        return NextResponse.json(
          { success: false, error: "请先配置你的智灵 App-Key，前往 https://skills.zeelin.cn 注册获取" },
          { status: 401 }
        );
      }

      // ── 第一步：智灵余额校验（用用户自己的 key）──────────────
      const zeelinQuery = `生成AI音乐: ${finalTitle}`;
      let preOrderId: string;
      let remainCalls: number;

      // 临时替换环境变量为用户的 key
      const originalKey = process.env.ZEELIN_APP_KEY;
      process.env.ZEELIN_APP_KEY = userAppKey;

      try {
        const zeelinResult = await checkZeelinBalance(zeelinQuery);
        preOrderId = zeelinResult.pre_order_id;
        remainCalls = zeelinResult.remain_calls;
        console.log(`✅ 智灵余额校验通过，剩余额度: ${remainCalls}，预订单: ${preOrderId}`);
      } catch (err) {
        process.env.ZEELIN_APP_KEY = originalKey; // 恢复
        const msg = (err as Error).message;
        console.error("❌ 智灵余额校验失败:", msg);
        const status = msg.includes("余额不足") ? 402 : 503;
        return NextResponse.json({ success: false, error: msg }, { status });
      }

      // ── 第二步：提交 Suno 作曲任务 ───────────────────────────
      const finalPrompt = isInstrumental ? topic : customLyrics;

      const sunoPayload = {
        prompt: finalPrompt,
        style: styleTags,
        title: finalTitle,
        model: "suno-v5",
        customMode: true,
        instrumental: isInstrumental,
        callBackUrl: "https://www.google.com",
      };

      const sunoRes = await fetch(`${process.env.SUNO_BASE_URL}/v1/music/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sunoPayload),
      });

      if (!sunoRes.ok) {
        process.env.ZEELIN_APP_KEY = originalKey; // 恢复
        const errText = await sunoRes.text().catch(() => "");
        throw new Error(`Suno API 请求失败 (${sunoRes.status}): ${errText || "无错误详情"}`);
      }

      const sunoData = await sunoRes.json();
      const taskId = sunoData.task_id;
      if (!taskId) {
        process.env.ZEELIN_APP_KEY = originalKey;
        throw new Error("Suno API 未返回 Task ID");
      }

      // ── 第三步：轮询等待完成（最多 55 秒）───────────────────
      const startedAt = Date.now();
      const maxWaitMs = 55_000;
      const pollEveryMs = 4_000;
      let musicDone = false;

      while (Date.now() - startedAt < maxWaitMs) {
        await sleep(pollEveryMs);
        try {
          const statusRes = await fetch(`${process.env.SUNO_BASE_URL}/v1/music/result`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ model: "suno-v5", task_id: taskId }),
          });
          if (!statusRes.ok) continue;
          const statusData = await statusRes.json();
          const responseData = statusData?.data?.response || statusData?.data || {};
          const status = responseData?.status || statusData?.data?.status || "PENDING";
          if (status === "SUCCESS" || status === "FIRST_SUCCESS") { musicDone = true; break; }
          if (["CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "CALLBACK_EXCEPTION", "SENSITIVE_WORD_ERROR"].includes(status)) break;
        } catch (pollErr) {
          console.error("轮询状态异常:", (pollErr as Error).message);
        }
      }

      // ── 第四步：成功才扣费 ────────────────────────────────────
      if (musicDone) {
        try {
          const deductResult = await deductZeelinBalance(preOrderId, ZEELIN_COST_PER_GENERATION);
          console.log(`💰 智灵扣费成功，扣除 ${deductResult.cost_balance} 额度，剩余 ${deductResult.remain_calls}`);
        } catch (deductErr) {
          console.error("⚠️ 智灵扣费失败（音乐已生成）:", (deductErr as Error).message);
        }
      } else {
        console.log("⏳ 音乐生成未在本次请求内完成，跳过扣费，等待前端轮询确认后扣费");
      }

      // 恢复原始 key
      process.env.ZEELIN_APP_KEY = originalKey;

      // 把 taskId 和 pre_order_id（超时时用）返回给前端
      return NextResponse.json({
        success: true,
        taskId,
        // 超时未完成时带回 pre_order_id，前端轮询完成后调 /api/zeelin-confirm 扣费
        ...(musicDone ? {} : { zeelin_pre_order_id: preOrderId, zeelin_app_key: userAppKey }),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
