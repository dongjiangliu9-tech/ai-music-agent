/**
 * 智灵(ZeeLin) Skill 计费工具库
 * 文档：https://skills.zeelin.cn
 *
 * 流程：
 * 1. 调用 checkBalance() 验证余额、获取 pre_order_id
 * 2. 执行 skill 功能逻辑
 * 3. 成功 → 调用 deductBalance(pre_order_id, cost)
 *    失败 → 跳过扣费，抛出异常
 */

const ZEELIN_BASE_URL = "https://skills.zeelin.cn";
const ZEELIN_APP_KEY = process.env.ZEELIN_APP_KEY || "";
const ZEELIN_SKILL_ID = process.env.ZEELIN_SKILL_ID || "";

// 每次生成音乐扣减的额度（根据实际情况调整）
export const ZEELIN_COST_PER_GENERATION = parseInt(
  process.env.ZEELIN_COST_PER_GENERATION || "2",
  10
);

export interface ZeelinCheckResult {
  pre_order_id: string;
  remain_calls: number;
  skill_id: string;
}

/**
 * 记录调用日志（用于审计）
 */
function logZeelin(action: string, data: Record<string, unknown>) {
  const ts = new Date().toISOString();
  console.log(`[ZeeLin][${ts}][${action}]`, JSON.stringify(data));
}

/**
 * 带重试的 fetch 封装（默认重试 3 次）
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastError = err as Error;
      logZeelin("RETRY", { url, attempt: i + 1, error: (err as Error).message });
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
      }
    }
  }
  throw lastError || new Error("fetchWithRetry failed");
}

/**
 * 第一步：额度校验
 * 返回 pre_order_id（2小时内有效）和剩余额度
 */
export async function checkZeelinBalance(query: string): Promise<ZeelinCheckResult> {
  if (!ZEELIN_APP_KEY) throw new Error("Missing env: ZEELIN_APP_KEY");
  if (!ZEELIN_SKILL_ID) throw new Error("Missing env: ZEELIN_SKILL_ID");

  const payload = {
    query,
    "skill-id": ZEELIN_SKILL_ID,
  };

  logZeelin("CHECK_BALANCE_REQUEST", { skill_id: ZEELIN_SKILL_ID, query });

  let res: Response;
  try {
    res = await fetchWithRetry(
      `${ZEELIN_BASE_URL}/v2/api/skill/detail`,
      {
        method: "POST",
        headers: {
          "app-key": ZEELIN_APP_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      3
    );
  } catch (err) {
    logZeelin("CHECK_BALANCE_NETWORK_ERROR", { error: (err as Error).message });
    throw new Error(`智灵余额校验网络错误: ${(err as Error).message}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    logZeelin("CHECK_BALANCE_PARSE_ERROR", { status: res.status });
    throw new Error("智灵余额校验接口返回格式异常");
  }

  logZeelin("CHECK_BALANCE_RESPONSE", { status: res.status, code: data?.code, message: data?.message });

  if (data?.code === 402) {
    throw new Error("智灵账户余额不足，请前往 https://skills.zeelin.cn 充值后再使用");
  }

  if (data?.code !== 200 || !data?.data?.pre_order_id) {
    throw new Error(`智灵余额校验失败: ${data?.message || "未知错误"} (code: ${data?.code})`);
  }

  return {
    pre_order_id: data.data.pre_order_id,
    remain_calls: data.data.remain_calls,
    skill_id: data.data.skill_id,
  };
}

/**
 * 第三步：扣减额度（在 skill 功能成功完成后调用）
 */
export async function deductZeelinBalance(
  preOrderId: string,
  costBalance: number = ZEELIN_COST_PER_GENERATION
): Promise<{ order_id: string; cost_balance: number; remain_calls: number }> {
  if (!ZEELIN_APP_KEY) throw new Error("Missing env: ZEELIN_APP_KEY");
  if (!ZEELIN_SKILL_ID) throw new Error("Missing env: ZEELIN_SKILL_ID");

  const payload = {
    "order-id": preOrderId,
    "cost-balance": costBalance,
    "skill-id": ZEELIN_SKILL_ID,
  };

  logZeelin("DEDUCT_REQUEST", { pre_order_id: preOrderId, cost_balance: costBalance });

  let res: Response;
  try {
    res = await fetchWithRetry(
      `${ZEELIN_BASE_URL}/v2/api/skill/cost`,
      {
        method: "POST",
        headers: {
          "app-key": ZEELIN_APP_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      3
    );
  } catch (err) {
    logZeelin("DEDUCT_NETWORK_ERROR", { error: (err as Error).message, pre_order_id: preOrderId });
    throw new Error(`智灵扣费网络错误: ${(err as Error).message}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    logZeelin("DEDUCT_PARSE_ERROR", { status: res.status });
    throw new Error("智灵扣费接口返回格式异常");
  }

  logZeelin("DEDUCT_RESPONSE", {
    status: res.status,
    code: data?.code,
    message: data?.message,
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
