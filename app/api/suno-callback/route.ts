import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    console.log("[SunoCallback]", JSON.stringify({
      taskId: body?.data?.task_id || body?.data?.taskId || body?.task_id || body?.taskId,
      callbackType: body?.data?.callbackType || body?.callbackType,
      status: body?.data?.status || body?.status,
    }));
  } catch (error) {
    console.error("[SunoCallback] Failed to parse callback", error);
  }

  return NextResponse.json({ success: true });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
