// app/lib/data.ts

export type StylePreset = {
  id: string;
  label: string; 
  tags: string[]; // 【关键修改】这里变成了字符串数组
};

export const MUSIC_STYLES: StylePreset[] = [
  { 
    id: "pop_happy", 
    label: "流行 - 快乐女声", 
    tags: [
        // 变体 1: 现代合成器流行
        "modern upbeat pop, female vocalist with bright tone, future bass elements, catchy synthesizer hook, driving drum beat, polished production, billboard top 100 style, energetic and optimistic, 120 bpm",
        // 变体 2: 复古迪斯科风
        "nu-disco pop, funky electric guitar rhythm, groovy bassline, female diva vocals, retro 80s vibes, shimmering pads, danceable, saturday night fever atmosphere",
        // 变体 3: 清新吉他流行
        "acoustic pop with electronic texture, sweet female vocals, strummed acoustic guitar, light percussion, sunny atmosphere, heartwarming, youth drama soundtrack style"
    ]
  },
  { 
    id: "pop_sad", 
    label: "流行 - 伤感叙事", 
    tags: [
        // 变体 1: 钢琴叙事
        "emotional piano ballad, soft female vocals, cinematic strings section, slow tempo, deep bass, heartbroken atmosphere, wide stereo reverb, storytelling masterpiece",
        // 变体 2: 极简独立流行
        "indie pop sad, whispery female vocals, minimal electronic beat, ambient pads, lonely night vibe, rain sound texture, lo-fi aesthetic, emotional vulnerability",
        // 变体 3: 大编制交响流行
        "orchestral pop, powerful emotional female vocals, building up tension, dramatic drums, cello solo, epic climax, movie ending credit song, tearjerker"
    ]
  },
  { 
    id: "rock_male", 
    label: "摇滚 - 热血男声", 
    tags: [
        // 变体 1: 体育场摇滚
        "stadium rock, powerful gritty male vocals, distorted les paul guitar riffs, thunderous drums, anthem chorus, high energy, crowd cheering texture, epic guitar solo",
        // 变体 2: 疾速朋克
        "pop punk, fast tempo, youthful male vocals, power chords, driving bass, rebellious energy, skate park vibe, raw production, 160 bpm",
        // 变体 3: 另类摇滚
        "alternative rock, moody male vocals, delay guitar effects, heavy bass groove, atmospheric verses and explosive chorus, linkin park style emotional release"
    ]
  },
  { 
    id: "chinese_folk", 
    label: "国风 - 温暖治愈", 
    tags: [
        // 变体 1: 传统纯粹
        "chinese traditional folk, airy female vocals, guzheng virtuoso, bamboo flute (dizi), light percussion, pentatonic scale, misty mountain atmosphere, tea ceremony vibe",
        // 变体 2: 现代国风融合
        "modern c-pop with chinese instruments, erhu solo, soft piano accompaniment, warm female vocals, sentimental, ancient poetry recital vibe, crystal clear production",
        // 变体 3: 恢弘大气
        "epic chinese folk, cinematic drums, ensemble strings mixed with pipa, majestic female vocals, wide soundstage, historical drama soundtrack, glorious and touching"
    ]
  },
  { 
    id: "cyberpunk", 
    label: "电子 - 赛博朋克", 
    tags: [
        // 变体 1: 黑暗合成器
        "dark synthwave, processed robotic male vocals, arpeggiated analog synths, heavy saw bass, neon noir atmosphere, futuristic city rain, blade runner vibe",
        // 变体 2: 工业电子
        "industrial electronic, aggressive distorted bass, glitch effects, female ethereal vocals contrasting with heavy beats, cyberpunk 2077 combat music, high adrenaline",
        // 变体 3: 迷幻未来
        "futuristic chillwave, autotune vocals, holographic sound textures, deep sub bass, floating atmosphere, night driving in tokyo, neon lights visual"
    ]
  },
  { 
    id: "rnb_soul", 
    label: "R&B - 慵懒灵魂", 
    tags: [
        // 变体 1: 经典 Neo-Soul
        "neo-soul, smooth male vocals, fender rhodes electric piano, jazz guitar chords, laid back groove, coffee shop vibe, warm vinyl crackle texture, romantic and chill",
        // 变体 2: 陷阱 R&B
        "alternative r&b, trap soul beats, deep 808 bass, sensual male vocals, atmospheric pads, late night drive vibe, reverb heavy, modern production",
        // 变体 3: 复古 90年代
        "90s r&b throwback, vocal harmonies, new jack swing drum beat, groovy bassline, soulful ad-libs, romantic date night atmosphere, smooth and silky"
    ]
  }
];

export const MOODS = ["快乐 (Happy)", "悲伤 (Sad)", "激昂 (Energetic)", "浪漫 (Romantic)", "治愈 (Healing)", "神秘 (Mysterious)"];