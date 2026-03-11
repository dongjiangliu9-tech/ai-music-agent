// app/api/status/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  const res = await fetch(`${process.env.SUNO_BASE_URL}/v1/music/result`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SUNO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "suno-v5",
      task_id: taskId,
    }),
  });

  const data = await res.json();

  // 兼容性处理：Suno的数据结构有时候藏得深
  const responseData = data.data?.response || data.data || {};
  const sunoData = responseData.sunoData || [];
  const status = responseData.status || data.data?.status || "PENDING";

  // 【核心修改】映射所有生成的歌曲，而不仅仅是第一首
  const musicList = sunoData.map((item: any) => ({
    id: item.id,
    title: item.title || "Untitled",
    audioUrl: item.audioUrl || item.audio_url,
    imageUrl: item.imageUrl || item.image_url,
    duration: item.duration,
    model: item.model_name
  }));

  const failedStatuses = [
    "CREATE_TASK_FAILED",
    "GENERATE_AUDIO_FAILED",
    "CALLBACK_EXCEPTION",
    "SENSITIVE_WORD_ERROR",
  ];

  let normalizedStatus: string;
  if (status === "SUCCESS" || status === "FIRST_SUCCESS") {
    normalizedStatus = "SUCCESS";
  } else if (failedStatuses.includes(status)) {
    normalizedStatus = "FAILED";
  } else {
    // PENDING, TEXT_SUCCESS 等中间状态
    normalizedStatus = "PENDING";
  }

  return NextResponse.json({
    status: normalizedStatus,
    musicList,
    ...(normalizedStatus === "FAILED" && { error: `音乐生成失败: ${status}` }),
  });
}
