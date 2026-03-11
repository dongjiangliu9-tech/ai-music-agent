/**
 * POST /api/zeelin-confirm
 * 超时异步场景：前端轮询到 SUCCESS 后，用此接口完成扣费核销。
 *
 * 请求体：{ pre_order_id, zeelin_app_key, cost_balance? }
 */
import { NextRequest, NextResponse } from "next/server";
import { deductZeelinBalance, ZEELIN_COST_PER_GENERATION } from "@/app/lib/zeelin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch {
    return withCors(NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }));
  }

  const preOrderId = typeof body?.pre_order_id === "string" ? body.pre_order_id.trim() : "";
  const userAppKey = typeof body?.zeelin_app_key === "string" ? body.zeelin_app_key.trim() : "";
  const cost = typeof body?.cost_balance === "number" && body.cost_balance > 0
    ? body.cost_balance : ZEELIN_COST_PER_GENERATION;

  if (!preOrderId) return withCors(NextResponse.json({ success: false, error: "pre_order_id is required" }, { status: 400 }));
  if (!userAppKey) return withCors(NextResponse.json({ success: false, error: "zeelin_app_key is required" }, { status: 401 }));

  try {
    const result = await deductZeelinBalance(userAppKey, preOrderId, cost);
    return withCors(NextResponse.json({
      success: true,
      order_id: result.order_id,
      cost_balance: result.cost_balance,
      remain_calls: result.remain_calls,
    }));
  } catch (err) {
    return withCors(NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 }));
  }
}
