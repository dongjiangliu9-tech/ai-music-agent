/**
 * 智灵(ZeeLin) Skill 计费工具库
 * 文档：https://skills.zeelin.cn
 *
 * 流程：
 * 1. checkZeelinBalance(appKey, query) → 获取 pre_order_id
 * 2. 执行 skill 功能
 * 3. 成功 → deductZeelinBalance(appKey, preOrderId, cost)
 *    失败 → 跳过扣费
 */

const ZEELIN_BASE_URL = "https://skills.zeelin.cn";
const ZEELIN_SKILL_ID = process.env.ZEELIN_SKILL_ID || "zeelin_ParDdTaM9W81iKiRZndwSCXW0";

// 每次生成音乐扣减的额度
export const ZEELIN_COST_PER_GENERATION = parseInt(
  process.env.ZEELIN_COST_PER_GENERATION || "200",
  10
);

export interface ZeelinCheckResult {
  pre_order_id: string;
  remain_calls: number;
  skill_id: string;
}

/** 记录调用日志（用于审计） */
function logZeelin(action: string, data: Record<string, unknown>) {
  const ts = new Date().toISOString();
  console.log(`[ZeeLin][${ts}][${action}]`, JSON.stringify(data));
}

/** 带重试的 fetch（默认最多 3 次） */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err as Error;
      logZeelin("RETRY", { url, attempt: i + 1, error: (err as Error).message });
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError || new Error("fetchWithRetry failed");
}

/**
 * 第一步：余额校验
 * @param appKey 用户自己的智灵 App-Key
 * @param query  本次调用描述（用于订单日志）
 */
export async function checkZeelinBalance(
  appKey: string,
  query: string
): Promise<ZeelinCheckResult> {
  if (!appKey) throw new Error("请提供智灵 App-Key，前往 https://skills.zeelin.cn 注册获取");
  if (!ZEELIN_SKILL_ID) throw new Error("Missing env: ZEELIN_SKILL_ID");

  logZeelin("CHECK_BALANCE_REQUEST", { skill_id: ZEELIN_SKILL_ID, query });

  const res = await fetchWithRetry(
    `${ZEELIN_BASE_URL}/v2/api/skill/detail`,
    {
      method: "POST",
      headers: {
        "app-key": appKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, "skill-id": ZEELIN_SKILL_ID }),
    }
  );

  let data: any;
  try { data = await res.json(); } catch {
    throw new Error("智灵余额校验接口返回格式异常");
  }

  logZeelin("CHECK_BALANCE_RESPONSE", {
    status: res.status, code: data?.code, message: data?.message,
    remain_calls: data?.data?.remain_calls,
  });

  if (data?.code === 402) {
    throw new Error(`智灵账户余额不足（剩余 ${data?.data?.remain_calls ?? 0} 额度），请前往 https://skills.zeelin.cn 充值`);
  }
  if (data?.code === 404) {
    throw new Error("智灵 App-Key 无效，请前往 https://skills.zeelin.cn/console/apps 确认");
  }
  if (data?.code !== 200 || !data?.data?.pre_order_id) {
    throw new Error(`智灵余额校验失败: ${data?.message || "未知错误"} (code: ${data?.code})`);
  }

  // 余额低于单次消耗时也提前拦截
  if ((data.data.remain_calls ?? 0) < ZEELIN_COST_PER_GENERATION) {
    throw new Error(
      `智灵账户余额不足（剩余 ${data.data.remain_calls} 额度，生成一首歌需要 ${ZEELIN_COST_PER_GENERATION} 额度），请前往 https://skills.zeelin.cn 充值`
    );
  }

  return {
    pre_order_id: data.data.pre_order_id,
    remain_calls: data.data.remain_calls,
    skill_id: data.data.skill_id,
  };
}

/**
 * 第三步：扣减额度（在 skill 功能成功完成后调用）
 * @param appKey     用户自己的智灵 App-Key
 * @param preOrderId checkZeelinBalance 返回的预订单 ID
 * @param cost       扣减额度，默认 ZEELIN_COST_PER_GENERATION
 */
export async function deductZeelinBalance(
  appKey: string,
  preOrderId: string,
  cost: number = ZEELIN_COST_PER_GENERATION
): Promise<{ order_id: string; cost_balance: number; remain_calls: number }> {
  if (!appKey) throw new Error("缺少智灵 App-Key");
  if (!ZEELIN_SKILL_ID) throw new Error("Missing env: ZEELIN_SKILL_ID");

  logZeelin("DEDUCT_REQUEST", { pre_order_id: preOrderId, cost_balance: cost });

  const res = await fetchWithRetry(
    `${ZEELIN_BASE_URL}/v2/api/skill/cost`,
    {
      method: "POST",
      headers: {
        "app-key": appKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "order-id": preOrderId,
        "cost-balance": cost,
        "skill-id": ZEELIN_SKILL_ID,
      }),
    }
  );

  let data: any;
  try { data = await res.json(); } catch {
    throw new Error("智灵扣费接口返回格式异常");
  }

  logZeelin("DEDUCT_RESPONSE", {
    status: res.status, code: data?.code, message: data?.message,
    order_id: data?.data?.order_id,
    cost_balance: data?.data?.cost_balance,
    remain_calls: data?.data?.remain_calls,
  });

  if (data?.code !== 200 || !data?.data?.order_id) {
    throw new Error(`智灵扣费失败: ${data?.message || "未知错误"} (code: ${data?.code})`);
  }

  return {
    order_id: data.data.order_id,
    cost_balance: data.data.cost_balance,
    remain_calls: data.data.remain_calls,
  };
}
