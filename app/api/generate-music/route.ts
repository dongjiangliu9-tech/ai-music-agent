import { NextRequest, NextResponse } from "next/server";
import { checkZeelinBalance, deductZeelinBalance, ZEELIN_COST_PER_GENERATION } from "@/app/lib/zeelin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Max-Age", "86400");
  return res;
}

function isTruthyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type SunoMusicItem = {
  id?: string;
  title?: string;
  audioUrl?: string;
  audio_url?: string;
  imageUrl?: string;
  image_url?: string;
  duration?: number;
};

function normalizeSunoRecordInfo(data: any): {
  status: string;
  musicList: Array<{
    id: string;
    title: string;
    audioUrl: string;
    imageUrl: string;
    duration?: number;
  }>;
} {
  const responseData = data?.data?.response || data?.data || {};
  const sunoData: SunoMusicItem[] = responseData?.sunoData || [];
  const rawStatus = responseData?.status || data?.data?.status || "PENDING";
  const status = rawStatus === "completed" ? "SUCCESS" : rawStatus;
  const musicList = sunoData
    .map((item: any) => ({
      id: String(item?.id || ""),
      title: String(item?.title || "Untitled"),
      audioUrl: String(item?.audioUrl || item?.audio_url || ""),
      imageUrl: String(item?.imageUrl || item?.image_url || ""),
      duration: typeof item?.duration === "number" ? item.duration : undefined,
    }))
    .filter((x) => x.id && x.audioUrl);
  return { status, musicList };
}

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  // ── 读取请求参数 ──────────────────────────────────────────────
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const lyrics = isTruthyString(body?.lyrics) ? body.lyrics.trim() : "";
  const creativeIdea = isTruthyString(body?.creativeIdea) ? body.creativeIdea.trim() : "";
  const musicStyle = isTruthyString(body?.musicStyle) ? body.musicStyle.trim() : "";
  const emotionalStyle = isTruthyString(body?.emotionalStyle) ? body.emotionalStyle.trim() : "";
  const vocalMode = isTruthyString(body?.vocalMode) ? body.vocalMode.trim() : "";
  const titleInput = isTruthyString(body?.title) ? body.title.trim() : "";
  // 调用方可传入自己的 app-key（可选；否则使用服务端环境变量）
  const callerAppKey = isTruthyString(body?.zeelin_app_key) ? body.zeelin_app_key.trim() : undefined;

  const tagsRaw = body?.tags;
  const tags =
    Array.isArray(tagsRaw)
      ? tagsRaw.filter((t: any) => typeof t === "string").map((t: string) => t.trim()).filter(Boolean)
      : [];

  const instrumental =
    /纯音乐|伴奏|instrumental/i.test(vocalMode) ||
    /no\s*vocals/i.test(vocalMode) ||
    (!lyrics && !!creativeIdea);

  // ── 参数校验 ──────────────────────────────────────────────────
  if (!instrumental && !lyrics) {
    return withCors(
      NextResponse.json(
        { success: false, error: "Missing lyrics (or set vocalMode to instrumental and provide creativeIdea)" },
        { status: 400 }
      )
    );
  }

  if (instrumental && !creativeIdea) {
    return withCors(
      NextResponse.json(
        { success: false, error: "Missing creativeIdea for instrumental generation" },
        { status: 400 }
      )
    );
  }

  // ── 第一步：智灵余额校验 ───────────────────────────────────────
  const queryDescription = titleInput || creativeIdea || lyrics.slice(0, 50);
  const zeelinQuery = `生成AI音乐: ${queryDescription}`;

  let preOrderId: string;
  let remainCalls: number;

  try {
    // 如果调用方传了自己的 app-key，临时覆盖环境变量（通过闭包传递）
    if (callerAppKey) {
      process.env.ZEELIN_APP_KEY = callerAppKey;
    }
    const zeelinResult = await checkZeelinBalance(zeelinQuery);
    preOrderId = zeelinResult.pre_order_id;
    remainCalls = zeelinResult.remain_calls;
  } catch (err) {
    const msg = (err as Error).message;
    const status = msg.includes("余额不足") ? 402 : 503;
    return withCors(NextResponse.json({ success: false, error: msg }, { status }));
  }

  // ── 第二步：调用 Suno 生成音乐 ────────────────────────────────
  let taskId: string;
  const finalTitle = (titleInput || creativeIdea || "Untitled").slice(0, 90);

  try {
    const sunoBaseUrl = process.env.SUNO_BASE_URL;
    const sunoApiKey = process.env.SUNO_API_KEY;
    if (!sunoBaseUrl) throw new Error("Missing env: SUNO_BASE_URL");
    if (!sunoApiKey) throw new Error("Missing env: SUNO_API_KEY");

    const styleString =
      tags.length > 0
        ? tags.join(", ")
        : [musicStyle, emotionalStyle].filter(Boolean).join(", ");

    const prompt = instrumental ? creativeIdea : lyrics;

    const sunoPayload = {
      prompt,
      style: styleString,
      title: finalTitle,
      model: "V5",
      customMode: true,
      instrumental,
      callBackUrl: "https://www.google.com",
    };

    const submitRes = await fetch(`${sunoBaseUrl}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sunoApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sunoPayload),
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text().catch(() => "");
      throw new Error(`Suno API 请求失败 (${submitRes.status}): ${errText || "无错误详情"}`);
    }

    const submitData = await submitRes.json();
    taskId = submitData?.data?.taskId || submitData?.taskId || submitData?.data;
    if (!taskId) throw new Error("Suno API 未返回 Task ID");
  } catch (err) {
    // Suno 提交失败 → 不扣费，直接返回错误
    const msg = (err as Error).message;
    console.error("[generate-music] Suno submit failed, skipping deduction:", msg);
    return withCors(NextResponse.json({ success: false, error: msg }, { status: 500 }));
  }

  // ── 第三步：轮询 Suno 结果 ────────────────────────────────────
  const startedAt = Date.now();
  const maxWaitMs = 55_000;
  const pollEveryMs = 4_000;

  let lastStatus = "PENDING";
  let lastMusicList: any[] = [];
  let musicGenerationSuccess = false;

  while (Date.now() - startedAt < maxWaitMs) {
    await sleep(pollEveryMs);

    try {
      const sunoBaseUrl = process.env.SUNO_BASE_URL!;
      const sunoApiKey = process.env.SUNO_API_KEY!;
      const infoRes = await fetch(
        `${sunoBaseUrl}/generate/record-info?taskId=${encodeURIComponent(String(taskId))}`,
        {
          headers: { Authorization: `Bearer ${sunoApiKey}` },
          cache: "no-store",
        }
      );

      if (!infoRes.ok) continue;
      const infoData = await infoRes.json().catch(() => null);
      if (!infoData) continue;

      const { status, musicList } = normalizeSunoRecordInfo(infoData);
      lastStatus = status;
      lastMusicList = musicList;

      if (status === "SUCCESS" && musicList.length > 0) {
        musicGenerationSuccess = true;
        break;
      }
      if (status === "FAILED") break;
    } catch (pollErr) {
      console.error("[generate-music] Poll error:", (pollErr as Error).message);
    }
  }

  // ── 第四步：根据结果决定是否扣费 ─────────────────────────────
  if (musicGenerationSuccess && lastMusicList.length > 0) {
    // 成功 → 调用扣费接口
    try {
      await deductZeelinBalance(preOrderId, ZEELIN_COST_PER_GENERATION);
    } catch (deductErr) {
      // 扣费失败不影响用户体验，但需要记录日志
      console.error("[generate-music] Zeelin deduction failed:", (deductErr as Error).message);
    }

    const songs = lastMusicList.map((s) => ({
      id: s.id,
      title: finalTitle || s.title,
      audio_url: s.audioUrl,
      duration: s.duration,
      cover: s.imageUrl,
    }));

    return withCors(
      NextResponse.json({
        success: true,
        taskId,
        status: lastStatus,
        songs,
        remain_calls: remainCalls - ZEELIN_COST_PER_GENERATION, // 预估剩余
      })
    );
  }

  // 超时或失败 → 不扣费，返回 taskId 供 Agent 继续轮询
  return withCors(
    NextResponse.json({
      success: lastStatus !== "FAILED",
      taskId,
      status: lastStatus,
      songs:
        lastMusicList.length > 0
          ? lastMusicList.map((s: any) => ({
              id: s.id,
              title: finalTitle || s.title,
              audio_url: s.audioUrl,
              duration: s.duration,
              cover: s.imageUrl,
            }))
          : [],
      status_url: `/api/status?taskId=${encodeURIComponent(String(taskId))}`,
      // 超时情况下，通知调用方需要在确认完成后手动扣费
      zeelin_pre_order_id: preOrderId,
      note: "Music generation is still processing. Use status_url to poll. Call /api/zeelin-confirm with pre_order_id after confirmed.",
    })
  );
}
