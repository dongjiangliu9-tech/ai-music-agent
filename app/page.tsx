// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MUSIC_STYLES, MOODS } from "./lib/data";
import { getHistory, saveProject, deleteProject, updateProjectTitle, type Project } from "./lib/storage";
import { 
  Music, Sparkles, Download, Disc, Mic2, 
  ChevronDown, Edit3, Trash2, History, AlignLeft, X, Check, Pencil
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
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) { window.open(url, '_blank'); }
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
                        {/* 歌词浮层 */}
                        {showLyricsPanel && !currentProject.isInstrumental && (
                            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md p-8 overflow-y-auto animate-in fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-400 uppercase tracking-widest">Lyrics</h3>
                                    <button onClick={() => setShowLyricsPanel(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                                </div>
                                <div className="whitespace-pre-line text-gray-700 text-lg leading-relaxed font-medium">
                                    {currentProject.lyrics || "No lyrics available."}
                                </div>
                            </div>
                        )}

                        <div className="relative p-8 md:p-10 flex flex-col items-center text-center">
                            <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-[2rem] overflow-hidden shadow-2xl mb-8 group">
                                <img src={currentProject.songs[activeSongIndex].imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                            </div>

                            {/* --- 标题修改区 --- */}
                            <div className="w-full flex justify-center items-center gap-3 mb-2 relative">
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-2 w-full max-w-md animate-in fade-in">
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={tempTitle}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-2xl font-black text-center outline-none border-2 border-purple-500"
                                        />
                                        <button onClick={handleUpdateTitle} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Check size={20}/></button>
                                        <button onClick={() => setIsEditingTitle(false)} className="p-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300"><X size={20}/></button>
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
                            
                            <p className="text-purple-600 font-bold mb-8 text-sm uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full">{currentProject.styleLabel}</p>

                            <audio 
                                ref={el => { audioRefs.current[activeSongIndex] = el }}
                                controls 
                                src={currentProject.songs[activeSongIndex].audioUrl} 
                                className="w-full mb-8"
                                onPlay={() => handlePlay(activeSongIndex)}
                            />

                            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                <button 
                                    onClick={() => handleDownload(currentProject.songs[activeSongIndex].audioUrl, currentProject.title)}
                                    className="col-span-1 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-transform hover:scale-105"
                                >
                                    <Download size={18} /> 下载 MP3
                                </button>
                                
                                {!currentProject.isInstrumental ? (
                                    <button 
                                        onClick={() => setShowLyricsPanel(true)}
                                        className="col-span-1 bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <AlignLeft size={18} /> 查看歌词
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
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <History size={16}/> History ({historyList.length})
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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