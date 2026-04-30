export type NormalizedSunoSong = {
  id: string;
  title: string;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
  duration?: number;
  model?: string;
};

export type NormalizedSunoResult = {
  taskId: string;
  rawStatus: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  musicList: NormalizedSunoSong[];
  isFinal: boolean;
  hasDownloadableAudio: boolean;
};

const FAILED_STATUSES = new Set([
  "FAILED",
  "ERROR",
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getResponseContainer(data: unknown): UnknownRecord {
  const root = asRecord(data);
  const dataRecord = asRecord(root.data);
  const dataResponse = dataRecord.response;
  if (isRecord(dataResponse)) return dataResponse;
  if (isRecord(root.response)) return root.response;
  if (isRecord(root.data)) return root.data;
  return root;
}

function getRawMusicList(data: unknown): unknown[] {
  const root = asRecord(data);
  const dataRecord = asRecord(root.data);
  const dataResponse = asRecord(dataRecord.response);
  const responseData = getResponseContainer(data);
  const candidates = [
    responseData.sunoData,
    responseData.data,
    dataResponse.sunoData,
    dataRecord.data,
    root.sunoData,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function getRawStatus(data: unknown): string {
  const root = asRecord(data);
  const dataRecord = asRecord(root.data);
  const responseData = getResponseContainer(data);
  const callbackType = asString(dataRecord.callbackType || responseData.callbackType);
  if (callbackType === "complete") return "SUCCESS";
  if (callbackType === "first") return "FIRST_SUCCESS";
  if (callbackType === "text") return "TEXT_SUCCESS";
  if (callbackType === "error") return "FAILED";

  return asString(
    responseData.status ||
    dataRecord.status ||
    root.status ||
    "PENDING"
  );
}

function getTaskId(data: unknown): string {
  const root = asRecord(data);
  const dataRecord = asRecord(root.data);
  const responseData = getResponseContainer(data);
  if (typeof root.data === "string") return root.data;
  return asString(
    root.task_id ||
    root.taskId ||
    dataRecord.task_id ||
    dataRecord.taskId ||
    responseData.task_id ||
    responseData.taskId
  );
}

function normalizeSong(item: unknown): NormalizedSunoSong {
  const song = asRecord(item);
  return {
    id: asString(song.id),
    title: asString(song.title) || "Untitled",
    audioUrl: asString(song.audioUrl || song.audio_url || song.source_audio_url),
    streamAudioUrl: asString(song.streamAudioUrl || song.stream_audio_url || song.source_stream_audio_url),
    imageUrl: asString(song.imageUrl || song.image_url || song.source_image_url),
    duration: typeof song.duration === "number" ? song.duration : undefined,
    model: asString(song.modelName || song.model_name),
  };
}

export function normalizeSunoResult(data: unknown): NormalizedSunoResult {
  const rawStatus = getRawStatus(data);
  const normalizedRawStatus = rawStatus.toUpperCase();
  const musicList = getRawMusicList(data)
    .map(normalizeSong)
    .filter((song) => song.id && (song.audioUrl || song.streamAudioUrl));
  const isFinal =
    normalizedRawStatus === "SUCCESS" ||
    normalizedRawStatus === "COMPLETED" ||
    normalizedRawStatus === "COMPLETE";
  const hasDownloadableAudio = musicList.length > 0 && musicList.every((song) => !!song.audioUrl);
  const isFailed = FAILED_STATUSES.has(normalizedRawStatus);

  return {
    taskId: getTaskId(data),
    rawStatus: rawStatus || "PENDING",
    status: isFailed ? "FAILED" : isFinal && hasDownloadableAudio ? "SUCCESS" : "PENDING",
    musicList,
    isFinal,
    hasDownloadableAudio,
  };
}

export function buildSunoCallbackUrl(req: Request): string {
  if (process.env.SUNO_CALLBACK_URL) return process.env.SUNO_CALLBACK_URL;
  const url = new URL(req.url);
  return `${url.origin}/api/suno-callback`;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isOfficialSunoApi(baseUrl: string): boolean {
  return /sunoapi\.org/i.test(baseUrl);
}

function officialApiBase(baseUrl: string): string {
  const base = trimTrailingSlash(baseUrl);
  return /\/api\/v1$/i.test(base) ? base : `${base}/api/v1`;
}

export function getSunoModel(baseUrl: string): string {
  if (process.env.SUNO_MODEL) return process.env.SUNO_MODEL;
  return isOfficialSunoApi(baseUrl) ? "V5" : "suno-v5";
}

export function buildSunoGenerateUrl(baseUrl: string): string {
  if (isOfficialSunoApi(baseUrl)) return `${officialApiBase(baseUrl)}/generate`;
  return `${trimTrailingSlash(baseUrl)}/v1/music/generations`;
}

export function buildSunoStatusRequest(baseUrl: string, apiKey: string, taskId: string): [string, RequestInit] {
  if (isOfficialSunoApi(baseUrl)) {
    return [
      `${officialApiBase(baseUrl)}/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
      },
    ];
  }

  return [
    `${trimTrailingSlash(baseUrl)}/v1/music/result`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: getSunoModel(baseUrl), task_id: taskId }),
    },
  ];
}
