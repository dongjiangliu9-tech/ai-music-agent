// app/api/generate-music/route.ts
// 此接口供 OpenClaw Skill 直接调用（与 /api/create 逻辑对等）
import { NextRequest, NextResponse } from "next/server";
import { checkZeelinBalance, deductZeelinBalance, ZEELIN_COST_PER_GENERATION } from "@/app/lib/zeelin";
import {
  buildSunoCallbackUrl,
  buildSunoGenerateUrl,
  buildSunoStatusRequest,
  getSunoModel,
  normalizeSunoResult,
  type NormalizedSunoSong,
} from "@/app/lib/suno";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Max-Age", "86400");
  // 强制 UTF-8，防止 Windows/代理层错误解析中文编码
  res.headers.set("Content-Type", "application/json; charset=utf-8");
  return res;
}

function isTruthyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const lyrics       = isTruthyString(body?.lyrics)        ? body.lyrics.trim()        : "";
  const creativeIdea = isTruthyString(body?.creativeIdea)  ? body.creativeIdea.trim()  : "";
  const musicStyle   = isTruthyString(body?.musicStyle)    ? body.musicStyle.trim()    : "";
  const emotStyle    = isTruthyString(body?.emotionalStyle)? body.emotionalStyle.trim(): "";
  const vocalMode    = isTruthyString(body?.vocalMode)     ? body.vocalMode.trim()     : "";
  const titleInput   = isTruthyString(body?.title)         ? body.title.trim()         : "";
  const userAppKey   = isTruthyString(body?.zeelin_app_key)? body.zeelin_app_key.trim(): "";

  const tagsRaw = body?.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.filter((t: any) => typeof t === "string").map((t: string) => t.trim()).filter(Boolean)
    : [];

  const instrumental =
    /纯音乐|伴奏|instrumental/i.test(vocalMode) ||
    /no\s*vocals/i.test(vocalMode) ||
    (!lyrics && !!creativeIdea);

  // 参数校验
  if (!instrumental && !lyrics) {
    return withCors(NextResponse.json({ success: false, error: "Missing lyrics" }, { status: 400 }));
  }
  if (instrumental && !creativeIdea) {
    return withCors(NextResponse.json({ success: false, error: "Missing creativeIdea for instrumental" }, { status: 400 }));
  }
  if (!userAppKey) {
    return withCors(NextResponse.json(
      { success: false, error: "请提供 zeelin_app_key，前往 https://skills.zeelin.cn 注册获取" },
      { status: 401 }
    ));
  }

  const finalTitle = (titleInput || creativeIdea || "Untitled").slice(0, 90);

  // ── 第一步：智灵余额校验 ──────────────────────────────────────
  let preOrderId: string;
  let remainCalls: number;
  try {
    const result = await checkZeelinBalance(userAppKey, `生成AI音乐: ${finalTitle}`);
    preOrderId = result.pre_order_id;
    remainCalls = result.remain_calls;
    console.log(`✅ 智灵校验通过，剩余: ${remainCalls}，预订单: ${preOrderId}`);
  } catch (err) {
    const msg = (err as Error).message;
    const status = msg.includes("余额不足") || msg.includes("Key 无效") ? 402 : 503;
    return withCors(NextResponse.json({ success: false, error: msg }, { status }));
  }

  // ── 第二步：提交 Suno ─────────────────────────────────────────
  const sunoBaseUrl = process.env.SUNO_BASE_URL;
  const sunoApiKey  = process.env.SUNO_API_KEY;
  if (!sunoBaseUrl || !sunoApiKey) {
    return withCors(NextResponse.json({ success: false, error: "Missing Suno env" }, { status: 500 }));
  }

  const styleString = tags.length > 0 ? tags.join(", ") : [musicStyle, emotStyle].filter(Boolean).join(", ");

  const sunoPayload = {
    prompt: instrumental ? creativeIdea : lyrics,
    style: styleString,
    title: finalTitle,
    model: getSunoModel(sunoBaseUrl),
    customMode: true,
    instrumental,
    callBackUrl: buildSunoCallbackUrl(req),
  };

  const submitRes = await fetch(buildSunoGenerateUrl(sunoBaseUrl), {
    method: "POST",
    headers: { Authorization: `Bearer ${sunoApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(sunoPayload),
  });

  if (!submitRes.ok) {
    const errText = await submitRes.text().catch(() => "");
    return withCors(NextResponse.json(
      { success: false, error: `Suno 请求失败 (${submitRes.status}): ${errText}` },
      { status: 502 }
    ));
  }

  const submitData = await submitRes.json();
  const taskId = normalizeSunoResult(submitData).taskId;
  if (!taskId) {
    return withCors(NextResponse.json({ success: false, error: "Suno 未返回 task_id" }, { status: 502 }));
  }

  // ── 第三步：轮询（最多 55 秒）────────────────────────────────
  const startedAt = Date.now();
  let lastStatus = "PENDING";
  let lastMusicList: NormalizedSunoSong[] = [];
  let musicDone = false;

  while (Date.now() - startedAt < 55_000) {
    await sleep(4_000);
    try {
      const [statusUrl, statusInit] = buildSunoStatusRequest(sunoBaseUrl, sunoApiKey, taskId);
      const infoRes = await fetch(statusUrl, statusInit);
      if (!infoRes.ok) continue;
      const infoData = await infoRes.json().catch(() => null);
      if (!infoData) continue;
      const result = normalizeSunoResult(infoData);
      lastStatus = result.rawStatus;
      lastMusicList = result.musicList;
      if (result.status === "SUCCESS") { musicDone = true; break; }
      if (result.status === "FAILED") break;
    } catch { /* 继续 */ }
  }

  // ── 第四步：扣费 ──────────────────────────────────────────────
  if (musicDone) {
    try {
      const deduct = await deductZeelinBalance(userAppKey, preOrderId, ZEELIN_COST_PER_GENERATION);
      console.log(`💰 扣费成功，扣 ${deduct.cost_balance}，剩余 ${deduct.remain_calls}`);
    } catch (e) {
      console.error("⚠️ 扣费失败（音乐已生成）:", (e as Error).message);
    }

    const songs = lastMusicList.map((s) => ({
      id: s.id,
      title: finalTitle || s.title,
      audio_url: s.audioUrl,
      stream_audio_url: s.streamAudioUrl,
      duration: s.duration,
      cover: s.imageUrl,
    }));

    return withCors(NextResponse.json({
      success: true,
      taskId,
      status: "SUCCESS",
      songs,
      remain_calls: remainCalls - ZEELIN_COST_PER_GENERATION,
    }));
  }

  // 超时：返回 taskId + pre_order_id，让 Skill 自行轮询后调 /api/zeelin-confirm
  return withCors(NextResponse.json({
    success: true,
    taskId,
    status: lastStatus,
    songs: lastMusicList.map((s: NormalizedSunoSong) => ({
      id: s.id,
      title: finalTitle || s.title,
      audio_url: s.audioUrl,
      stream_audio_url: s.streamAudioUrl,
      duration: s.duration,
      cover: s.imageUrl,
    })),
    status_url: `https://melodylab.top/api/status?taskId=${encodeURIComponent(String(taskId))}`,
    zeelin_pre_order_id: preOrderId,
  }));
}
