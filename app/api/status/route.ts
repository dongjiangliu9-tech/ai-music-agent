// app/api/status/route.ts
import { NextResponse } from "next/server";
import { buildSunoStatusRequest, normalizeSunoResult } from "@/app/lib/suno";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  const sunoBaseUrl = process.env.SUNO_BASE_URL;
  const sunoApiKey = process.env.SUNO_API_KEY;
  if (!sunoBaseUrl || !sunoApiKey) {
    return NextResponse.json({ status: "FAILED", musicList: [], error: "Missing Suno env" }, { status: 500 });
  }

  const [statusUrl, statusInit] = buildSunoStatusRequest(sunoBaseUrl, sunoApiKey, taskId);
  const res = await fetch(statusUrl, statusInit);

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return NextResponse.json(
      { status: "PENDING", musicList: [], error: errText || `Suno status request failed: ${res.status}` },
      { status: 200 }
    );
  }

  const data = await res.json();
  const result = normalizeSunoResult(data);

  return NextResponse.json({
    status: result.status,
    rawStatus: result.rawStatus,
    isFinal: result.isFinal,
    hasDownloadableAudio: result.hasDownloadableAudio,
    musicList: result.musicList,
    ...(result.status === "FAILED" && { error: `音乐生成失败: ${result.rawStatus}` }),
  });
}
