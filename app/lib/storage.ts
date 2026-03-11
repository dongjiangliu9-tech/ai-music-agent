// app/lib/storage.ts

export type Song = {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  duration: number;
  model: string;
};

export type Project = {
  id: string;
  topic: string;     // 原始主题
  title: string;     // 用户自定义歌名
  styleLabel: string;
  lyrics: string;
  songs: Song[];
  createdAt: number;
  isInstrumental: boolean;
};

const STORAGE_KEY = "ai_music_history_v1";

export const getHistory = (): Project[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProject = (project: Project) => {
  const history = getHistory();
  const newHistory = [project, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  return newHistory;
};

export const deleteProject = (id: string) => {
  const history = getHistory();
  const newHistory = history.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  return newHistory;
};

// 更新项目标题
export const updateProjectTitle = (id: string, newTitle: string) => {
  const history = getHistory();
  const index = history.findIndex(p => p.id === id);
  if (index !== -1) {
    history[index].title = newTitle;
    // 同时更新下面两首歌曲的 title 字段显示，保持一致
    history[index].songs.forEach(song => song.title = newTitle);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
  return history;
};