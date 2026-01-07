// app/api/create/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.LYRICS_API_KEY,
  baseURL: process.env.LYRICS_BASE_URL,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 【修改】新增 customTitle 参数
    const { action, topic, customTitle, styleLabel, styleTags, mood, isInstrumental, customLyrics } = body;

    // 1. 生成歌词模式
    if (action === "generate_lyrics") {
      // ... (此处保持之前的歌词生成代码不变，省略以节省空间) ...
      // 请保留原有的 prompt 和 openai 调用逻辑
      
      const prompt = `你是一位世界顶级的音乐制作人和作词人。请根据用户提供的主题，创作一首完整的歌词。
      【用户输入主题】：${topic}
      【音乐风格】：${styleLabel}
      【情绪基调】：${mood}
      【创作要求】：
      1. 语言判定：请根据"${topic}"的语言决定歌词语言。
      2. 故事扩展：自行脑补画面，扩展故事细节。
      3. 篇幅限制：300字以内。
      4. 句子长度：每句歌词不超过15字，尽量控制在12字以内。
      5. 段落长度：每段歌词不超过6句，段落内保持押韵。
      6. 对仗要求：副歌1和副歌2必须严格对仗（字数相近、结构相似、韵律对称）。
      【严格结构要求】：
      [Instrumental]
      [Verse 1] (主歌1：铺垫背景，引入故事，最多6句，每句≤15字)
      [Pre-Chorus] (预副歌：情绪爬升，最多6句，每句≤15字)
      [Powerful Chorus 1] (副歌1：情感爆发，核心记忆点，最多6句，每句≤15字)
      [Powerful Chorus 2] (副歌2：必须与副歌1严格对仗，深化主题，最多6句，每句≤15字)
      [Verse 2] (主歌2：推进情节，细节描写，最多6句，每句≤15字)
      [Pre-Chorus] (预副歌：情绪爬升，最多6句，每句≤15字)
      [Powerful Chorus 1] (副歌1回归：最后的高潮，最多6句，每句≤15字)
      [Powerful Chorus 2] (副歌2回归：必须与副歌1严格对仗，最后的高潮，最多6句，每句≤15字)
      [Bridge] (桥段：节奏或视角的转变，情绪转折，最多6句，每句≤15字)
      [Powerful Chorus 2] (副歌2回归：必须与副歌1严格对仗，最后的高潮，最多6句，每句≤15字)
      [Outro] (结尾：余韵悠长，逐渐淡出，最多6句，每句≤15字)
      【输出格式】：只输出歌词正文。`;

      const chatCompletion = await openai.chat.completions.create({
        model: "gemini-3-pro-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const lyrics = chatCompletion.choices[0].message.content || "";
      return NextResponse.json({ success: true, lyrics });
    }

    // 2. 作曲模式
    if (action === "generate_music") {
      console.log(`🎵 提交作曲: [${customTitle || topic}]`);

      let finalPrompt = "";
      if (isInstrumental) {
        finalPrompt = topic; 
      } else {
        finalPrompt = customLyrics;
      }

      // 【修改】优先使用用户修改过的歌名，如果没有才用主题
      // Suno 标题限制 90 字符
      const finalTitle = (customTitle || topic).slice(0, 90);

      const sunoPayload = {
        prompt: finalPrompt,
        style: styleTags,
        title: finalTitle, // 使用最终标题
        model: "V5",
        customMode: true,
        instrumental: isInstrumental,
        callBackUrl: "https://www.google.com"
      };

      const sunoRes = await fetch(`${process.env.SUNO_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.SUNO_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(sunoPayload)
      });

      const sunoData = await sunoRes.json();
      const taskId = sunoData.data?.taskId || sunoData.taskId || sunoData.data;

      if (!taskId) throw new Error("Suno API 未返回 Task ID");

      return NextResponse.json({ success: true, taskId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}