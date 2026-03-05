# ZeeLin网关迁移说明

## 迁移时间
2026-03-05 19:23 GMT+8

## 修改概览
将项目中所有Suno API调用从旧接口迁移到ZeeLin网关。

## API配置变更

### 1. 环境变量 (.env.local)

**旧配置:**
```env
SUNO_API_KEY=90872d9104a898fa9cf3dc33b6801ee9
SUNO_BASE_URL=https://api.sunoapi.org/api/v1
```

**新配置:**
```env
SUNO_API_KEY=sk-rFtZ83Ng0HI28kAf289aAf2eE33c446e8cE9F57587065741
SUNO_BASE_URL=https://getways-jumu.zeelin.cn/v1
```

## API接口变更

### 2. 音乐生成接口 (app/api/generate-music/route.ts)

#### 2.1 请求URL
- **旧**: `${sunoBaseUrl}/generate`
- **新**: `${sunoBaseUrl}/music/generations`

#### 2.2 请求体结构
**旧payload:**
```json
{
  "prompt": "...",
  "style": "...",
  "title": "...",
  "model": "V5",
  "customMode": true,
  "instrumental": false,
  "callBackUrl": "https://www.google.com"
}
```

**新payload (字段顺序调整为ZeeLin标准):**
```json
{
  "model": "suno-v5",
  "customMode": true,
  "instrumental": false,
  "callBackUrl": "https://www.google.com",
  "prompt": "...",
  "style": "...",
  "title": "..."
}
```

**关键变化:**
- `model`: `"V5"` → `"suno-v5"`
- 字段顺序调整为ZeeLin推荐的顺序

#### 2.3 响应体解析
**旧taskId提取:**
```typescript
const taskId = submitData?.data?.taskId || submitData?.taskId || submitData?.data;
```

**新taskId提取:**
```typescript
const taskId = submitData?.task_id || submitData?.data?.taskId || submitData?.taskId;
```

**关键变化:** ZeeLin优先使用 `task_id` 字段

#### 2.4 状态查询接口
**旧接口 (GET):**
```typescript
const infoRes = await fetch(
  `${sunoBaseUrl}/generate/record-info?taskId=${encodeURIComponent(String(taskId))}`,
  {
    headers: { Authorization: `Bearer ${sunoApiKey}` },
    cache: "no-store",
  }
);
```

**新接口 (POST):**
```typescript
const infoRes = await fetch(
  `${sunoBaseUrl}/music/result`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sunoApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_id: String(taskId),
      model: "suno-v5",
    }),
    cache: "no-store",
  }
);
```

**关键变化:**
- GET请求 → POST请求
- URL参数 → JSON请求体
- 需要传递 `model` 参数

### 3. 状态查询接口 (app/api/status/route.ts)

**完全重写为ZeeLin POST接口:**

```typescript
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
  }
);
```

**数据映射兼容性增强:**
```typescript
const musicList = sunoData.map((item: any) => ({
  id: item.id,
  title: item.title || "Untitled",
  audioUrl: item.audioUrl || item.audio_url,
  imageUrl: item.imageUrl || item.image_url,
  duration: item.duration,
  model: item.modelName || item.model_name,  // 添加modelName兼容
}));
```

## ZeeLin网关API规范

### 生成接口
- **路径**: `/v1/music/generations`
- **方法**: POST
- **必需字段**:
  - `model`: "suno-v4" | "suno-v4-5" | "suno-v4-5-all" | "suno-v4-5-plus" | "suno-v5"
  - `customMode`: boolean
  - `instrumental`: boolean
  - `callBackUrl`: string
- **条件必填**:
  - `prompt`: customMode=false必填；customMode=true且instrumental=false时为歌词
  - `style`: customMode=true时必填
  - `title`: customMode=true时必填
- **可选字段**:
  - `personaId`, `personaModel`, `negativeTags`, `vocalGender`
  - `styleWeight`, `weirdnessConstraint`, `audioWeight` (0-1)

### 查询接口
- **路径**: `/v1/music/result`
- **方法**: POST
- **请求体**:
  ```json
  {
    "task_id": "...",
    "model": "suno-v5"
  }
  ```

### 状态枚举
- **处理中**: PENDING, TEXT_SUCCESS
- **完成**: FIRST_SUCCESS, SUCCESS
- **失败**: CREATE_TASK_FAILED, GENERATE_AUDIO_FAILED, CALLBACK_EXCEPTION, SENSITIVE_WORD_ERROR

## 响应数据结构

```json
{
  "code": 200,
  "data": {
    "response": {
      "sunoData": [
        {
          "id": "...",
          "title": "...",
          "audioUrl": "...",
          "imageUrl": "...",
          "duration": 240,
          "modelName": "chirp-v4",
          "prompt": "...",
          "tags": "...",
          "streamAudioUrl": "..."
        }
      ],
      "taskId": "...",
      "status": "FIRST_SUCCESS"
    }
  }
}
```

## 测试建议

1. **测试环境变量**:
   ```bash
   echo $SUNO_API_KEY
   echo $SUNO_BASE_URL
   ```

2. **测试生成请求**:
   ```bash
   curl --location 'https://getways-jumu.zeelin.cn/v1/music/generations' \
   --header 'Authorization: Bearer sk-rFtZ83Ng0HI28kAf289aAf2eE33c446e8cE9F57587065741' \
   --header 'Content-Type: application/json' \
   --data '{
     "model": "suno-v5",
     "customMode": true,
     "instrumental": true,
     "callBackUrl": "https://www.google.com",
     "prompt": "一段平静舒缓的钢琴曲",
     "style": "古典风格",
     "title": "测试曲目"
   }'
   ```

3. **测试查询请求**:
   ```bash
   curl --location 'https://getways-jumu.zeelin.cn/v1/music/result' \
   --header 'Authorization: Bearer sk-rFtZ83Ng0HI28kAf289aAf2eE33c446e8cE9F57587065741' \
   --header 'Content-Type: application/json' \
   --data '{
     "task_id": "YOUR_TASK_ID",
     "model": "suno-v5"
   }'
   ```

## 注意事项

1. **API Key安全**: 
   - 新的API Key已更新到 `.env.local`
   - 确保该文件在 `.gitignore` 中

2. **模型版本**:
   - 统一使用 `suno-v5` 作为默认模型
   - ZeeLin支持多个版本: v4, v4-5, v4-5-all, v4-5-plus, v5

3. **接口方法变化**:
   - 查询接口从GET变为POST
   - 需要在请求体中传递参数

4. **响应结构兼容**:
   - 保持了对旧响应结构的兼容性
   - 同时支持 `audioUrl` 和 `audio_url` 字段
   - 同时支持 `modelName` 和 `model_name` 字段

## 回滚方案

如需回滚到旧API，恢复 `.env.local` 中的配置：

```env
SUNO_API_KEY=90872d9104a898fa9cf3dc33b6801ee9
SUNO_BASE_URL=https://api.sunoapi.org/api/v1
```

并使用 git 恢复代码文件：
```bash
git checkout HEAD -- app/api/generate-music/route.ts app/api/status/route.ts
```

## 相关资源

- ZeeLin网关Playground: https://getways-jumu.zeelin.cn/playground
- 项目路径: /Users/ldjmac/Projects2/ai-music-agent
