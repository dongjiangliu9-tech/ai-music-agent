// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MUSIC_STYLES, MOODS } from "./lib/data";
import { getHistory, saveProject, deleteProject, updateProjectTitle, type Project } from "./lib/storage";
import {
  Music, Sparkles, Download, Disc, Mic2,
  ChevronDown, ChevronUp, Edit3, Trash2, History, AlignLeft, X, Check, Pencil, Copy, Play, Pause
} from "lucide-react";

type GenerationStep = "input" | "lyrics_editing" | "music_processing" | "completed";

// --- 组件：自定义美化下拉菜单 ---
const CustomSelect = ({ label, value, options, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o: any) => o.id === value || o.value === value)?.label || value;
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group flex-1" ref={containerRef}>
      <label className="block text-xs font-bold text-gray-400 mb-2 ml-2 uppercase tracking-wide">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 pl-5 rounded-2xl bg-gray-100 border-2 cursor-pointer flex justify-between items-center transition-all duration-200
          ${isOpen ? "border-purple-500 bg-white shadow-lg" : "border-transparent hover:bg-white hover:shadow-sm"}`}
      >
        <span className="font-bold text-gray-700 truncate mr-2">{selectedLabel}</span>
        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-purple-500" : ""}`} />
      </div>
      
      {/* 下拉列表 */}
      {isOpen && (
  <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt: any) => (
            <div 
              key={opt.id || opt}
              onClick={() => { onChange(opt.id || opt); setIsOpen(false); }}
              className={`p-3 pl-5 cursor-pointer font-medium text-sm transition-colors
                ${(opt.id || opt) === value ? "bg-purple-50 text-purple-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {opt.label || opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 组件：进度条 ---
const ProgressBar = ({ progress, statusText }: { progress: number, statusText: string }) => (
    <div className="w-full max-w-md mx-auto mt-8">
        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-2">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <p className="text-center text-gray-500 font-medium mt-4 animate-pulse">{statusText}</p>
    </div>
);

// --- 组件：自定义音频播放器 ---
const CustomAudioPlayer = ({ src, onPlay }: { src: string, onPlay?: () => void }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
            onPlay?.();
        }
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current || isDragging) return;
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const handlePlay = () => {
        setIsPlaying(true);
        onPlay?.();
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || !progressRef.current) return;

        const rect = progressRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        handleProgressClick(e as React.MouseEvent<HTMLDivElement>);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        e.preventDefault();
        handleProgressClick(e as React.MouseEvent<HTMLDivElement>);
    };

    const handleMouseUp = (e: MouseEvent | TouchEvent) => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        // 模拟鼠标事件
        const touch = e.touches[0] || e.changedTouches[0];
        const simulatedEvent = {
            clientX: touch.clientX,
            preventDefault: () => {},
        } as React.MouseEvent<HTMLDivElement>;
        handleProgressClick(simulatedEvent);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0] || e.changedTouches[0];
        const simulatedEvent = {
            clientX: touch.clientX,
            preventDefault: () => {},
        } as React.MouseEvent<HTMLDivElement>;
        handleProgressClick(simulatedEvent);
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(false);
    };

    // 添加全局鼠标和触摸事件监听
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging && progressRef.current) {
                const rect = progressRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const newTime = percentage * duration;

                if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                }
            }
        };

        const handleGlobalTouchEnd = () => setIsDragging(false);
        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (isDragging && progressRef.current) {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = progressRef.current.getBoundingClientRect();
                const clickX = touch.clientX - rect.left;
                const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                const newTime = percentage * duration;

                if (audioRef.current) {
                    audioRef.current.currentTime = newTime;
                    setCurrentTime(newTime);
                }
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
            document.addEventListener('touchend', handleGlobalTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('touchmove', handleGlobalTouchMove);
            document.removeEventListener('touchend', handleGlobalTouchEnd);
        };
    }, [isDragging, duration]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={() => setIsPlaying(false)}
                controls={false}
                style={{ display: 'none' }}
            />

            {/* 进度条 */}
            <div className="mb-4">
                <div
                    ref={progressRef}
                    className="relative h-4 bg-gray-200 rounded-full cursor-pointer overflow-hidden select-none hover:bg-gray-300 transition-colors duration-200 touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-100"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                    {/* 拖拽指示器 */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-600 border-2 border-white rounded-full shadow-xl transition-all duration-200"
                        style={{
                            left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 10px)`,
                            opacity: isDragging ? 1 : undefined,
                            transform: isDragging ? 'scale(1.2)' : undefined,
                            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                </div>
            </div>

            {/* 控制区域 */}
            <div className="flex items-center justify-between">
                <button
                    onClick={togglePlay}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg ${
                        isPlaying
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                    } hover:scale-105`}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} fill="white" />}
                </button>

                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span className="min-w-[35px] text-center">{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span className="min-w-[35px] text-center">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
  // 核心状态
  const [topic, setTopic] = useState("");
  const [songTitle, setSongTitle] = useState(""); // 【新增】歌名状态
  const [selectedStyle, setSelectedStyle] = useState(MUSIC_STYLES[0].id); // 存ID
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [isInstrumental, setIsInstrumental] = useState(false);
  
  // 流程与UI状态
  const [step, setStep] = useState<GenerationStep>("input");
  const [lyrics, setLyrics] = useState(""); 
  const [progress, setProgress] = useState(0); // 【新增】进度条数值
  const [statusText, setStatusText] = useState("");
  
  // 播放与历史
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeSongIndex, setActiveSongIndex] = useState(0); 
  const [showLyricsPanel, setShowLyricsPanel] = useState(false); 
  const [historyList, setHistoryList] = useState<Project[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false); // 【新增】是否正在修改标题
  const [tempTitle, setTempTitle] = useState(""); // 【新增】修改标题时的临时变量
  const [copySuccess, setCopySuccess] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  // 加载历史
  useEffect(() => { setHistoryList(getHistory()); }, []);

  // 进度条模拟逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "music_processing") {
        setProgress(0);
        // 模拟进度：快速到30%，慢慢到80%，最后等待完成
        interval = setInterval(() => {
            setProgress(old => {
                if (old < 30) return old + 2;
                if (old < 80) return old + 0.5;
                return old;
            });
        }, 200);
    }
    return () => clearInterval(interval);
  }, [step]);

  // 1. 生成歌词
  const handleLyricsGeneration = async () => {
    if (!topic) return alert("请先输入歌曲主题！");
    
    // 初始化歌名 (默认为主题)
    setSongTitle(topic);

    if (isInstrumental) {
      handleMusicGeneration(null, topic); 
      return;
    }
    setStep("music_processing"); 
    setStatusText("正在构建歌词结构与叙事...");
    setProgress(10); // 初始进度

    try {
      const styleObj = MUSIC_STYLES.find(s => s.id === selectedStyle) || MUSIC_STYLES[0];
      const randomTag = styleObj.tags[Math.floor(Math.random() * styleObj.tags.length)];
      
      const res = await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify({ 
          action: "generate_lyrics",
          topic, 
          styleTags: randomTag,
          styleLabel: styleObj.label,
          mood: selectedMood,
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setLyrics(data.lyrics);
      setStep("lyrics_editing");
    } catch (e: any) {
      alert("歌词生成失败: " + e.message);
      setStep("input");
    }
  };

  // 2. 提交作曲
  const handleMusicGeneration = async (finalLyrics: string | null, finalTitle: string) => {
    setStep("music_processing");
    setStatusText("Suno V5 正在编曲与录制 (生成双版本)...");
    setProgress(0); // 重置进度条

    try {
      const styleObj = MUSIC_STYLES.find(s => s.id === selectedStyle) || MUSIC_STYLES[0];
      const randomTag = styleObj.tags[Math.floor(Math.random() * styleObj.tags.length)];
      
      const res = await fetch("/api/create", {
        method: "POST",
        body: JSON.stringify({ 
          action: "generate_music",
          topic, 
          customTitle: finalTitle, // 【新增】传修改后的歌名
          styleTags: randomTag,
          isInstrumental,
          customLyrics: finalLyrics 
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      // 开始轮询
      pollStatus(data.taskId, finalLyrics || "", finalTitle);

    } catch (e: any) {
      alert("提交失败: " + e.message);
      setStep("input");
    }
  };

  // 3. 轮询状态
  const pollStatus = async (taskId: string, savedLyrics: string, savedTitle: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?taskId=${taskId}`);
        const data = await res.json();
        
        if (data.status === "SUCCESS" && data.musicList && data.musicList.length > 0) {
          clearInterval(interval);
          setProgress(100);
          
          // 给生成的歌曲对象强行覆盖 title (Suno有时候返回的title不对)
          const songsWithTitle = data.musicList.map((s: any) => ({ ...s, title: savedTitle }));

          const newProject: Project = {
            id: Date.now().toString(),
            topic,
            title: savedTitle, // 保存最终歌名
            styleLabel: MUSIC_STYLES.find(s => s.id === selectedStyle)?.label || "",
            lyrics: savedLyrics,
            songs: songsWithTitle,
            createdAt: Date.now(),
            isInstrumental
          };

          const updatedHistory = saveProject(newProject);
          setHistoryList(updatedHistory);
          
          setTimeout(() => loadProject(newProject), 500); // 稍微停顿展示100%

        } else if (data.status === "FAILED") {
          clearInterval(interval);
          alert("Suno 生成失败");
          setStep("input");
        }
      } catch (e) { console.error(e); }
    }, 5000);
  };

  // 加载项目
  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setLyrics(project.lyrics);
    setTopic(project.topic);
    setSongTitle(project.title); // 加载歌名
    setActiveSongIndex(0);
    setStep("completed");
    setIsEditingTitle(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 修改标题 (播放页)
  const handleUpdateTitle = () => {
    if (currentProject && tempTitle.trim()) {
        const updatedHistory = updateProjectTitle(currentProject.id, tempTitle);
        setHistoryList(updatedHistory);
        // 更新当前视图
        const updatedProject = updatedHistory.find(p => p.id === currentProject.id);
        if (updatedProject) setCurrentProject(updatedProject);
        setIsEditingTitle(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("确定要删除这条创作记录吗？")) {
        const updated = deleteProject(id);
        setHistoryList(updated);
        if (currentProject?.id === id) {
            setCurrentProject(null);
            setStep("input");
        }
    }
  };

  const handlePlay = (index: number) => {
    audioRefs.current.forEach((audio, i) => { if (i !== index && audio) audio.pause(); });
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      // 检测是否为移动设备
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // 移动设备：优先使用Web Share API
        if (supportsWebShare()) {
          await shareAudioFile(url, title);
        } else {
          // 创建一个更友好的下载提示页面
          const downloadWindow = window.open('', '_blank', 'width=400,height=300');
          if (downloadWindow) {
            downloadWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>下载音乐 - ${title}</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      margin: 0;
                      padding: 20px;
                      min-height: 100vh;
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      justify-content: center;
                      text-align: center;
                    }
                    .container {
                      max-width: 300px;
                      background: rgba(255, 255, 255, 0.1);
                      padding: 30px;
                      border-radius: 20px;
                      backdrop-filter: blur(10px);
                      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    .title {
                      font-size: 24px;
                      font-weight: bold;
                      margin-bottom: 10px;
                    }
                    .subtitle {
                      font-size: 16px;
                      opacity: 0.8;
                      margin-bottom: 30px;
                    }
                    .download-btn {
                      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                      color: white;
                      border: none;
                      padding: 15px 30px;
                      border-radius: 50px;
                      font-size: 16px;
                      font-weight: bold;
                      cursor: pointer;
                      text-decoration: none;
                      display: inline-block;
                      transition: transform 0.2s;
                    }
                    .download-btn:hover {
                      transform: scale(1.05);
                    }
                    .instructions {
                      margin-top: 20px;
                      font-size: 14px;
                      opacity: 0.7;
                      line-height: 1.5;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="title">${title}</div>
                    <div class="subtitle">AI Music Studio 音乐作品</div>
                    <a href="${url}" class="download-btn" download="${title}.mp3">下载 MP3</a>
                    <div class="instructions">
                      点击上方按钮下载音乐文件。<br>
                      如果下载不开始，请长按链接并选择"下载链接"。
                    </div>
                  </div>
                </body>
              </html>
            `);
            downloadWindow.document.close();
          } else {
            // 如果弹窗被阻止，直接打开URL
            window.open(url, '_blank');
          }
        }
      } else {
        // 桌面设备：尝试直接下载
        const response = await fetch(url);
        const blob = await response.blob();
        const urlObj = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObj;
        a.download = `${title}.mp3`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlObj);
      }
    } catch (error) {
      console.error('下载失败:', error);
      // 降级方案：直接打开链接
      window.open(url, '_blank');
    }
  };

  // 过滤歌词内容，移除[]标签
  const filterLyricsForDisplay = (lyrics: string) => {
    return lyrics.replace(/\[[^\]]*\]/g, '').trim();
  };

  // 检查是否支持Web Share API
  const supportsWebShare = () => {
    return navigator.share && navigator.canShare;
  };

  // 移动端分享音频文件
  const shareAudioFile = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `${title}.mp3`, { type: 'audio/mpeg' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${title} - AI Music Studio`,
          text: '分享来自AI Music Studio的音乐作品'
        });
      } else {
        // 如果不支持文件分享，回退到URL分享
        await navigator.share({
          title: `${title} - AI Music Studio`,
          text: '分享来自AI Music Studio的音乐作品',
          url: url
        });
      }
    } catch (error) {
      console.error('分享失败:', error);
      // 分享失败时回退到打开URL
      window.open(url, '_blank');
    }
  };

  const handleCopyLyrics = async (lyrics: string) => {
    try {
      await navigator.clipboard.writeText(lyrics);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = lyrics;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-6 md:py-12 px-4 font-sans text-gray-800 selection:bg-purple-200">
      
      {/* 顶部栏 */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 animate-fade-in-down">
        <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 text-gray-900 tracking-tight cursor-pointer" onClick={()=>setStep("input")}>
          <Sparkles className="text-purple-600 fill-purple-600" />
          AI Music Studio
        </h1>
        {step !== "input" && (
            <button onClick={() => {setStep("input"); setCurrentProject(null)}} className="bg-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-2">
               <Edit3 size={14}/> 新创作
            </button>
        )}
      </div>

      <div className="w-full max-w-5xl transition-all duration-500 flex flex-col lg:flex-row gap-8">
        
        {/* === 左侧核心区 === */}
        <div className="flex-1 w-full min-w-0">
            
            {/* 1. 输入阶段 */}
            {step === "input" && (
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 md:p-10 border border-white animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>

                <div className="flex justify-end mb-8 relative z-10">
                    <button 
                        onClick={() => setIsInstrumental(!isInstrumental)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 border-2
                            ${isInstrumental 
                                ? "border-purple-600 text-purple-600 bg-purple-50" 
                                : "border-gray-200 text-gray-400 hover:border-gray-300"}`}
                    >
                        {isInstrumental ? <Music size={16}/> : <Mic2 size={16}/>}
                        {isInstrumental ? "纯音乐模式" : "人声模式"}
                    </button>
                </div>

                <div className="mb-8 relative z-10">
                    <label className="block text-sm font-bold text-gray-400 mb-3 ml-1 uppercase tracking-wider">创作主题</label>
                    <textarea 
                        rows={2}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={isInstrumental ? "输入画面感，例如：雨夜、赛博朋克..." : "输入主题，例如：关于未来的梦想..."}
                        className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white transition-all outline-none text-xl font-medium shadow-inner resize-none placeholder:text-gray-300"
                    />
                </div>

                {/* 升级后的下拉选择 UI */}
                <div className="flex flex-col md:flex-row gap-6 mb-12 relative z-20">
                    <CustomSelect 
                        label="音乐风格" 
                        value={selectedStyle} 
                        options={MUSIC_STYLES.map(s => ({label: s.label, id: s.id}))}
                        onChange={setSelectedStyle} 
                    />
                    <CustomSelect 
                        label="情绪氛围" 
                        value={selectedMood} 
                        options={MOODS}
                        onChange={setSelectedMood} 
                    />
                </div>

                <button 
                    onClick={handleLyricsGeneration}
                    className="w-full py-5 rounded-2xl text-white font-black text-xl shadow-xl shadow-purple-200 flex items-center justify-center gap-3 transition-transform active:scale-[0.98] bg-gradient-to-r from-purple-600 to-indigo-600 relative z-10 hover:brightness-105"
                >
                    <Sparkles className="fill-white" /> 
                    {isInstrumental ? "立即创作音乐" : "下一步：生成歌词"}
                </button>
            </div>
            )}

            {/* 2. 歌词编辑 & 歌名修改阶段 */}
            {step === "lyrics_editing" && (
            <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-10 border border-white animate-in slide-in-from-bottom-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-700">
                        <Edit3 className="text-purple-600" /> 
                        创作工作台
                    </h2>
                </div>

                {/* 歌名修改输入框 */}
                <div className="mb-6 bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <label className="block text-xs font-bold text-purple-400 mb-2 uppercase">Song Title (歌名)</label>
                    <input 
                        type="text" 
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-2xl font-black text-purple-900 placeholder:text-purple-300"
                        placeholder="给这首歌起个名字..."
                    />
                </div>
                
                <textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    className="w-full h-[350px] p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none text-base leading-loose font-medium text-gray-700 mb-8 resize-none shadow-inner"
                />

                <div className="flex gap-4">
                    <button onClick={() => setStep("input")} className="flex-1 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">返回修改</button>
                    <button 
                        onClick={() => handleMusicGeneration(lyrics, songTitle || topic)} 
                        className="flex-[2] py-4 rounded-xl text-white font-bold text-lg shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                        <Disc /> 确认并生成音乐
                    </button>
                </div>
            </div>
            )}

            {/* 3. 加载中 (带进度条) */}
            {step === "music_processing" && (
                <div className="bg-white rounded-[2rem] shadow-xl p-12 text-center animate-in fade-in flex flex-col items-center justify-center min-h-[400px]">
                    <div className="relative mb-8">
                         <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-75"></div>
                         <div className="relative bg-white p-4 rounded-full shadow-md">
                            <Disc className="w-12 h-12 text-purple-600 animate-spin-slow"/>
                         </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-gray-800 mb-2 tracking-tight">AI Creating...</h3>
                    
                    {/* 进度条组件 */}
                    <ProgressBar progress={progress} statusText={statusText} />
                </div>
            )}

            {/* 4. 完成 - 播放器 (支持改名) */}
            {step === "completed" && currentProject && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-10">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60 relative">
                        <div className={`relative p-6 md:p-10 flex flex-col items-center text-center transition-all duration-500 ${
                            showLyricsPanel ? 'h-[1000px] md:h-[1100px]' : ''
                        }`}>
                            {/* 封面和歌词切换区域 */}
                            <div className={`relative mb-8 transition-all duration-500 ${
                                showLyricsPanel ? 'w-full h-[800px] md:h-[900px]' : 'w-56 h-56 md:w-72 md:h-72'
                            }`}>
                                {/* 封面 */}
                                <div
                                    className={`absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 ${
                                        showLyricsPanel ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                                    }`}
                                    onClick={() => !currentProject.isInstrumental && setShowLyricsPanel(true)}
                                >
                                    <img
                                        src={currentProject.songs[activeSongIndex].imageUrl}
                                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                        alt="Album Cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    {!currentProject.isInstrumental && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-black/70 rounded-full p-4 backdrop-blur-sm">
                                                <AlignLeft size={32} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 歌词面板 */}
                                {!currentProject.isInstrumental && (
                                    <div
                                        className={`absolute inset-0 w-full h-full overflow-hidden transition-all duration-500 ${
                                            showLyricsPanel ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                                        }`}
                                        style={showLyricsPanel ? {
                                            top: '0',
                                            left: '0',
                                            right: '0',
                                            bottom: '0',
                                            height: '100%'
                                        } : {}}
                                    >
                                        {/* 深蓝色玻璃效果背景 - 手机端几乎全屏 */}
                                        <div className="absolute inset-1 sm:inset-2 bg-slate-900/30 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] border border-slate-700/50 shadow-2xl"></div>

                                        {/* 歌词面板背景 - 深蓝渐变 - 手机端几乎全屏 */}
                                        <div className="absolute inset-1 sm:inset-2 bg-gradient-to-br from-slate-800/40 via-blue-900/30 to-indigo-900/40 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem]"></div>
                                        <div className="absolute inset-1 sm:inset-2 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-700/20 rounded-[1.5rem] sm:rounded-[2rem]"></div>

                                        {/* 内容区域 - 手机端更大的内边距 */}
                                        <div className="relative w-full h-full p-3 sm:p-4 md:p-6 flex flex-col">
                                            <div className="flex justify-end items-center mb-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCopyLyrics(filterLyricsForDisplay(currentProject.lyrics || ""))}
                                                        className={`p-2 rounded-full transition-all duration-300 border ${
                                                            copySuccess
                                                                ? 'bg-emerald-500/80 backdrop-blur-sm text-white border-emerald-400/50'
                                                                : 'bg-slate-600/40 backdrop-blur-sm text-cyan-200 hover:bg-slate-500/50 border-slate-500/30'
                                                        }`}
                                                        title={copySuccess ? "已复制" : "复制歌词"}
                                                    >
                                                        {copySuccess ? (
                                                            <Check size={16} className="animate-in zoom-in duration-200"/>
                                                        ) : (
                                                            <Copy size={16}/>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setShowLyricsPanel(false)}
                                                        className="p-2 bg-slate-600/40 backdrop-blur-sm text-cyan-200 rounded-full hover:bg-slate-500/50 transition-colors border border-slate-500/30"
                                                        title="返回封面"
                                                    >
                                                        <X size={16}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex-1 custom-scrollbar-auto">
                                                <div className="text-cyan-100 text-base md:text-lg leading-relaxed font-medium text-center tracking-wide max-w-4xl mx-auto"
                                                     style={{
                                                         textShadow: '0 0 15px rgba(34, 211, 238, 0.3), 0 0 30px rgba(34, 211, 238, 0.1)',
                                                         filter: 'drop-shadow(0 0 5px rgba(34, 211, 238, 0.2))'
                                                     }}>
                                                    <div
                                                        className="prose prose-invert max-w-none"
                                                        style={{
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'break-word',
                                                            whiteSpace: 'pre-line',
                                                            lineHeight: '1.4',
                                                            letterSpacing: '0.02em',
                                                            wordWrap: 'break-word',
                                                            hyphens: 'auto'
                                                        }}
                                                    >
                                                        {filterLyricsForDisplay(currentProject.lyrics || "暂无歌词").split('\n\n').map((paragraph, index) => (
                                                            <div key={index} className="mb-3 last:mb-0">
                                                                {paragraph.split('\n').map((line, lineIndex) => (
                                                                    <div
                                                                        key={lineIndex}
                                                                        className="mb-2 last:mb-0 transition-all duration-500 hover:text-cyan-200 cursor-default select-text px-2 py-1 rounded-md hover:bg-slate-600/20"
                                                                        style={{
                                                                            animationDelay: `${(index * 2 + lineIndex) * 100}ms`,
                                                                            textShadow: '0 0 8px rgba(34, 211, 238, 0.4)'
                                                                        }}
                                                                    >
                                                                        {line || '\u00A0'} {/* 空行显示空格 */}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- 标题修改区 --- */}
                            <div className={`w-full flex justify-center items-center gap-3 mb-2 relative transition-all duration-500 ${
                                showLyricsPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
                            }`}>
                                {isEditingTitle ? (
                                    <div className="flex flex-col gap-4 w-full animate-in fade-in px-4">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            className="w-full bg-gray-100 rounded-xl px-6 py-4 text-xl md:text-2xl font-black text-center outline-none border-2 border-purple-500 focus:border-purple-600 transition-colors"
                                            placeholder="输入歌曲标题..."
                                        />
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={handleUpdateTitle}
                                                className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors min-w-[80px] min-h-[44px] flex items-center justify-center"
                                            >
                                                <Check size={20}/>
                                                <span className="ml-2 hidden sm:inline">确定</span>
                                            </button>
                                            <button
                                                onClick={() => setIsEditingTitle(false)}
                                                className="px-6 py-3 bg-gray-200 text-gray-500 rounded-xl font-bold text-lg hover:bg-gray-300 transition-colors min-w-[80px] min-h-[44px] flex items-center justify-center"
                                            >
                                                <X size={20}/>
                                                <span className="ml-2 hidden sm:inline">取消</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="group flex items-center gap-2 justify-center w-full">
                                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight line-clamp-1">
                                            {currentProject.title || currentProject.topic}
                                        </h2>
                                        <button 
                                            onClick={() => {
                                                setTempTitle(currentProject.title || currentProject.topic);
                                                setIsEditingTitle(true);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-purple-600 transition-all"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <p className={`text-purple-600 font-bold mb-8 text-sm uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full transition-all duration-500 ${
                                showLyricsPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
                            }`}>{currentProject.styleLabel}</p>

                            <div className={`w-full mb-8 transition-all duration-500 ${
                                showLyricsPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
                            }`}>
                                <CustomAudioPlayer
                                    src={currentProject.songs[activeSongIndex].audioUrl}
                                    onPlay={() => handlePlay(activeSongIndex)}
                                />
                            </div>

                            <div className={`grid grid-cols-2 gap-4 w-full max-w-lg transition-all duration-500 ${
                                showLyricsPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'
                            }`}>
                                <button 
                                    onClick={() => handleDownload(currentProject.songs[activeSongIndex].audioUrl, currentProject.title)}
                                    className="col-span-1 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-transform hover:scale-105"
                                >
                                    <Download size={18} /> 下载 MP3
                                </button>
                                
                                {!currentProject.isInstrumental ? (
                                    <button
                                        onClick={() => setShowLyricsPanel(!showLyricsPanel)}
                                        className={`col-span-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                                            showLyricsPanel
                                                ? 'bg-purple-600 text-white border-2 border-purple-600'
                                                : 'bg-white border-2 border-gray-100 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <AlignLeft size={18} />
                                        {showLyricsPanel ? '隐藏歌词' : '查看歌词'}
                                    </button>
                                ) : (
                                    <div className="col-span-1 flex items-center justify-center text-gray-300 font-bold border-2 border-gray-50 rounded-xl bg-gray-50">
                                        纯音乐
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {currentProject.songs.map((song, index) => (
                            <div 
                                key={song.id}
                                onClick={() => setActiveSongIndex(index)}
                                className={`cursor-pointer rounded-2xl p-4 flex items-center gap-4 transition-all border-2 group
                                    ${activeSongIndex === index ? "bg-white border-purple-500 shadow-lg scale-[1.02]" : "bg-white border-transparent hover:border-purple-200 opacity-70 hover:opacity-100"}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${activeSongIndex === index ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"}`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-base truncate ${activeSongIndex === index ? 'text-purple-900' : 'text-gray-600'}`}>Version 0{index+1}</p>
                                    <p className="text-xs text-gray-400">Suno V5 Model</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* === 右侧历史库 === */}
        {historyList.length > 0 && (
            <div className="w-full lg:w-80 flex flex-col gap-5 animate-in fade-in slide-in-from-right-8 duration-700">
                <button
                    onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                    className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center justify-between w-full group hover:text-gray-600 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <History size={16}/>
                        <span>History ({historyList.length})</span>
                    </div>
                    {isHistoryCollapsed ? (
                        <ChevronDown size={16} className="transition-transform duration-200 group-hover:scale-110" />
                    ) : (
                        <ChevronUp size={16} className="transition-transform duration-200 group-hover:scale-110" />
                    )}
                </button>

                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 transition-all duration-300 ${
                    isHistoryCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-screen opacity-100'
                }`}>
                    {historyList.map((project) => (
                        <div 
                            key={project.id}
                            onClick={() => loadProject(project)}
                            className={`group relative bg-white p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1
                                ${currentProject?.id === project.id ? "border-purple-500 ring-4 ring-purple-50" : "border-transparent hover:border-purple-100"}`}
                        >
                            <div className="flex gap-4 items-center">
                                <img src={project.songs[0]?.imageUrl} className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm" />
                                <div className="flex-1 min-w-0">
                                    {/* 历史列表也显示最新的标题 */}
                                    <h4 className="font-bold text-gray-800 truncate mb-1 text-sm">{project.title || project.topic}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">{project.styleLabel}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-300 font-mono mt-2">{formatDate(project.createdAt)}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={(e) => handleDelete(e, project.id)}
                                className="absolute -top-2 -right-2 p-2 bg-white shadow-md text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </main>
  );
}