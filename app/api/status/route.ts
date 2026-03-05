// app/api/status/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId)
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  const res = await fetch(
    `${process.env.SUNO_BASE_URL}/music/result`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task_id: taskId,
        model: "suno-v5",
      }),
    },
  );

  const data = await res.json();

  // 兼容ZeeLin网关的数据结构
  const responseData = data.data?.response || data.data || {};
  const sunoData = responseData.sunoData || [];
  const status = responseData.status || data.data?.status || "PENDING";

  // 映射所有生成的歌曲
  const musicList = sunoData.map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled",
    audioUrl: item.audioUrl || item.audio_url,
    imageUrl: item.imageUrl || item.image_url,
    duration: item.duration,
    model: item.modelName || item.model_name,
  }));

  return NextResponse.json({
    status: status === "completed" ? "SUCCESS" : status,
    musicList,
  });
}
