// app/api/status/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  const res = await fetch(`${process.env.SUNO_BASE_URL}/generate/record-info?taskId=${taskId}`, {
    headers: { "Authorization": `Bearer ${process.env.SUNO_API_KEY}` }
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
    audioUrl: item.audioUrl || item.audio_url, // API 字段有时大小写不一致，做兼容
    imageUrl: item.imageUrl || item.image_url,
    duration: item.duration,
    model: item.model_name
  }));

  return NextResponse.json({ 
    status: status === "completed" ? "SUCCESS" : status, 
    musicList // 返回一个数组
  });
}