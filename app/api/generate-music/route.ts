import { NextRequest, NextResponse } from "next/server";

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

function normalizeSunoRecordInfo(data: any): { status: string; musicList: Array<{
  id: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  duration?: number;
}> } {
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
  try {
    const body = await req.json().catch(() => ({}));

    const lyrics = isTruthyString(body?.lyrics) ? body.lyrics.trim() : "";
    const creativeIdea = isTruthyString(body?.creativeIdea) ? body.creativeIdea.trim() : "";
    const musicStyle = isTruthyString(body?.musicStyle) ? body.musicStyle.trim() : "";
    const emotionalStyle = isTruthyString(body?.emotionalStyle) ? body.emotionalStyle.trim() : "";
    const vocalMode = isTruthyString(body?.vocalMode) ? body.vocalMode.trim() : "";
    const titleInput = isTruthyString(body?.title) ? body.title.trim() : "";

    const tagsRaw = body?.tags;
    const tags =
      Array.isArray(tagsRaw) ? tagsRaw.filter((t: any) => typeof t === "string").map((t: string) => t.trim()).filter(Boolean) : [];

    const instrumental =
      /纯音乐|伴奏|instrumental/i.test(vocalMode) ||
      /no\s*vocals/i.test(vocalMode) ||
      (!lyrics && !!creativeIdea);

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

    const sunoBaseUrl = process.env.SUNO_BASE_URL;
    const sunoApiKey = process.env.SUNO_API_KEY;
    if (!sunoBaseUrl) throw new Error("Missing env: SUNO_BASE_URL");
    if (!sunoApiKey) throw new Error("Missing env: SUNO_API_KEY");

    const styleString =
      tags.length > 0
        ? tags.join(", ")
        : [musicStyle, emotionalStyle].filter(Boolean).join(", ");

    const finalTitle =
      (titleInput || creativeIdea || "Untitled").slice(0, 90);

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
    const taskId = submitData?.data?.taskId || submitData?.taskId || submitData?.data;
    if (!taskId) throw new Error("Suno API 未返回 Task ID");

    // 尽量“一次请求拿到 songs”，但要考虑 Vercel 超时：最长轮询 55s
    const startedAt = Date.now();
    const maxWaitMs = 55_000;
    const pollEveryMs = 4_000;

    let lastStatus = "PENDING";
    let lastMusicList: any[] = [];

    while (Date.now() - startedAt < maxWaitMs) {
      await sleep(pollEveryMs);

      const infoRes = await fetch(`${sunoBaseUrl}/generate/record-info?taskId=${encodeURIComponent(String(taskId))}`, {
        headers: { Authorization: `Bearer ${sunoApiKey}` },
        cache: "no-store",
      });

      if (!infoRes.ok) continue;
      const infoData = await infoRes.json().catch(() => null);
      if (!infoData) continue;

      const { status, musicList } = normalizeSunoRecordInfo(infoData);
      lastStatus = status;
      lastMusicList = musicList;

      if (status === "SUCCESS" && musicList.length > 0) {
        const songs = musicList.map((s) => ({
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
            status,
            songs,
          })
        );
      }

      if (status === "FAILED") break;
    }

    // 超时/失败回退：把 taskId 给出去，Skill 可以继续请求 /api/status
    return withCors(
      NextResponse.json({
        success: lastStatus !== "FAILED",
        taskId,
        status: lastStatus,
        songs:
          Array.isArray(lastMusicList) && lastMusicList.length > 0
            ? lastMusicList.map((s: any) => ({
                id: s.id,
                title: finalTitle || s.title,
                audio_url: s.audioUrl,
                duration: s.duration,
                cover: s.imageUrl,
              }))
            : [],
        status_url: `/api/status?taskId=${encodeURIComponent(String(taskId))}`,
      })
    );
  } catch (e) {
    const message = (e as Error)?.message || "Unknown error";
    return withCors(
      NextResponse.json({ success: false, error: message }, { status: 500 })
    );
  }
}
