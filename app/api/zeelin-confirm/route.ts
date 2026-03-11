/**
 * POST /api/zeelin-confirm
 *
 * 用于异步场景：当 /api/generate-music 因超时返回 pending + zeelin_pre_order_id 时，
 * Agent 在轮询到 status=SUCCESS 后，调用此接口完成扣费核销。
 *
 * 请求体：
 * {
 *   "pre_order_id": "xxx",
 *   "cost_balance": 2  // 可选，默认使用环境变量 ZEELIN_COST_PER_GENERATION
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { deductZeelinBalance, ZEELIN_COST_PER_GENERATION } from "@/app/lib/zeelin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return withCors(
      NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
    );
  }

  const preOrderId = typeof body?.pre_order_id === "string" ? body.pre_order_id.trim() : "";
  const costBalance =
    typeof body?.cost_balance === "number" && body.cost_balance > 0
      ? body.cost_balance
      : ZEELIN_COST_PER_GENERATION;

  if (!preOrderId) {
    return withCors(
      NextResponse.json({ success: false, error: "pre_order_id is required" }, { status: 400 })
    );
  }

  try {
    const result = await deductZeelinBalance(preOrderId, costBalance);
    return withCors(
      NextResponse.json({
        success: true,
        order_id: result.order_id,
        cost_balance: result.cost_balance,
        remain_calls: result.remain_calls,
      })
    );
  } catch (err) {
    const msg = (err as Error).message;
    return withCors(
      NextResponse.json({ success: false, error: msg }, { status: 500 })
    );
  }
}
