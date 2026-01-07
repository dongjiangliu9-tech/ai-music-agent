// app/lib/data.ts

export type StylePreset = {
  id: string;
  label: string; 
  tags: string[]; // 【关键修改】这里变成了字符串数组
};

export const MUSIC_STYLES: StylePreset[] = [
  {
    id: "pop_happy",
    label: "流行 - 欢快节奏",
    tags: [
        "modern upbeat pop, vocalist with bright tone, future bass elements, catchy synthesizer hook, driving drum beat, polished production, billboard top 100 style, energetic and optimistic, 120 bpm",
        "nu-disco pop, funky electric guitar rhythm, groovy bassline, diva vocals, retro 80s vibes, shimmering pads, danceable, saturday night fever atmosphere",
        "acoustic pop with electronic texture, sweet vocals, strummed acoustic guitar, light percussion, sunny atmosphere, heartwarming, youth drama soundtrack style",
        "Male Vocal, Ringing guitar and piano chords open the intro, warm and hopeful, Verse 1 features airy vocals over smooth rhythms, Verse 2 introduces electric guitar slides, Pre-chorus pulls back to piano and soft hi-hats, Chorus 1 swells with hopeful chords and layered vocals, Chorus 2 adds synth pads for glow, Second pre-chorus builds with toms, Choruses repeat, with a shimmering guitar solo, Outro dissolves into piano and faint vocals, like a sunset fade",
        "Male Vocal, Starts with a crisp guitar arpeggio intro, light shaker, and hopeful chords, Verse 1 layers bright vocals over strummed guitar and soft kick, Verse 2 adds jangling riffs and subtle bass, Pre-chorus introduces piano stabs for tension, Chorus 1 explodes with driving drums, layered vocals, and uplifting chord swells, Chorus 2 doubles the intensity with harmony vocals and cymbal crashes, Second pre-chorus adds a tambourine pulse, Final Chorus 1 and 2 repeat with a soaring lead guitar, Outro fades with reverb-soaked guitar and soft vocal hums, evoking a hopeful sunrise"
    ]
  },
  {
    id: "pop_sad",
    label: "流行 - 情感叙事",
    tags: [
        "emotional piano ballad, soft vocals, cinematic strings section, slow tempo, deep bass, heartbroken atmosphere, wide stereo reverb, storytelling masterpiece",
        "indie pop sad, whispery vocals, minimal electronic beat, ambient pads, lonely night vibe, rain sound texture, lo-fi aesthetic, emotional vulnerability",
        "orchestral pop, powerful emotional vocals, building up tension, dramatic drums, cello solo, epic climax, movie ending credit song, tearjerker",
        "City Pop Ballad, Synth Arpeggios, Warm Bass, Delicate Female Vocals, String Quartet, Bittersweet Melody",
        "C-Pop, Orchestral Strings, Grand Piano, Soft Drums, Emotive Female Vocals, Harp Glissando, Warm Chorus Harmonies",
        "Popular love songs, worthy of being praised love, strong emotional tension, wide range of pitches, moderate to slow tempo, percussion, strings, piano, Duets, the gentle female voice, the passionate male voice, Powerful and forceful high notes, with a rock music flavor",
        "Pop Ballad, Strings, Piano, Emotive Vocals, Crescendo, Lush Reverb, Inner Silence Drops",
        "Slow Pop, Harp Arpeggios, Sobbing Ad-libs, Rich Brass, Betrayal Whispers, Train Whistle, Deep Reverb, Sad Crescendo",
        "Pop Ballad, Piano, Female Vocals, Soft Percussion, Sad Strings, Regretful Lyrics, Silent Cries, Echo Reverb",
        "The instrumental intro opens with emotive piano and soft hi-hats, evoking a J-Pop melancholy, Verse 1 brings female vocals with tearful vibrato over gentle piano chords, Verse 2 adds a string crescendo for emotional depth, The pre-chorus builds with swelling strings and a subtle bass pulse, Chorus 1 delivers a melancholic hook with soaring vocals and lush chords, Chorus 2 intensifies with layered harmonies and dynamic hi-hats, The second pre-chorus adds a faint synth layer for texture, Chorus 1 and 2 repeat with heightened vibrato and string flourishes, The outro fades with piano and a soft string hum, evoking lingering sadness",
        "Lush synths open the intro with reverb drums, Verses carry intimate male vocals over gentle guitar, Pre-chorus builds with poetic lyrics and swelling synths, Choruses soar with dreamy K-ballad melodies, rich vocals, and steady beats, Second chorus adds ethereal vocal layers, Outro drifts to moonlit serenity with soft synths and a fading guitar",
        "Opens with a punchy power pop intro of bright chords and muted drums, Verse 1 shifts to a Taiwanese pop vibe with yearning female vocals and plucky strings, Verse 2 layers in K-ballad piano and soft synth waves, The pre-chorus swells with cinematic strings and a pulsing bassline, Chorus 1 hits with a catchy power pop hook and vibrant synths, Chorus 2 adds vocal harmonies and a crisp snare, The second pre-chorus dials back to acoustic guitar, The final choruses explode with layered drums and soaring melodies, closing with a dreamy synth-laced outro",
        "Instrumental intro opens with delicate piano arpeggios and soft strings, setting a mournful tone, Verse 1 features breathy female vocals over minimalist Taiwanese pop guitar strums, with subtle percussion, Verse 2 adds a gentle kick drum, deepening the rhythm, The pre-chorus introduces a swelling cello, building tension, Chorus 1 erupts with lush strings and heartfelt vocals, a slow Taiwanese K-ballad melody soaring over warm pads, Chorus 2 layers in soft choral harmonies, amplifying emotion, The second pre-chorus pulls back to piano and faint erhu, creating contrast, Chorus 1 and 2 repeat with added reverb on vocals, evoking tears, The outro fades with a single piano note and distant strings, leaving a lingering ache",
        "Taiwanese, K-ballad, Andante, power pop, piano-driven, violin, layered harmonies, vibratos Female voice, soaring falsetto, vocal power rich, sadness emotional resonance, heartfelt delivery, Female Vocal"
    ]
  },
  {
    id: "rock_male",
    label: "摇滚 - 力量激昂",
    tags: [
        "stadium rock, powerful gritty vocals, distorted les paul guitar riffs, thunderous drums, anthem chorus, high energy, crowd cheering texture, epic guitar solo",
        "pop punk, fast tempo, youthful vocals, power chords, driving bass, rebellious energy, skate park vibe, raw production, 160 bpm",
        "alternative rock, moody vocals, delay guitar effects, heavy bass groove, atmospheric verses and explosive chorus, linkin park style emotional release",
        "Power Ballad Rock, Chinese Flute, Heavy Guitars, Emotional Male Vocal, Taiko Drums, String Quartet, Regretful Chorus, Bamboo Xiao",
        "Power Ballad, Soft Rock, Deep Male Vocals, Pulsing Drums, Electric Guitars, Orchestral Strings, Piano Arpeggios, Melancholic Harmony",
        "Pop Rock, Heavy Kick Drums, Clean Guitar Chords, Raspy Male Vocals, String Quartet, Handclaps, Triumphant Chorus",
        "Pop Rock, Stadium Rock, Explosive Double Kicks, Passionate Male Vocals, Synth Leads, Gang Vocals",
        "Pop-Rock, Stadium Chants, Electric Guitar Riffs, Driving Drums, Soaring Vocals, City Skyline Synths, Joyful Gang Vocals",
        "Pop Rock, Uplifting Major Chords, Distorted Rhythm Guitars, Tambourine, Powerful Belted Vocals, Handclap Breaks",
        "Pop-Rock, 80s-Inspired Drums, Sparkling Clean Guitars, Fast Hi-Hats, Catchy \"Oh-oh\" Chorus, Hand Percussion",
        "Tribal Ceremony Rock, Electro Beats, 12/8 Triplets, Imagine Dragons Energy, Distorted Bass, Choral Layers, Urban Ritual",
        "Pop Rock, Grunge, Electric Riffs, Heavy Percussion, Young Male Voice, Defiant Spirit, Fight Evil Story, Raw Energy",
        "Pop Rock, Synthpop, Emotive Female Vocals, Driving Guitar Strums, Pulsing Synths, Layered Harmonies, Anthemic Chorus",
        "Alt Rock, Dubstep, Gritty Female Vocals, Distorted Guitar Riffs, Wobbly Synths, Apocalyptic Drums, Reverb Pads, Epic Build",
        "Pop Rock track powering forward with crisp march-style drums and a driving bassline, Verses feature dynamic electric guitar riffs and passionate Female vocals, escalating through power chords, Anthemic chorus expands with stadium echo and crowd chant samples, The bridge builds epically, layering guitar harmonies and textures for a larger-than-life finale",
        "Pop Punk, Power Pop, Male Vocals, Catchy Guitar Hooks, Snappy Percussion, Wild Heart Lyrics, Upbeat Rebellion, Fun, The intro bursts with catchy guitar hooks and snappy drum grooves, radiating fun, Verse 1 pairs vibrant male vocals with jangly guitar chords and crisp snares, Verse 2 adds a bouncy bassline and syncopated cymbals, keeping the energy high, The pre-chorus shifts to clean guitar strums and a pulsing kick, creating a lift, Chorus 1 blends hooky guitars, snappy drums, and wild-hearted vocals in an upbeat anthem, Chorus 2 piles on vocal harmonies and tambourine shakes for extra spark, The second pre-chorus softens with light guitar arpeggios and subtle toms, The outro fades with a catchy guitar riff and lively drum fills, pure rebellion",
        "Male Vocal, Opens with a minimalist piano rock intro, eerie and sparse, Verse 1 brings alt rock's jagged riffs and introspective vocals, backed by light grunge bass, Verse 2 ups the grit with distorted textures, The pre-chorus slows, featuring haunting vocals over soft piano, Chorus 1 erupts with grunge-fueled guitars and an explosive hook, Chorus 2 adds layered vocals for depth, The second pre-chorus teases with feedback, leading to a chaotic outro of jagged riffs and fading piano",
        "Taiwanese, Rock, Andante, power pop, soaring falsetto, vocal power rich, sadness emotional resonance, heartfelt delivery, Female Vocal",
        "Soft Rock, Lullaby, Warm Bass, Muted Drums, Soothing Croons, Gentle Riffs, BPM 90, Female Vocal",
        "Pop Rock, Glam Rock, Cocky Male Vocals, Tribal Percussion, Electric Leads, Strutting Rhythms, Epic Attitude, Kicks off with a Glam Rock intro of sparkling electric leads and driving tribal percussion, radiating confidence, Verse 1 pairs cocky male vocals with strutting basslines and sharp snare hits, keeping the energy bold, Verse 2 introduces syncopated congas and a flashy guitar lick for extra flair, The pre-chorus lifts with bright piano chords and a tambourine shake, teasing grandeur, Chorus 1 blends Pop Rock hooks with layered percussion and swaggering vocals, commanding attention, Chorus 2 adds vocal ad-libs and a crunchy rhythm guitar for a larger-than-life feel, The second pre-chorus dials back to a clean guitar and soft hi-hats, exuding cool arrogance, The outro builds into a bombastic finale with electric leads and a tribal drum crescendo, strutting to the end",
        "Intro: Distorted guitar chords and moody cymbals create a hazy summer vibe, Verse 1: Gritty male vocals and raw chords explore love in a summer dusk, Verse 2: Adds heavy bass and emotive lyrics about future fears, Pre-chorus: Stripped-down, reverb-heavy guitar builds tension, Chorus 1: Anthemic distorted riffs and passionate vocals erupt with raw energy, Chorus 2: Layers in backing vocals and driving drums for a grungy peak, Pre-chorus: Returns with a somber, bluesy guitar line, Chorus 1+2: Repeats with intensified vocals and heavier distortion, Outro: Fades with a slow, melancholic guitar solo, evoking uncertainty",
        "The instrumental intro kicks off with fast guitar chords and punchy snare rolls, radiating rebellious energy, Verse 1 brings gritty female vocals over choppy riffs and driving bass, dreaming of uprising, Verse 2 incorporates bright synth hooks and tighter hi-hats, questioning authority with edge, The pre-chorus ramps up with distorted guitar stabs and pulsing synths, Chorus 1 delivers raw vocals and crashing cymbals, a bold, brave anthem, Chorus 2 adds layered vocal harmonies and synth flourishes for intensity, The second pre-chorus accelerates with frenetic snares, cycling through Chorus 1 and 2, The outro strips to raw guitar feedback and a defiant vocal shout, fading rebelliously",
        "Instrumental intro grinds with raw guitars and lo-fi tape hiss, evoking a gritty past, Verse 1 introduces heartfelt male vocals over garage rock energy, full of regret, Verse 2 adds a shaky tambourine, boosting the raw vibe, The pre-chorus builds with distorted chords, hinting at release, Chorus 1 roars with crooning vocals and driving riffs, chasing bygone days, Chorus 2 deepens with fuzzy bass, intensifying the nostalgia, The second pre-chorus strips to hissy strums, leading to Chorus 1 and 2's return, The outro fades with crackling guitars, like an old record",
        "Opens with a grunge rock intro of heavy distortion and salsa-inspired congas, Verse 1 pairs raw female vocals with a swinging salsa rhythm and fuzzy basslines, Verse 2 introduces syncopated timbales and a gritty guitar lick, The pre-chorus lifts with high notes and smooth piano chords for a seamless blend, Chorus 1 combines grunge guitar solos with passionate salsa beats and soaring vocals, Chorus 2 adds layered percussion and vocal ad-libs, The second pre-chorus softens with acoustic strums and subtle maracas, The outro fades with a fiery guitar solo and summer-energy dance rhythms"
    ]
  },
  {
    id: "chinese_folk",
    label: "国风 - 民族融合",
    tags: [
        "chinese traditional folk, airy vocals, guzheng virtuoso, bamboo flute (dizi), light percussion, pentatonic scale, misty mountain atmosphere, tea ceremony vibe",
        "modern c-pop with chinese instruments, erhu solo, soft piano accompaniment, warm vocals, sentimental, ancient poetry recital vibe, crystal clear production",
        "epic chinese folk, cinematic drums, ensemble strings mixed with pipa, majestic vocals, wide soundstage, historical drama soundtrack, glorious and touching",
        "Mandopop, Traditional Guzheng, Sad Longing Vibes, Female Harmony, Bamboo Flute, Rhythmic Drums, Rich Strings, Bittersweet Echoes",
        "C-Pop Heartache, Folk Melodies, Lost Love Angle, Female Emotion, Hulusi Tones, Strong Tempo, Abundant Orchestration, Wistful Flow",
        "Chinese Traditional, Pop Structure, Dizi Flute, Yangqin, Soaring Female Vocal, Intense Drums, Booming Bass Drum, Sidechain, Yearning Vibes",
        "Strings, March, Chinese military, orchestra, passionate, Female Vocal",
        "Jiangnan Folk, Guzheng, Erhu, Female Vocal, Rain SFX, Bamboo Flute, Soft Percussion, Lush Strings",
        "Pop Folk, Chinese Opera, Male Vocals, Pipa Plucks, Slow Tempo, Epic Chorus, Dizi Flute, Resilient Spirit",
        "March, Chinese military, orchestra, passionate, male Vocal",
        "This Pop Folk fusion features a lively acoustic guitar backbone with major chord progressions, joined by rhythmic bright percussion and bass, Verses layer in expressive erhu lines, while the chorus swells with melodic male vocals and soaring dizi flute, evoking a hopeful, uplifting mood",
        "Pop Ballad, Guzheng Ripples, Female Vocals, Erhu, Lonely Tears, Night Stillness, Soft Drums, Anticipatory Chords, Starts with guzheng's shimmering ripples and erhu's soulful wails, painting a still night, Verse 1 features heartfelt female vocals over guzheng chords and soft drums, evoking lonely tears, Verse 2 introduces erhu slides and a pulsing percussion beat, deepening the mood, The pre-chorus rises with anticipatory guzheng arpeggios and cymbal swells, Chorus 1 combines soaring vocals with vibrant guzheng and dynamic drums, expressing sorrow, Chorus 2 layers vocal harmonies and intricate percussion, The second pre-chorus softens with sparse erhu and guzheng, fostering tension, The outro fades with a delicate erhu melody and guzheng echoes",
        "Instrumental Intro: Sheng hums softly, Chinese fiddle sighs like a desert breeze, Verse 1: Male vocals, deep and reflective, flow over nomad-step percussion, fiddle bowing gently, Verse 2: Sheng adds reedy depth, vocals turn yearning, percussion quickens, Pre-chorus: Fiddle rises, silk strings pluck, lyrics hint at distant lands, Chorus 1: Vocals bloom, sheng swells, fiddle weaves a haunting melody, Chorus 2: Percussion surges, vocals harmonize, reflective tones deepen, Pre-chorus: Fiddle cries, strings intensify, Chorus 1+2 repeat with fuller sheng, Outro: Sheng softens, fiddle lingers, footsteps fade into silence",
        "A delicate ancient lute and xiao flute intro paints a glowing hometown sunrise, Verse 1 features male vocals over pop folk chords, evoking nostalgia, Verse 2 layers soft guzheng plucks for warmth, The pre-chorus introduces free melodies with a lilting xiao line, Chorus 1 swells with uplifting vocals and acoustic strums, capturing rural joy, Chorus 2 adds guzheng arpeggios for depth, The second pre-chorus intensifies with a subtle bassline, Choruses repeat with richer vocal textures, and the outro drifts with xiao and lute, embodying boundless freedom",
        "Male Vocal, Instrumental Intro: Gentle guqin strums weave with soft bamboo flute, setting a serene, ancient mood, Verse 1: Acoustic guitar joins, male vocals delivering tender love lyrics over light percussion, Verse 2: Adds subtle erhu, vocals deepen with emotional storytelling, Pre-chorus: Strings swell, building tension with a heroic undertone, Chorus 1: Bold male vocals soar, guqin and flute harmonize, drums drive a brave anthem, Chorus 2: Adds layered harmonies, intensifying the love ballad's climax, Pre-chorus: Strings return, softer, reflective, Chorus 1+2: Reprise with richer instrumentation, cymbals accentuating peaks, Outro: Guqin fades with flute, evoking a timeless, wistful close",
        "Instrumental Intro opens with haunting erhu wails and gentle chimes, setting a neo-classical tone, Verse 1 features female vocals with Peking Opera flair, singing tragic lyrics over sparse piano, Verse 2 adds soft orchestral swells for depth, Pre-chorus builds with erhu and strings, intensifying betrayal motifs, Chorus 1 explodes with soaring female vocals and lush orchestration, Chorus 2 layers richer strings, Outro fades with erhu and chimes, evoking lingering sorrow",
        "Begins with cinematic erhu whispers and soft gongs, Verse 1 features yearning female vocals over Chinese folk melodies, Verse 2 adds night shadows with deeper strings, Pre-chorus builds with anticipatory gongs, Chorus 1 erupts with soaring vocals and orchestral swells, Chorus 2 adds layered erhu for emotion, The second pre-chorus heightens with sharper gongs, Chorus 1 and 2 repeat with grander dynamics, ending with an outro of sparse erhu and fading night tones",
        "Opens with pipa ripples and soft dizi laments, Verse 1 features male vocals over classical motifs, Verse 2 adds subtle drums, The pre-chorus introduces orchestral strings, building tension, Chorus 1 blends heartfelt vocals with pipa flourishes, Chorus 2 swells with cinematic depth, The second pre-chorus strips to a lone dizi, The outro fades with pipa and soft imperial echoes, mourning a lost love",
        "Italian ballad, classic, Bel canto, orchestra, female choir, two acoustic guitars, mandolins, instrumental intro, instrumental end",
        "Instrumental Intro starts with guqin's resonant strings and xiao's soulful call, blended with faint nature sounds, Verse 1 pairs intimate male vocals with sparse guqin plucks, Verse 2 adds gentle hand drums, grounding the flow, Pre-chorus builds with xiao's rising melody and soft chimes, Chorus 1 unfolds with emotive vocals and warm string swells, guqin anchoring, Chorus 2 introduces subtle vocal harmonies, amplifying emotion, The second Pre-chorus pulls back, with xiao and nature sounds, Chorus 1 and 2 repeat, richer in texture, The Outro weaves guqin and xiao, dissolving into wind-like ambiance",
        "The instrumental intro opens with delicate erhu melodies over soft piano chords, setting a reflective Taiwan Folk tone, Verse 1 introduces female vocals with sparse acoustic strums and gentle strings, evoking intimacy, Verse 2 adds subtle bamboo percussion for rhythmic lift, The pre-chorus builds with lush harmonies and swelling strings, creating anticipation, Chorus 1 bursts with a Pop Ballad flair, featuring emotive vocals and a full string section, underpinned by a steady kick, Chorus 2 intensifies with layered vocals and a soaring erhu counter-melody, The second pre-chorus introduces a guzheng pluck for contrast, The final Chorus 1 and 2 cycle with added synth pads for modernity, while the outro fades with erhu and piano, echoing the intro but with a resolved emotional crescendo",
        "The intro opens with shimmering Guzheng plucks over ambient drones and ethereal pads, evoking a starlit journey, Verse 1 carries introspective male vocals with minimal acoustic strums, Guzheng adding dreamy accents, Verse 2 introduces soft reverb-soaked guitar, enhancing the reflective mood, The pre-chorus builds with swelling pads and a subtle bass hum, creating tension, Chorus 1 erupts gently with layered male vocals, Guzheng arpeggios, and warm synth textures, feeling expansive yet intimate, Chorus 2 deepens with a low drone, grounding the emotion, The second pre-chorus strips back to vocals and pads, leading to the choruses, The outro fades with Guzheng plucks and a soft vocal hum, dissolving into ambient silence",
        "Female Vocal, Starts with a delicate bamboo flute and acoustic guitar intro, setting a serene Taiwanese folk tone, Verse 1 layers emotive vocals over gentle strums and soft percussion, evoking intimacy, Verse 2 adds lush strings for depth, The pre-chorus introduces a subtle piano swell, building anticipation, Chorus 1 bursts with heartfelt lyrics and soaring strings, pop ballad energy shining, Chorus 2 doubles the vocal intensity with layered harmonies, The second pre-chorus deepens with a bamboo flute counter-melody, The final choruses blend lush strings and soft percussion for a climactic feel, The outro fades with a solo flute and acoustic arpeggios, reflective and folk-rooted",
        "Nostalgic Female Vocal, Opens with a warm acoustic guitar intro, xiao flute weaving a retro melody, Verses 1 and 2 layer traditional drums with mellow vocals, painting nostalgic scenes, Pre-chorus introduces retro synth pads, lifting the mood, Chorus 1 and 2 explode with pop ballad chords, warm vocals, and a driving snare, Second pre-chorus adds a dizi trill for flair, Outro slows to xiao and vinyl static, evoking old radio memories",
        "Male Vocal, Instrumental Intro opens with mournful erhu and soft piano arpeggios, evoking quiet grief, Verse 1 layers delicate acoustic guitar strums and tearful vocals, keeping a sparse folk feel, Verse 2 adds gentle strings for warmth, Pre-chorus introduces a subtle kick drum and synth pad swell, building tension, Chorus 1 blooms with lush strings and emotive vocals, piano chords driving the melody, Chorus 2 deepens with a low bass pulse, intensifying the sorrow, Pre-chorus repeats with added cymbal swells, Chorus 1 and 2 return, now with a soaring erhu lead, Outro fades with solo piano and distant erhu, leaving a bittersweet resolve"
    ]
  },
  {
    id: "cyberpunk",
    label: "电子 - 赛博朋克",
    tags: [
        "dark synthwave, processed robotic male vocals, arpeggiated analog synths, heavy saw bass, neon noir atmosphere, futuristic city rain, blade runner vibe",
        "industrial electronic, aggressive distorted bass, glitch effects, female ethereal vocals contrasting with heavy beats, cyberpunk 2077 combat music, high adrenaline",
        "futuristic chillwave, autotune vocals, holographic sound textures, deep sub bass, floating atmosphere, night driving in tokyo, neon lights visual"
    ]
  },
  {
    id: "rnb_soul",
    label: "R&B - 慵懒灵魂",
    tags: [
        "neo-soul, smooth vocals, fender rhodes electric piano, jazz guitar chords, laid back groove, coffee shop vibe, warm vinyl crackle texture, romantic and chill",
        "alternative r&b, trap soul beats, deep 808 bass, sensual vocals, atmospheric pads, late night drive vibe, reverb heavy, modern production",
        "90s r&b throwback, vocal harmonies, new jack swing drum beat, groovy bassline, soulful ad-libs, romantic date night atmosphere, smooth and silky",
        "Bedroom R&B, 808 Slides, Whispered Rap-Sing, Stacked Harmonies, Vinyl Crackle, Jealous Melisma, Slow Hi-Hats, Intimate",
        "R&B, Doo-Wop, Velvet Male Vocals, Piano Chords, Trombone Swells, String Layers, Mid-Tempo Groove, Auto-Tune Whisper",
        "Pop-Soul, Hip-Hop, Warm Tenor, Acoustic Guitar, Light Trap Drums, Synth Pads, Reflective Mood",
        "Pop, Soul, Velvety Female Vocals, Acoustic Guitar, R&B Groove, Warm Strings, Emotional Build, Retro Vibe",
        "Pop, R&B, Male Vocal, Trap Bass, Airy Pads, Vocal Layering, Eb Chord Loop, Dreamy Vibe",
        "Opens with emotive soul-pop vocals layered over cinematic strings and subtle modern synths, Blues guitar phrases enter, adding warmth, while dynamic drums lift the groove, The chorus features a soaring gospel choir, rich harmonies, and sweeping strings, Bridge brings a climactic swell",
        "Trap-Soul, Pop Ballad, Male Vocals, Grand Piano, Vinyl Crackle, Soft Drums, Emotional Flow, Gospel Choir",
        "Pop-Soul, Disco, Female Lead, Slap Bass, Trumpet Hits, Electro Beats, Funky Strum, Glossy Mix",
        "Instrumental Intro starts with delicate piano arpeggios and soft string swells, setting a mournful tone, Verse 1 introduces male vocals with sparse piano and subtle 808s, evoking regret, Verse 2 adds a light R&B groove with syncopated hi-hats and deeper strings for emotional weight, The Pre-chorus builds with layered strings and a pulsing bassline, hinting at resolve, Chorus 1 blooms with full string quartet and soaring male vocals, regretful lyrics piercing through, Chorus 2 intensifies with a gospel-tinged backing choir and stronger 808s, The second Pre-chorus tightens with staccato strings, leading to a stripped-down Chorus 1 reprise, Chorus 2 surges again, adding a shimmering glockenspiel, The Outro fades with piano and a lone cello, echoing heartbreak",
        "Instrumental Intro: Slide guitar wails over warm organ chords, soulful and heavy, Verse 1: Southern rock groove with steady kick drum and soulful male vocals, aching, Verse 2: Adds bluesy guitar fills and subtle piano for deeper sorrow, Pre-chorus: Organ swells and slow hi-hats create a mournful lift, Chorus 1: Heartfelt with soaring male vocals, thick guitar riffs, and pulsing bass, Chorus 2: Layers in gospel-tinged backing vocals and slide guitar solo, Pre-chorus: Stripped to piano and raw vocals, vulnerable, Chorus 1 & 2 repeat with bigger drums, Outro: Slide guitar and organ fade, lingering in heartbreak",
        "Mournful trumpet and muted piano chords open the intro, setting a somber dirge, Verse 1 blends jazz noir's smoky double bass and slow dirge pulse, male vocals dripping with sorrow, Verse 2 adds brushed snares, vocals gaining an angry edge, Pre-chorus introduces quivering strings for tension, Chorus 1 erupts with bold trumpet stabs and anguished vocals over dark piano swells, Chorus 2 intensifies with distorted guitar undertones for raw emotion, The second pre-chorus deepens with cello, Repeated choruses heighten vocal grit and brass flourishes, The outro fades with a solo trumpet wail and soft piano decay, evoking loss"
    ]
  },
  {
    id: "jazz_smooth",
    label: "爵士 - 优雅醇厚",
    tags: [
        "smooth jazz, saxophone lead melody, walking bassline, light brush drums, electric piano comping, sophisticated vocals, martini lounge atmosphere, midnight city lights",
        "contemporary jazz fusion, jazz quartet with electronic elements, guitar solo, upright bass groove, scat vocals, complex time signatures, artistic and innovative",
        "classic jazz standards, big band swing, brass section, piano trio, elegant vocals, smoky club vibe, vintage microphone warmth, timeless sophistication",
        "Starts with a mellow upright bass and brushed drum intro, crafting a smoky, nostalgic atmosphere, Verse 1 pairs breathy female vocals with delicate piano chords and soft cymbal taps, conjuring old jazz clubs, Verse 2 introduces a warm trumpet line and gentle ride cymbal, adding depth, The pre-chorus builds with sustained piano chords and a subtle snare roll, heightening emotion, Chorus 1 combines soulful vocals with rich jazz chords and light hi-hats, creating an emotional swell, Chorus 2 adds layered vocal improvisations and a soft clarinet, enhancing the nostalgic pull, The second pre-chorus softens with minimal bass and brushed snare, reflecting longing, The outro fades with a wistful piano melody and faint cymbal swells, leaving a tender, regretful close"
    ]
  },
  {
    id: "hiphop_urban",
    label: "嘻哈 - 街头硬核",
    tags: [
        "hardcore hip hop, aggressive rap vocals, heavy 808 bass, hi-hat rolls, gritty atmosphere, street credibility, boom bap production, raw energy",
        "trap hip hop, dark atmospheric pads, rolling hi-hats, deep sub bass, rapper with flow, luxury rap elements, club-ready beats, modern urban sound",
        "conscious hip hop, jazz samples, soulful backing vocals, poetic rap, conscious lyrics, golden era vibe, socially aware, intellectually stimulating",
        "Trap, Electropop, Hip-Hop, Female Arena Vocals, Grimy Bass, Crescendo Chorus, Devil Voice Drop",
        "Hip-Hop Crossover, Male Narrative Verse, R&B Stacked Vocals, Low-End Thump, Bright Reverb Tail, Anger Release Gaps",
        "N, O, Bounce, Hip-Hop, Female Rap, Triggerman Beat, 808 Bass, Chopped Vocals, Conspiracy Samples, Dance Break",
        "Instrumental Intro sets a moody tone with haunting synths and a deep 808 pulse, Verse 1 delivers trap rap with introspective bars over sparse hi-hats and a ticking snare, Verse 2 adds a shimmering synth layer, vocals growing more anguished, Pre-chorus introduces a pop-inspired melody with soft vocal harmonies, building anticipation, Chorus 1 bursts with an emotional hook, melodic rap over lush chords and heavy 808s, Chorus 2 intensifies with layered ad-libs and a subtle string swell, The second Pre-chorus adds a filtered synth for tension, Repeating Chorus 1 and 2 escalate with cinematic drum rolls, The Outro fades with a lone synth and echoing vocal fragments, evoking a lingering heartache",
        "Pop Rap, Cinematic, Male Vocals, Orchestral Hits, Slow Percussion, Grief-Stricken Tone, Epic Builds, Instrumental Intro opens with sweeping strings and slow, resonant percussion hits, creating a grand, mournful atmosphere, Verse 1 brings male vocals over soft timpani rolls and pizzicato strings, narrating youth's sorrow, Verse 2 layers in a subtle brass swell and deeper kick for intensity, Pre-chorus shifts to a tense violin tremolo and muted snares, Chorus 1 erupts with powerful male vocals, orchestral hits, and booming percussion, conveying grief, Chorus 2 adds a choral backing and crashing cymbals for scale, The second Pre-chorus reduces to solo cello, Final Choruses amplify with full orchestra, Outro trails off with fading strings and a lone timpani, evoking loss",
        "Pop Rap, Reggae, Male Vocals, Steel Drums, Breezy Vibes, Percussive Groove, Freedom Lyrics, Starts with an instrumental intro of steel drums and skanking guitar chords, setting a breezy island vibe, Verse 1 introduces a Pop Rap flow with syncopated hi-hats and a deep kick, layered over reggae riddims, Verse 2 adds subtle bass wobbles for depth, The pre-chorus shifts to a smoother reggae groove with light percussion and airy pads, Chorus 1 explodes with male vocals delivering uplifting freedom lyrics, backed by steel drums and a punchy snare, Chorus 2 doubles the energy with layered vocal harmonies and a rolling conga, The second pre-chorus introduces a dub echo effect, leading back to Chorus 1 and Chorus 2, The outro fades with a percussive groove and steel drum flourishes, evoking a carefree sunset drive"
    ]
  },
  {
    id: "classical_orchestral",
    label: "古典 - 交响华丽",
    tags: [
        "symphonic orchestra, full string section, brass fanfares, timpani rolls, operatic vocals, grand and majestic, concert hall acoustics, dramatic crescendos",
        "chamber orchestra, intimate string quartet, piano concerto elements, delicate vocals, refined and elegant, salon atmosphere, intellectual depth",
        "romantic classical, sweeping violin melodies, harp glissandos, passionate vocals, emotional intensity, 19th century salon music, lyrical and expressive",
        "Pop Ballad, Classical, Begins with a grand piano and cello duet, weaving a mournful classical motif, Verse 1 features tender female vocals over soft piano and a pizzicato cello line, Verse 2 adds a gentle snare brush and viola countermelody for warmth, The pre-chorus builds with a string quartet crescendo and delicate chimes, Chorus 1 combines lush piano, light cymbal swells, and powerful female vocals expressing love's grace, Chorus 2 layers in harp glissandos and richer strings for grandeur, The second pre-chorus dials back to a solo cello and whispered vocals, The outro resolves with a soft piano chord and fading strings, conveying serene sorrow",
        "Instrumental Intro: Grand strings sweep with delicate piano accents, crafting a cinematic mood, Verse 1: Emotive female vocals glide over soulful bass and gentle hi-hats, Verse 2: Piano flourishes add depth, with strings subtly swelling, Pre-chorus: Orchestral build with rising strings and soft cymbals, Chorus 1: Heartbreak lyrics explode with lush strings and a steady kick, Chorus 2: Adds soulful vocal harmonies for intensity, Pre-chorus: Strings soften, piano takes lead, Chorus 1 & 2 repeat with soaring ad-libs, Outro: Strings fade with a lone piano, leaving a haunting echo",
        "Starts with a delicate grand piano intro, layered with soft strings, Verse 1 unfolds with soulful female vocals over a sparse piano, building emotional weight, Verse 2 adds subtle bass and muted percussion for depth, The pre-chorus introduces a swelling string section, creating tension, Chorus 1 explodes with cinematic strings and a powerful vocal delivery, supported by a slow, resonant drum pulse, Chorus 2 intensifies with layered harmonies and a richer orchestral texture, The second pre-chorus softens, with a single violin carrying the melody, The outro fades with tearful lyrics over a lone piano, echoing the intro's intimacy"
    ]
  },
  {
    id: "electronic_dance",
    label: "电子舞曲 - 狂野派对",
    tags: [
        "progressive house, building energy, diva vocals, rolling bassline, euphoric drops, festival atmosphere, laser light effects, crowd chanting texture",
        "techno rave, pounding kick drums, synthesized leads, robotic vocals, industrial atmosphere, strobe lights, underground club energy, hypnotic repetition",
        "electro pop dance, infectious synthesizer hooks, catchy vocals, four-on-the-floor beat, neon glow effects, disco ball atmosphere, party starter vibe",
        "Mid-Tempo EDM, Piano Ballad, Future Bass Wubs, Filtered House Loop, Chris Martin Chords, Pop Structure, Female Lead",
        "Mid-tempo Electropop, Power Ballad, Ethereal Female Vocals, Layered Synths, Crushing Kick, Euphoric Chorus Wall, 80s, Cinematic Build, High-Gloss Production, Intimate Verse Pads",
        "Power Ballad EDM, Mid-tempo Groove, Little-Girl-Lost Vocals, Stacked Synth Chords, Heartbeat 808, Spindly Warble Highs, Verse Whisper Pads, Epic Chorus Lift, Glossy Hooks",
        "Tropical House, Pop, EDM, Sun-Warped Synths, Trap Hi-Hats, Mellow Bass, Mentholated Male Vocals, Piano Chords",
        "Moombahton, Dancehall, Bollywood Strings, Ethereal Female Vox, 808 Slides, Delayed Kick, Gmin Chords, Global House Ballad, Sensory Haze",
        "Dance-Pop, EDM, Bold Male Vocals, Pulsing Synths, 4/4 Kick, Anthemic Chorus, Euphoric Drops, Cinematic Strings",
        "Folktronica, Chill House, Female Breathy Vocals, Acoustic Chords, Subtle Drop, Forest Ambiance, Emotional Hook",
        "Electro-Pop, New Wave, Breathy Vocals, Arpeggiated Synths, Funky Bass, Retro Chords, Glittery FX, Anthemic Hook",
        "House Groove, Trap, Female Vocals, Angry Synths, Bass Blobs, Rapid Fire Flow, Day-Glo Filter, Build-Up",
        "Begins with grand cello swells and crisp electronic beats, painting a fresh valley, Verse 1 features warm female vocals over piano chords and subtle conga rhythms, craving liberation, Verse 2 introduces pizzicato strings and syncopated hi-hats, building urgency, The pre-chorus shifts to lush orchestral strings and soft kicks, evoking hope, Chorus 1 pairs soaring vocals with pop hooks and vibrant strings, celebrating love's renewal, Chorus 2 adds layered synths and vocal runs for intensity, The second pre-chorus dials back to solo piano and faint percussion, introspective, The outro fades with cinematic strings and steady beats, like dawn on a hill",
        "Synthpop, Bossa Nova, Sultry Vocals, Marimba, Travel Dreams, Wave Synths, Freedom Beats, 100 BPM, Instrumental Intro: Marimba twinkles, wave synths ebb, bossa nova guitar strums softly, Verse 1: Female vocals, smooth and sultry, flow over light marimba, synths shimmer faintly, Verse 2: Guitar adds bossa syncopation, vocals deepen, marimba ripples with urgency, Pre-chorus: Synths pulse, marimba quickens, lyrics whisper of far-off skies, Chorus 1: Vocals glide upward, synth chords swell, marimba dances with crisp hi-hats, Chorus 2: Harmony vocals enrich, synths add arpeggios, kick drum anchors the beat, Pre-chorus: Marimba climbs, synths intensify, lyrics burn with wanderlust, Chorus 1+2: Vocals soar with ad-libs, synths radiate, marimba weaves intricate lines, Outro: Marimba softens, synths fade like waves, guitar strums into quiet",
        "Instrumental Intro opens with ethereal harp plucks and soft kick, rain SFX shimmering, Verse 1's breathy female vocals weave through indie-style guitar chords and rim clicks, regret palpable, Verse 2 adds electric guitar textures and subtle toms, vocals more desperate, Pre-chorus builds with string quartet swells, Chorus 1 bursts with pop snare, harp accents, and emotive vocals, heartbreak cresting, Chorus 2 introduces vocal layering and a driving beat, Second Pre-chorus softens to harp and strings, Final Choruses amplify with lush strings, Outro dissolves into harp and rain, a melancholic sigh",
        "The song opens with a dreamy Instrumental Intro, layering retro synths and soda fizz FX for a nostalgic summer glow, Verse 1 introduces a Vaporwave beat with slowed-down drums and lush female vocals hitting high notes, evoking love's premonition, Verse 2 adds subtle synthpop arpeggios, deepening the rhythm, The Pre-chorus shifts to a brighter synthpop pulse with shimmering chords, building anticipation, Chorus 1 erupts with vibrant female vocals soaring over smooth synth transitions, soda fizz pops accentuating the beat, Chorus 2 intensifies with layered harmonies and a pulsing bassline, amplifying the love glow, The second Pre-chorus introduces a filtered vocal echo, maintaining momentum, The final Chorus 1 and Chorus 2 blend high-note vocal runs with sparkling synths, creating a euphoric peak, The Outro fades with reverb-heavy pads and fizzing FX, like a summer sunset",
        "Industrial synths grind over a pulsing bass intro, Verse 1 layers male chants with wailing saxophone, Verse 2 introduces bleak harmonies, Metallic clanks drive the pre-chorus, Chorus 1 merges emotive vocals and sax, while Chorus 2 adds heavier synth textures, Outro fades on pulsing low end"
    ]
  },
  {
    id: "country_folk",
    label: "乡村 - 质朴真挚",
    tags: [
        "classic country, twangy acoustic guitar, pedal steel solos, heartfelt vocals, honky tonk piano, whiskey bar atmosphere, storytelling lyrics, authentic roots",
        "modern country pop, electric guitar riffs, country vocals, driving drum beat, stadium energy, crossover appeal, feel-good anthems, contemporary twang",
        "folk country, fingerpicked acoustic guitar, gentle vocals, simple percussion, campfire atmosphere, introspective lyrics, organic and natural, singer-songwriter style",
        "Alt Folk, Stomping Percussion, Layered Guitars, Deep Male Vocals, Violin Countermelodies, Piano Accents, Bittersweet Chorus Lifts",
        "Folk, Hardanger Fiddle, Male Haunting Vocals, Nyckelharpa, Acoustic Guitar, Cold Atmosphere",
        "Acoustic Folk Pop, Lo-Fi Beats, Emotional Male Vocals, Sub Bass, Fingerstyle Guitar, Distant Seagulls, Melancholy Keys",
        "Country music, soothing, popular bel canto singing style, soprano voice, attachment to hometown, gentle",
        "Bala's love song, from the 80s, a sad folk narrative, a longing for the hometown, slow tempo, melancholic, tragic",
        "Country Trap, Blues, Male Deep Vocals, Slide Guitar, 808 Bass, Snare Rolls, I-IV-V, Dusty Trails",
        "Trap, Country, 808 Bass, Banjo Riffs, Male Gritty Vocals, I-IV-V Chords, Snare Rolls, Western Twang",
        "Pop-Folk, Alt-Country, Female Vocals, Twangy Banjo, Campus Memories, Regretful Tone, Light Strings, Heartfelt Bridge",
        "Instrumental Intro kicks with gritty acoustic guitar strums and a mournful harmonica wail, setting a dusty rural tone, Verse 1 weaves fingerpicked guitar with subtle bass, male vocals delivering introspective tales of wandering, Verse 2 adds a soft kick drum, deepening the groove, Pre-chorus introduces a slide guitar swell, building tension, Chorus 1 erupts with soulful vocal harmonies and a steady snare, evoking porchside warmth, Chorus 2 layers in electric guitar riffs for a bolder edge, The second Pre-chorus tightens with muted strums, leading back to Chorus 1's familiarity, then Chorus 2 intensifies with harmonica flourishes, The Outro fades with a lone guitar and distant harmonica, like a traveler's echo",
        "Intro sets a lonesome mood with twangy steel guitar and soft hi-hat ticks, Verse 1 features gritty male vocals over a sparse acoustic strum and faint kick drum, raw and confessional, Verse 2 adds a warm bassline and subtle banjo plucks for depth, Pre-chorus shifts to a pop-leaning piano chord progression, building anticipation with a snare roll, Chorus 1 bursts with a full drum kit, emotive vocals, and a soaring melody over lush chords, Chorus 2 strips back to vocal and steel guitar, emphasizing heartbreak's sting, The second Pre-chorus introduces a fiddle accent for a country edge, Final Choruses blend pop production with a driving beat and layered harmonies for a cathartic peak, Outro fades with a solo acoustic riff and distant pedal steel, echoing solitude",
        "The intro weaves fingerpicked acoustic guitar and soft harmonica wails, nostalgic chords setting a melancholy tone, Verse 1 brings weary male vocals over a tragic folk strum, sparse drums tapping slowly, Verse 2 adds a bluesy slide guitar, harmonica sharper, The pre-chorus strips to a single guitar pluck and vocal murmur, Chorus 1 swells with soulful harmonies, acoustic strumming brighter, and a steady snare, Chorus 2 layers in a wailing harmonica solo, vocals more intense, The second pre-chorus returns to minimal guitar and drums, Chorus 1 and 2 repeat with richer harmonies and dynamic fills, The outro fades with a lone guitar and harmonica, evoking loss",
        "Kicks off with a tambourine-driven intro and strummed chords, Verse 1 has cheery male vocals over a bouncy rhythm, Verse 2 sprinkles in glockenspiel for sparkle, Pre-chorus dials back to soft vocals and acoustic picking, Chorus 1 explodes with group harmonies and driving drums, Chorus 2 adds synth accents for pop flair, Outro winds down with breezy humming and tambourine",
        "Banjo leads the intro with faint keys beneath, Verse 1 features reflective vocals atop banjo plucks, Verse 2 builds with soft snare and upright bass, Ethereal synths swell in the pre-chorus, while Chorus 1 blooms with warm keys and layered vocals, Chorus 2 adds pedal steel and fuller band, The second pre-chorus features fiddle lines, Outro floats with dreamy keys and drifting banjo",
        "Starts with a plucked banjo intro and soft piano tinkle, Verse 1 layers gentle male vocals with emotional lyrics, Verse 2 adds subtle string accents for depth, Pre-chorus builds with a piano swell, Chorus 1 erupts with emo-driven vocals and banjo strums, Chorus 2 introduces light percussion and vocal harmonies, Outro fades with a solo banjo and wistful hum"
    ]
  },
  {
    id: "reggae_caribbean",
    label: "雷鬼 - 轻松岛屿",
    tags: [
        "roots reggae, offbeat guitar rhythm, bass guitar emphasis, toaster vocals, dub effects, jamaican patois, island breeze atmosphere, laid-back groove",
        "dancehall reggae, digital riddims, fast-paced vocals, heavy bass lines, electronic effects, caribbean party vibe, infectious energy, modern island sound",
        "reggae fusion, world music elements, smooth vocals, acoustic guitar interplay, percussion ensemble, tropical paradise atmosphere, culturally rich",
        "Opens with steel drums and offbeat reggae chords, setting a chill rap verse with soft vocal accents, Pre-chorus brings skanking guitars and airy harmonies, Chorus 1 blooms with a love duet over breezy chords, Chorus 2 adds vocal ad-libs for warmth, Rap Verse 2 mixes in light percussion rolls, Outro sways with sunset-inspired steel drum melodies and fading island rhythms"
    ]
  },
  {
    id: "blues_soulful",
    label: "蓝调 - 深沉忧郁",
    tags: [
        "chicago electric blues, wailing electric guitar, walking bassline, gritty male vocals, harmonica solos, smoky club atmosphere, emotional depth, raw power",
        "delta blues acoustic, slide guitar mastery, deep male vocals, simple percussion, mississippi river vibe, authentic roots, haunting melodies, soul-stirring",
        "modern blues rock, distorted guitar riffs, soulful female vocals, tight rhythm section, emotional intensity, rock energy with blues soul, passionate delivery"
    ]
  },
  {
    id: "metal_extreme",
    label: "重金属 - 狂暴力量",
    tags: [
        "power metal, blazing guitar solos, operatic male vocals, thunderous drums, epic fantasy themes, high energy, orchestral elements, heroic and triumphant",
        "thrash metal, lightning-fast guitar riffs, aggressive male growls, double bass drumming, rebellious attitude, underground energy, technical precision",
        "gothic metal, symphonic elements, haunting female vocals, heavy guitar distortion, dark atmosphere, medieval influences, dramatic and theatrical"
    ]
  },
  {
    id: "funk_groove",
    label: "放克 - 律动性感",
    tags: [
        "70s funk, groovy bass lines, clavinet keyboard, tight horn section, funk vocals, danceable rhythm, party atmosphere, soulful and sexy",
        "modern funk fusion, electronic elements, funky guitar licks, sensual vocals, hip hop influences, contemporary groove, dance floor ready",
        "acid jazz funk, jazz improvisation, funky breaks, smooth vocals, sophisticated arrangements, lounge atmosphere, cool and collected",
        "Retro Funk, Lo-Fi Beat, Zap FX, Inverted Chords, Street Sax, Broke Rap, DIY Scratches, Minimal Bass"
    ]
  },
  {
    id: "new_age_ambient",
    label: "新世纪 - 宁静冥想",
    tags: [
        "ambient new age, ethereal synthesizer pads, soft female vocals, nature soundscapes, meditative atmosphere, healing vibrations, peaceful and serene",
        "world fusion new age, global instruments, gentle female vocals, organic percussion, spiritual journey, multicultural elements, transcendent experience",
        "celtic new age, harp melodies, flute solos, mystical female vocals, ancient forest atmosphere, fairy tale vibes, magical and enchanting"
    ]
  },
  {
    id: "disco_retro",
    label: "迪斯科 - 闪耀复古",
    tags: [
        "classic disco, string section swells, funky bass groove, diva vocals, glittering atmosphere, dance floor energy, 70s glamour, glamorous and fun",
        "nu-disco revival, modern production, vintage synthesizer sounds, disco vocals, retro-futuristic vibe, club atmosphere, danceable grooves",
        "disco house fusion, electronic beats, orchestral elements, powerful vocals, glamorous production, party atmosphere, sophisticated dance music",
        "Disco Groove, Folk-Pop, Hand Percussion, C♯m Riffs, Shadowy Vocals, Conspiracy Loops, Delayed Chants, Upbeat Pulse"
    ]
  },
  {
    id: "indie_alternative",
    label: "独立另类 - 个性鲜明",
    tags: [
        "dream pop indie, ethereal vocals, shimmering guitars, atmospheric production, nostalgic melancholy, bedroom recording aesthetic, intimate and personal",
        "shoegaze alternative, wall of sound guitars, distant vocals, heavy reverb effects, psychedelic atmosphere, emotional intensity, immersive soundscapes",
        "chamber pop indie, orchestral arrangements, delicate vocals, intricate production, artistic sophistication, intellectual depth, emotionally complex",
        "Pop Folk, Acoustic Guitar, Warm Female Vocals, Mandolin, Piano, Strings, Light Percussion, Harmonica, Uplifting Harmony",
        "Pop Folk, Gentle 12-String, Vulnerable Female Vocal, Viola Solos, Light Djembe, Mellotron Flutes, Bittersweet Major-Minor Shifts",
        "Pop Folk, Guzheng, Erhu, Male Vocals, Bamboo Flute, Soft Fingerstyle Guitar, Minor Key, Heartbroken Melodies",
        "Indie Pop, New Wave, Xylophone Riffs, Breathy Vocals, Bossa Nova Guitar, Lo-Fi Hiss, Heartbeat Percussion, D Minor",
        "Pop-Folk, Indie, Acoustic Guitar, Major Chords, Uplifting Male Vocals, Cajon Percussion, Sunny Melodies, Hopeful Lyrics",
        "Acoustic Pop, Folk, Female Vocals, Gentle Percussion, Guitar Strums, Regretful Lyrics, BPM 100, Emotional Ups and Downs, Instrumental Intro: Acoustic guitar strums softly, cajón taps a gentle rhythm, evoking solitude, Verse 1: Female vocals, warm yet sorrowful, float over steady strums, light shaker adds texture, Verse 2: Vocals grow wistful, guitar picks brighter chords, cajón deepens with subtle kicks, Pre-chorus: Tambourine rattles, guitar arpeggios rise, lyrics reflect on lost chances, Chorus 1: Vocals lift with folk warmth, guitar strums swell, percussion steadies the emotional tide, Chorus 2: Vocals add harmony, guitar strums intensify, cajón drives with heartfelt thumps, Pre-chorus: Guitar softens, shaker sharpens, vocals ache with regret, Chorus 1+2: Vocals soar, guitar and percussion peak, emotions cascade, Outro: Guitar strums fade, cajón softens, a single note lingers in quiet regret",
        "Ringing acoustic guitar and steady brushed drums drive the folk rock structure, underpinned by a pulsing bass, Verses are sparse, spotlighting expressive male vocals with subtle organ and plaintive electric guitar licks, Choruses swell with vocal harmonies and electric bursts, climaxing in a raw, energetic bridge",
        "Opens with a post-rock intro, ambient guitar swells, and distant war drums, Verse 1 glides with shoegaze's dreamy distortion, male vocals chanting battle hymns over reverb-soaked chords, Verse 2 builds with pulsating bass, The pre-chorus drops to a single piano note and whispered ideals, Chorus 1 erupts with towering guitar walls and chanted refrains, Chorus 2 adds a glitchy synth pulse for intensity, The second pre-chorus introduces reverse guitar effects, The outro cascades into a cinematic explosion of feedback and strings, resolving in a soft, hopeful drone",
        "Instrumental Intro: Harp plucks dance over misty dream pop drones, gothic undertones setting a somber mood, Verse 1: Mourning female vocals emerge, folk acoustic strums support lyrics of lost dreams, Verse 2: Drones deepen, vocals turn haunting, reflecting mythic sorrow, Pre-chorus: Harp intensifies, drones swell, building tension, Chorus 1: Vocals rise with lush reverb, folk rhythms blend with dreamy pads, evoking regret, Chorus 2: Adds choral backing, harp more urgent, highlighting reality's sting, Pre-chorus: Sparse harp and drones, introspective, Chorus 1+2 repeat: Layered vocals, richer drones, Outro: Solo harp fades with a misty drone, mythic echoes lingering",
        "The instrumental intro blends reverb-heavy guitar and ethereal synths, crafting a dreamy haze, Verse 1 features breathy male vocals over minimalist indie folk picking, expressing cautious love, Verse 2 adds a soft kick drum and layered synths, suspicion creeping in, The pre-chorus shifts to a stark piano and vocal hum, creating tension, Chorus 1 blooms with hopeful chords and warm synth pads, vocals gliding optimistically, Chorus 2 intensifies with a pulsing bassline and richer harmonies, The second pre-chorus strips back to reverb guitar, vocals whispering doubt, The outro melts into ambient synths and faint guitar, unresolved and wistful",
        "Echoed guitars and minimalist beats introduce a desolate mood, Verse 1 layers crooning male vocals and mournful sax, Verse 2 adds dark ambient hums, Pre-chorus features eerie synth swells, Choruses build with soaring vocals, sax, and driving guitars, ending with lone sax and echoes",
        "Acoustic pop song unfolds with fingerpicked guitar, raw male emo vocals, and soft percussion, Melancholic violin swells in the pre-chorus, Choruses burst with bittersweet harmonies, driving snare, The outro strips back to solitary guitar, capturing teenage angst"
    ]
  },
  {
    id: "latin_tropical",
    label: "拉丁热带 - 热情奔放",
    tags: [
        "salsa caliente, latin percussion ensemble, passionate vocals, trumpet solos, danceable rhythm, fiesta atmosphere, vibrant energy, cultural celebration",
        "bachata romantica, gentle guitar arpeggios, smooth vocals, romantic lyrics, intimate atmosphere, tropical night vibe, heartfelt and emotional",
        "reggaeton urbano, dembow rhythm, rap vocals, electronic production, urban latin vibe, party energy, modern caribbean fusion, dance floor dominant",
        "Tropical House, Pop Ballad, Sia Vibrato, Sidechain Kick, Pluck Synths, Vi-IV-I-V, Rainforest Pads, Drop Build",
        "Salsa, Urban Pop, Male Vocals, Piano Riffs, Latin Beat, Emotive Delivery, Club Mix, Horn Stabs"
    ]
  },
  {
    id: "experimental_avant",
    label: "实验前卫 - 突破界限",
    tags: [
        "avant-garde experimental, unconventional sound design, distorted female vocals, industrial textures, abstract composition, boundary-pushing, intellectually challenging",
        "glitch electronica, digital artifacts, processed male vocals, algorithmic composition, futuristic atmosphere, technological innovation, mind-bending effects",
        "post-rock instrumental, building dynamics, ambient soundscapes, cinematic tension, emotional journey, progressive structure, expansive and cinematic"
    ]
  }
];

export const MOODS = [
  "快乐 (Happy)",
  "悲伤 (Sad)",
  "激昂 (Energetic)",
  "浪漫 (Romantic)",
  "治愈 (Healing)",
  "神秘 (Mysterious)",
  "兴奋 (Excited)",
  "焦虑 (Anxious)",
  "平静 (Calm)",
  "愤怒 (Angry)",
  "恐惧 (Fearful)",
  "惊喜 (Surprised)",
  "厌倦 (Bored)",
  "孤独 (Lonely)",
  "骄傲 (Proud)",
  "嫉妒 (Jealous)",
  "怀旧 (Nostalgic)",
  "希望 (Hopeful)",
  "绝望 (Desperate)",
  "狂喜 (Ecstatic)",
  "忧虑 (Worried)",
  "满足 (Content)"
];