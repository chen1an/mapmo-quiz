/**
 * MapMo - 社群派別心理測驗引擎 v2 (11題相似度比對模型 · Google 試算表後台 · 習慣特刊視覺)
 * Strict implementation of 社群派別心理測驗｜題目與計算邏輯說明 (Q1-Q10 Scored + Q11 Unscored)
 */

(function() {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // 1. 測驗核心結構：五大派別光譜軸、四個章節引言、Q1-Q11 完整題庫
  //    光譜順序不可更動：0 潛水 -> 1 備忘錄 -> 2 悄悄 -> 3 精修 -> 4 隨心
  // ─────────────────────────────────────────────────────────
  const PERSONA_ORDER = ['lurker', 'diarist', 'stealth', 'curator', 'freespirit'];

  const QUIZ_SECTIONS = {
    record: {
      id: 'record',
      navLabel: '記錄生活',
      bannerTitle: '一、記錄生活',
      quote: '先從日常開始，那些讓你停下腳步的小瞬間。'
    },
    share: {
      id: 'share',
      navLabel: '分享這件事',
      bannerTitle: '二、分享這件事',
      quote: '留下來的片刻，你會想讓別人看見嗎？'
    },
    gaze: {
      id: 'gaze',
      navLabel: '別人的眼光',
      bannerTitle: '三、別人的眼光',
      quote: '最後，聊聊發出去之後的那些心情。'
    },
    closing: {
      id: 'closing',
      navLabel: '結尾',
      bannerTitle: '結尾（不計分）',
      quote: '最後一題，想像一下就好，沒有標準答案。'
    }
  };

  // Q1–Q10 計分題（選項順序嚴格依表格，不依分數排序）
  // types 對照：0=潛水觀察派, 1=備忘錄日記派, 2=悄悄發佈派, 3=精修完美派, 4=隨心所欲派
  const SCORED_QUESTIONS = [
    {
      id: 'Q1',
      section: 'record',
      showQuote: true,
      prompt: '走在路上遇到超美的夕陽，你會？',
      options: [
        { letter: 'A', text: '拍下來分享出去', score: 3, types: [2, 3, 4], typesLabel: '悄悄・精修・隨心' },
        { letter: 'B', text: '看一眼記在心裡就好', score: 1, types: [0], typesLabel: '潛水' },
        { letter: 'C', text: '拍下來存在相簿，留給自己回味', score: 2, types: [1], typesLabel: '備忘錄' }
      ]
    },
    {
      id: 'Q2',
      section: 'record',
      showQuote: false,
      prompt: '週末出門玩了一整天，回到家後你最常做的事是？',
      options: [
        { letter: 'A', text: '滑手機放鬆，不太會整理照片', score: 1, types: [0], typesLabel: '潛水' },
        { letter: 'B', text: '整理照片，順便在備忘錄寫幾句心得', score: 2, types: [1], typesLabel: '備忘錄' },
        { letter: 'C', text: '挑幾張照片，準備發出去', score: 3, types: [2, 3, 4], typesLabel: '悄悄・精修・隨心' }
      ]
    },
    {
      id: 'Q3',
      section: 'record',
      showQuote: false,
      prompt: '這樣累積下來，打開你的手機相簿，裡面大多是？',
      options: [
        { letter: 'A', text: '截圖和工作資料，生活照不多', score: 1, types: [0], typesLabel: '潛水' },
        { letter: 'B', text: '很多生活照，大多自己看，偶爾分享', score: 2, types: [1, 2], typesLabel: '備忘錄・悄悄' },
        { letter: 'C', text: '很多生活照，常常拿來發文', score: 3, types: [3, 4], typesLabel: '精修・隨心' }
      ]
    },
    {
      id: 'Q4',
      section: 'share',
      showQuote: true,
      prompt: '一天結束時，今天的心情和發生的事，通常會留在哪裡？',
      options: [
        { letter: 'A', text: '大多已經在限動或貼文上了', score: 3, types: [3, 4], typesLabel: '精修・隨心' },
        { letter: 'B', text: '不太會特別留下，過了就過了', score: 1, types: [0], typesLabel: '潛水' },
        { letter: 'C', text: '留在相簿或備忘錄，偶爾挑一些分享', score: 2, types: [1, 2], typesLabel: '備忘錄・悄悄' }
      ]
    },
    {
      id: 'Q5',
      section: 'share',
      showQuote: false,
      prompt: '想分享一件生活小事的時候，你通常會？',
      options: [
        { letter: 'A', text: '很少有想分享的時候，看別人分享比較多', score: 1, types: [0], typesLabel: '潛水' },
        { letter: 'B', text: '先想想適合放在哪裡、要給誰看', score: 2, types: [1, 2, 3], typesLabel: '備忘錄・悄悄・精修' },
        { letter: 'C', text: '直接發在限動或貼文，誰看到都可以', score: 3, types: [4], typesLabel: '隨心' }
      ]
    },
    {
      id: 'Q6',
      section: 'share',
      showQuote: false,
      prompt: '說到發文，從拍照到把貼文發出去，你通常？',
      options: [
        { letter: 'A', text: '隨手就發，馬上搞定', score: 3, types: [4], typesLabel: '隨心' },
        { letter: 'B', text: '會想一下內容，或挑個時間再發', score: 2, types: [2, 3], typesLabel: '悄悄・精修' },
        { letter: 'C', text: '拍完就停在相簿裡，很少走到發文這一步', score: 1, types: [0, 1], typesLabel: '潛水・備忘錄' }
      ]
    },
    {
      id: 'Q7',
      section: 'share',
      showQuote: false,
      prompt: '貼文發出去之後，你希望追蹤者第一時間就看到嗎？',
      options: [
        { letter: 'A', text: '我很少發文，就算發也是給自己看的', score: 1, types: [0, 1], typesLabel: '潛水・備忘錄' },
        { letter: 'B', text: '我不希望太快被注意到', score: 2, types: [2], typesLabel: '悄悄' },
        { letter: 'C', text: '希望有人看到，有回應會很開心', score: 3, types: [3, 4], typesLabel: '精修・隨心' }
      ]
    },
    {
      id: 'Q8',
      section: 'gaze',
      showQuote: true,
      prompt: '如果這篇貼文沒什麼人按讚，你會？',
      options: [
        { letter: 'A', text: '開始想是不是照片、文案或發文時間沒選好', score: 2, types: [3], typesLabel: '精修' },
        { letter: 'B', text: '無所謂，發出來就好', score: 3, types: [4], typesLabel: '隨心' },
        { letter: 'C', text: '本來就沒打算讓太多人看到，或根本沒在發', score: 1, types: [0, 1, 2], typesLabel: '潛水・備忘錄・悄悄' }
      ]
    },
    {
      id: 'Q9',
      section: 'gaze',
      showQuote: false,
      prompt: '如果朋友跟你說，你的貼文「好像跟平常不太一樣」，你會？',
      options: [
        { letter: 'A', text: '這種事不太會發生在我身上，我發得很少也很低調', score: 1, types: [0, 1, 2], typesLabel: '潛水・備忘錄・悄悄' },
        { letter: 'B', text: '不在意，我想發什麼就發什麼', score: 3, types: [4], typesLabel: '隨心' },
        { letter: 'C', text: '有點在意，會回頭看看這篇是不是跟我平常的風格不搭', score: 2, types: [3], typesLabel: '精修' }
      ]
    },
    {
      id: 'Q10',
      section: 'gaze',
      showQuote: false,
      prompt: '發文前，你會想到「某些人也會看到」嗎？（像是家人、主管、不太熟的朋友）',
      options: [
        { letter: 'A', text: '會想到，所以大多留給自己看就好', score: 1, types: [0, 1], typesLabel: '潛水・備忘錄' },
        { letter: 'B', text: '不太會，誰看到都沒關係', score: 3, types: [4], typesLabel: '隨心' },
        { letter: 'C', text: '會想到，所以會設定摯友、隱藏對象，或改一下內容再發', score: 2, types: [2, 3], typesLabel: '悄悄・精修' }
      ]
    }
  ];

  // Q11 不計分結尾題（記錄答案作展板數據）
  const FINAL_QUESTION = {
    id: 'Q11',
    section: 'closing',
    showQuote: true,
    prompt: '那如果發文時，完全不用擔心誰會看到，你最想分享什麼？',
    options: [
      { letter: 'A', text: '一處讓我停下腳步的風景' },
      { letter: 'B', text: '一句沒說出口的心情' },
      { letter: 'C', text: '一段想記住的回憶' },
      { letter: 'D', text: '一張很喜歡、但一直沒發出去的照片' }
    ]
  };

  const ALL_QUESTIONS = SCORED_QUESTIONS.concat([FINAL_QUESTION]);

  // ─────────────────────────────────────────────────────────
  // 2. 五大社群派別資料定義（對齊 PDF 規格 + 習慣特刊素材 + MapMo 推薦）
  // ─────────────────────────────────────────────────────────
  const PERSONAS = {
    lurker: {
      index: 0,
      id: 'lurker',
      name: '潛水觀察派',
      shortName: '潛水觀察',
      enTitle: 'THE SILENT OBSERVER',
      motto: '不留痕跡，但從沒錯過',
      traitSummary: '很少記錄、幾乎不發文，主要看別人的生活',
      typicalScore: 10,
      barColor: '#2E6295',
      textColor: '#214A73',
      charImg: 'assets/personas/lurker-char.png',
      posterImg: 'assets/personas/lurker-poster.jpg',
      description: '你習慣站在螢幕這一端，安靜看著大家的生活。不是沒有想法，只是覺得不一定要說出來。',
      posterObserve: '沒有特別紀錄自己的習慣，卻喜歡看熟人或陌生人的日常。你是社群裡最安靜的讀者，也是最認真的那一位。',
      emotionLabel: '安靜參與者 · 典型分 10',
      features: {
        primary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '用情緒篩選器默默逛逛，找到和你同頻的回憶，完全不用擔心社交壓力。'
          },
          {
            name: '收藏與 AI 推播',
            icon: 'heart',
            desc: '把有共鳴的城市角落悄悄收藏起來，AI 會推薦地圖上同頻率的生活記憶。'
          }
        ],
        secondary: [
          {
            name: '私人發文',
            icon: 'lock',
            desc: '哪天突然想留下一句話給未來的自己，也有純私密的座標角落可以安放。'
          }
        ]
      }
    },

    diarist: {
      index: 1,
      id: 'diarist',
      name: '備忘錄日記派',
      shortName: '備忘錄日記',
      enTitle: 'THE PRIVATE DIARIST',
      motto: '本日記錄，僅限本人閱讀',
      traitSummary: '記錄很多，但大多留給自己，偶爾才分享',
      typicalScore: 15,
      barColor: '#C85A82',
      textColor: '#9C3B5F',
      charImg: 'assets/personas/diarist-char.png',
      posterImg: 'assets/personas/diarist-poster.jpg',
      description: '你的相簿和備忘錄藏著滿滿的生活。記錄是為了自己，分享反而是偶爾的事。',
      posterObserve: '習慣把生活一筆筆記下，但只寫給自己看。比起按讚數，你更在意多年後翻回來時，還記得當時的心情。',
      emotionLabel: '私密收藏家 · 典型分 15',
      features: {
        primary: [
          {
            name: '私人發文',
            icon: 'lock',
            desc: '只想記錄、不想分享的日子，在地圖上好好安放當下的心情與座標，日後回顧更具體。'
          }
        ],
        secondary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '偶爾散步看別人留下的真實切片，不留言、不按讚，維持舒服的距離感。'
          },
          {
            name: '收藏與 AI 推播',
            icon: 'heart',
            desc: '把觸動你的照片收進口袋，找回當時在街角遇見自己的感動。'
          }
        ]
      }
    },

    stealth: {
      index: 2,
      id: 'stealth',
      name: '悄悄發佈派',
      shortName: '悄悄發佈',
      enTitle: 'THE QUIET POSTER',
      motto: '發了，但希望你晚點再看到',
      traitSummary: '想分享，但不想太快被注意，會用小帳、摯友控制誰看得到',
      typicalScore: 20,
      barColor: '#D96846',
      textColor: '#B54728',
      charImg: 'assets/personas/stealth-char.png',
      posterImg: 'assets/personas/stealth-poster.jpg',
      description: '你想分享，但更想決定誰能看到。小帳、摯友、限動，是你和世界保持剛好距離的方式。',
      posterObserve: '熱愛記錄，也想分享，卻不希望被第一時間注意到。貼文像夾在書頁裡的小紙條，等對的人慢慢翻到。',
      emotionLabel: '低調發佈者 · 典型分 20',
      features: {
        primary: [
          {
            name: '匿名分享',
            icon: 'user-secret',
            desc: '不必擔心被誰第一眼看見，安心把生活放上地圖，讓路過的有緣人自然發現共鳴。'
          },
          {
            name: '私人發文',
            icon: 'lock',
            desc: '有些只說一半的心事，自由切換成私密紀錄，不必費心篩選摯友名單。'
          }
        ],
        secondary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '沒有通知轟炸與時間序緊迫感，一切在情緒地圖上自在發酵。'
          }
        ]
      }
    },

    curator: {
      index: 3,
      id: 'curator',
      name: '精修完美派',
      shortName: '精修完美',
      enTitle: 'THE PERFECTIONIST EDITOR',
      motto: '一則貼文，修了三個晚上',
      traitSummary: '常發文，在意呈現效果、讚數和別人的反應',
      typicalScore: 25,
      barColor: '#D4931D',
      textColor: '#986307',
      charImg: 'assets/personas/curator-char.png',
      posterImg: 'assets/personas/curator-poster.jpg',
      description: '你在乎每一篇貼文呈現出來的樣子，照片、文案、時間都想做到最好，因為那代表你。',
      posterObserve: '喜歡記錄也樂於分享，很在意別人怎麼看。音樂、濾鏡、排版、文案，每個細節都要確認再三才按下發佈。',
      emotionLabel: '細節策展人 · 典型分 25',
      features: {
        primary: [
          {
            name: '匿名分享',
            icon: 'user-secret',
            desc: '卸下被評價與讚數審視的壓力，不用完美也能被理解。還在修的半成品，也有地方安放。'
          },
          {
            name: '私人發文',
            icon: 'lock',
            desc: '那些捨不得發出去的真實毛邊與備忘瞬間，私密收藏起來也很珍貴。'
          }
        ],
        secondary: [
          {
            name: '收藏與 AI 推播',
            icon: 'heart',
            desc: '依你的視覺偏好與情緒脈絡，在地圖上遇見欣賞同種美感的陌生旅人。'
          }
        ]
      }
    },

    freespirit: {
      index: 4,
      id: 'freespirit',
      name: '隨心所欲派',
      shortName: '隨心所欲',
      enTitle: 'THE FREE SPIRIT',
      motto: '想發就發，從不設限',
      traitSummary: '常發文，想發就發，不太在意別人怎麼看',
      typicalScore: 30,
      barColor: '#4A5450',
      textColor: '#2B3330',
      charImg: 'assets/personas/freespirit-char.png',
      posterImg: 'assets/personas/freespirit-poster.jpg',
      description: '想發就發，不太被數字和眼光綁住。社群對你來說就是生活的一部分，自然就好。',
      posterObserve: '喜歡記錄、喜歡分享，不介意他人眼光。你展現的是最真實、不設限的自己，動態就是生活本身。',
      emotionLabel: '率真生活家 · 典型分 30',
      features: {
        primary: [
          {
            name: '匿名分享',
            icon: 'user-secret',
            desc: '把當下最真實的心情直接放上地圖，不用管演算法，讓路過城市的人與你的熱度共鳴。'
          }
        ],
        secondary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '到處看看這座城市現在正發生哪些不加修飾的鮮活故事。'
          },
          {
            name: '收藏與 AI 推播',
            icon: 'heart',
            desc: '收藏喜歡的視角，隨時發現身邊同樣鮮活的生活角落。'
          }
        ]
      }
    }
  };

  // ─────────────────────────────────────────────────────────
  // 3. 狀態與後端常數
  // ─────────────────────────────────────────────────────────
  const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbzslwCHEPOq9aAnqBT-LUNETzH8rQCawGeT1V_u3ge6u5-DT56krRgk0VYcQr7a_tU/exec';
  const FIXED_QUIZ_GITHUB_URL = 'https://chen1an.github.io/mapmo-quiz/';
  const PENDING_SYNC_STORAGE_KEY = '@mapmo_quiz_pending_v3';
  const WEBHOOK_STORAGE_KEY = '@mapmo_quiz_sheets_webhook_v2';
  const LOCAL_CACHE_STATS_KEY = '@mapmo_quiz_cached_stats_v3';
  const LOCAL_RECORDS_STORAGE_KEY = '@mapmo_quiz_local_records_v3';

  let currentIndex = 0;       // 0..10 (Q1..Q11)
  let userAnswers = new Array(11).fill(null); // 儲存各題所選索引 0..2 / 0..3
  let currentEvaluation = null; // 完整判定物件
  let currentRunSerial = '';
  let hasSubmittedCurrentRun = false;
  let isSoundEnabled = true;
  let activeQrStudioTab = 'tree';

  const statsState = {
    summary: { total: 0, lurker: 0, diarist: 0, stealth: 0, curator: 0, freespirit: 0 },
    records: [],
    isConfigured: true,
    isOnline: false,
    isSyncing: true,
    isLoadingRecords: false
  };

  // ─────────────────────────────────────────────────────────
  // 4. Web Audio API 音效合成
  // ─────────────────────────────────────────────────────────
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type, extraIndex = 0) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const playLeafRustle = (duration = 0.38, peakGain = 0.08, filterFreq = 1600) => {
        const bufferSize = Math.floor(ctx.sampleRate * duration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(filterFreq, now);
        filter.Q.setValueAtTime(1.8, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(peakGain, now + duration * 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + duration);
      };

      if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'whoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.14);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'treeToQr') {
        playLeafRustle(0.52, 0.09, 1900);
        [880, 783.99, 659.25, 587.33, 523.25, 1046.5].forEach((freq, i, arr) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === arr.length - 1 ? 'sine' : 'triangle';
          const t0 = now + i * 0.055;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.1, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.24);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.25);
        });
      } else if (type === 'qrToTree') {
        playLeafRustle(0.48, 0.07, 1400);
        [523.25, 587.33, 659.25, 783.99, 880, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t0 = now + 0.04 + i * 0.052;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.09, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.34);
        });
      } else if (type === 'seasonChange') {
        playLeafRustle(0.28, 0.06, 2100);
        const chords = [[659.25, 880, 1046.5], [523.25, 659.25, 783.99], [440, 554.37, 659.25]];
        (chords[extraIndex % 3] || chords[0]).forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const t0 = now + i * 0.06;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.09, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.26);
        });
      } else if (type === 'colorChange') {
        const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
        const f = scale[extraIndex % scale.length] || 659.25;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f * 0.85, now);
        osc.frequency.exponentialRampToValueAtTime(f * 1.15, now + 0.09);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          gain.gain.setValueAtTime(0.1, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
      }
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────
  // 5. DOM 快取與啟動初始化
  // ─────────────────────────────────────────────────────────
  let screenStart, screenQuiz, screenAnalyzing, screenResult;
  let qProgressFill, qProgressBarRole, qStepIndicator, qSectionLabel, qBackBtn;
  let qSectionQuoteBanner, qSectionQuoteTitle, qSectionQuoteText;
  let qPromptText, qOptionsContainer;
  let standeeModal, adminModal, mediaPreviewModal, standeeQrHolder, cardFooterQrHolder;
  let soundToggleBtn, standeeOpenBtn, adminOpenBtn;
  const mediaPreviewState = {
    objectUrl: '',
    blob: null,
    filename: 'MapMo-測驗結果.png',
    shareTitle: 'MapMo 社群心理測驗',
    shareText: '我在 MapMo 測出了我的社群派別，快來測測你是哪一派！'
  };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    initDialogFallbacks();
    bindEvents();
    renderFixedQRCodes();
    initBackendAndStats();
  });

  function cacheDOMElements() {
    screenStart = document.getElementById('screenStart');
    screenQuiz = document.getElementById('screenQuiz');
    screenAnalyzing = document.getElementById('screenAnalyzing');
    screenResult = document.getElementById('screenResult');

    qProgressFill = document.getElementById('qProgressFill');
    qProgressBarRole = document.getElementById('qProgressBarRole');
    qStepIndicator = document.getElementById('qStepIndicator');
    qSectionLabel = document.getElementById('qSectionLabel');
    qBackBtn = document.getElementById('qBackBtn');

    qSectionQuoteBanner = document.getElementById('qSectionQuoteBanner');
    qSectionQuoteTitle = document.getElementById('qSectionQuoteTitle');
    qSectionQuoteText = document.getElementById('qSectionQuoteText');

    qPromptText = document.getElementById('qPromptText');
    qOptionsContainer = document.getElementById('qOptionsContainer');

    standeeModal = document.getElementById('standeeModal');
    adminModal = document.getElementById('adminModal');
    mediaPreviewModal = document.getElementById('mediaPreviewModal');
    standeeQrHolder = document.getElementById('standeeQrHolder');
    cardFooterQrHolder = document.getElementById('cardFooterQrHolder');

    soundToggleBtn = document.getElementById('soundToggleBtn');
    standeeOpenBtn = document.getElementById('standeeOpenBtn');
    adminOpenBtn = document.getElementById('adminOpenBtn');
  }

  // Native <dialog closedby="any"> fallback + <dialog> animation cleanup
  function initDialogFallbacks() {
    if (standeeModal) {
      standeeModal.addEventListener('close', () => {
        if (treeQrState.animFrameId) {
          cancelAnimationFrame(treeQrState.animFrameId);
          treeQrState.animFrameId = null;
        }
        document.body.classList.remove('print-bw-qr');
      });
    }

    if (mediaPreviewModal) {
      mediaPreviewModal.addEventListener('close', () => {
        const previewImg = document.getElementById('mediaPreviewImg');
        if (previewImg) previewImg.removeAttribute('src');
        if (mediaPreviewState.objectUrl) {
          URL.revokeObjectURL(mediaPreviewState.objectUrl);
          mediaPreviewState.objectUrl = '';
        }
        mediaPreviewState.blob = null;
      });
    }

    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
      const isOutsideBox = (e, dialog) => {
        const box = dialog.querySelector('.standee-modal-box') || dialog;
        const r = box.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
        let pressedOutside = false;
        dialog.addEventListener('pointerdown', (e) => { pressedOutside = isOutsideBox(e, dialog); });
        dialog.addEventListener('pointerup', (e) => {
          if (pressedOutside && isOutsideBox(e, dialog)) dialog.close();
          pressedOutside = false;
        });
      });
    }
  }

  function navigateWithTransition(updateDOM, direction = 'forward') {
    if (typeof document.startViewTransition !== 'function') {
      updateDOM();
      return;
    }
    const supportsTyped = typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
      && CSS.supports('selector(:active-view-transition-type(forward))');
    try {
      if (supportsTyped) {
        document.startViewTransition({ update: updateDOM, types: [direction] });
      } else {
        document.startViewTransition(updateDOM);
      }
    } catch (_) {
      updateDOM();
    }
  }

  function bindEvents() {
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        playSound('tap');
        startQuiz();
      });
    }

    if (qBackBtn) {
      qBackBtn.addEventListener('click', () => {
        playSound('whoosh');
        goBackStep();
      });
    }

    const restartBtn = document.getElementById('btnRestartQuiz');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        playSound('tap');
        restartQuiz();
      });
    }

    const copyLinkBtn = document.getElementById('btnCopyQuizLink');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => copyQuizLink());
    }

    const downloadImgBtn = document.getElementById('btnDownloadResultImg');
    if (downloadImgBtn) {
      downloadImgBtn.addEventListener('click', () => exportResultCardImage());
    }

    const previewPosterBtn = document.getElementById('btnPreviewZinePoster');
    if (previewPosterBtn) {
      previewPosterBtn.addEventListener('click', () => openZinePosterPreview());
    }

    const downloadPosterBtn = document.getElementById('btnDownloadZinePoster');
    if (downloadPosterBtn) {
      downloadPosterBtn.addEventListener('click', () => {
        if (isCompactTouchViewport()) {
          openZinePosterPreview();
        } else {
          downloadZinePosterFile();
        }
      });
    }

    const mediaPreviewCloseBtn = document.getElementById('mediaPreviewCloseBtn');
    if (mediaPreviewCloseBtn) {
      mediaPreviewCloseBtn.addEventListener('click', () => closeMediaPreviewModal());
    }

    const sharePreviewBtn = document.getElementById('btnSharePreviewMedia');
    if (sharePreviewBtn) {
      sharePreviewBtn.addEventListener('click', () => shareActivePreviewMedia());
    }

    const openQrResultBtn = document.getElementById('btnOpenQrFromResult');
    if (openQrResultBtn) {
      openQrResultBtn.addEventListener('click', () => {
        playSound('tap');
        openStandeeModal();
      });
    }

    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggleBtn.innerHTML = isSoundEnabled
          ? '<i class="fas fa-volume-up" aria-hidden="true"></i><span class="pill-label-full"> 音效</span>'
          : '<i class="fas fa-volume-mute" aria-hidden="true"></i><span class="pill-label-full"> 靜音</span>';
        soundToggleBtn.setAttribute('aria-pressed', String(isSoundEnabled));
        soundToggleBtn.setAttribute('aria-label', isSoundEnabled ? '切換互動音效（目前開啟）' : '切換互動音效（目前靜音）');
        soundToggleBtn.classList.toggle('active', isSoundEnabled);
        if (isSoundEnabled) playSound('tap');
      });
    }

    const btnOpenTreeHome = document.getElementById('btnOpenTreeQrFromHome');
    if (btnOpenTreeHome) {
      btnOpenTreeHome.addEventListener('click', () => {
        playSound('tap');
        openStandeeModal('tree');
      });
    }

    const btnOpenBwHome = document.getElementById('btnOpenBwQrFromHome');
    if (btnOpenBwHome) {
      btnOpenBwHome.addEventListener('click', () => {
        playSound('tap');
        openStandeeModal('bw');
      });
    }

    const btnOpenAdminHome = document.getElementById('btnOpenAdminFromHome');
    if (btnOpenAdminHome) {
      btnOpenAdminHome.addEventListener('click', () => {
        playSound('tap');
        openAdminModal();
      });
    }

    if (adminOpenBtn) {
      adminOpenBtn.addEventListener('click', () => {
        playSound('tap');
        openAdminModal();
      });
    }

    const adminCloseBtn = document.getElementById('adminCloseBtn');
    if (adminCloseBtn) {
      adminCloseBtn.addEventListener('click', () => closeAdminModal());
    }

    const tabTreeQrBtn = document.getElementById('tabTreeQrBtn');
    const tabBwQrBtn = document.getElementById('tabBwQrBtn');
    if (tabTreeQrBtn) {
      tabTreeQrBtn.addEventListener('click', () => {
        playSound('tap');
        switchQrStudioTab('tree');
      });
    }
    if (tabBwQrBtn) {
      tabBwQrBtn.addEventListener('click', () => {
        playSound('tap');
        switchQrStudioTab('bw');
      });
    }

    if (standeeOpenBtn) {
      standeeOpenBtn.addEventListener('click', () => {
        playSound('tap');
        openStandeeModal();
      });
    }

    const standeeCloseBtn = document.getElementById('standeeCloseBtn');
    if (standeeCloseBtn) {
      standeeCloseBtn.addEventListener('click', () => closeStandeeModal());
    }

    const btnPrintStandee = document.getElementById('btnPrintStandee');
    if (btnPrintStandee) {
      btnPrintStandee.addEventListener('click', () => {
        document.body.classList.remove('print-bw-qr');
        setTreeQrMode('qr', true);
        setTimeout(() => window.print(), 120);
      });
    }

    const bwUrlInput = document.getElementById('bwQrUrlInput');
    const bwTitleInput = document.getElementById('bwQrTitleInput');
    const treeUrlInput = document.getElementById('treeQrUrlInput');
    if (bwUrlInput) {
      bwUrlInput.addEventListener('input', () => {
        const val = bwUrlInput.value.trim() || FIXED_QUIZ_GITHUB_URL;
        if (treeUrlInput) treeUrlInput.value = val;
        treeQrState.url = val;
        rebuildQrAndTreeGeometry(val);
        renderBwQrCanvas();
        renderCardFooterQR();
      });
    }
    if (bwTitleInput) {
      bwTitleInput.addEventListener('input', () => {
        const titleEl = document.getElementById('bwPrintTitleDisplay');
        if (titleEl) {
          titleEl.textContent = bwTitleInput.value.trim() || '掃描測出你的社群派別';
        }
      });
    }

    const btnDownloadBwRawQr = document.getElementById('btnDownloadBwRawQr');
    if (btnDownloadBwRawQr) btnDownloadBwRawQr.addEventListener('click', () => downloadBwRawQrPng());

    const btnDownloadBwPoster = document.getElementById('btnDownloadBwPoster');
    if (btnDownloadBwPoster) btnDownloadBwPoster.addEventListener('click', () => downloadBwPosterPng());

    const btnPrintBwStandee = document.getElementById('btnPrintBwStandee');
    if (btnPrintBwStandee) {
      btnPrintBwStandee.addEventListener('click', () => {
        renderBwQrCanvas();
        document.body.classList.add('print-bw-qr');
        const cleanup = () => document.body.classList.remove('print-bw-qr');
        window.addEventListener('afterprint', cleanup, { once: true });
        setTimeout(() => {
          window.print();
          setTimeout(cleanup, 1500);
        }, 100);
      });
    }

    bindAdminEvents();

    const btnDownloadQR = document.getElementById('btnDownloadQR');
    if (btnDownloadQR) btnDownloadQR.addEventListener('click', () => downloadPureQRCode());

    const btnDownloadTreeView = document.getElementById('btnDownloadTreeView');
    if (btnDownloadTreeView) btnDownloadTreeView.addEventListener('click', () => downloadCurrentTreeCanvas());

    initTreeQrStudio();
  }

  // ─────────────────────────────────────────────────────────
  // 6. 測驗狀態流轉與精準相似度判定邏輯 (Verbatim PDF Spec)
  // ─────────────────────────────────────────────────────────
  function setActiveScreen(targetScreen) {
    [screenStart, screenQuiz, screenAnalyzing, screenResult].forEach((s) => {
      if (s) s.classList.toggle('active', s === targetScreen);
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function startQuiz() {
    currentIndex = 0;
    userAnswers = new Array(11).fill(null);
    currentEvaluation = null;
    currentRunSerial = '';
    hasSubmittedCurrentRun = false;
    document.title = '測驗進行中 · 你是哪一種社群派？ | MapMo';

    navigateWithTransition(() => {
      setActiveScreen(screenQuiz);
      renderCurrentQuestion();
    }, 'forward');
  }

  function restartQuiz() {
    document.title = '你是哪一種社群派？ | MapMo 社群心理測驗';
    navigateWithTransition(() => {
      setActiveScreen(screenStart);
    }, 'backward');
  }

  function renderCurrentQuestion() {
    const q = ALL_QUESTIONS[currentIndex];
    if (!q) return;

    const sectionMeta = QUIZ_SECTIONS[q.section];
    const progressPct = Math.round(((currentIndex + 1) / ALL_QUESTIONS.length) * 100);
    if (qProgressFill) qProgressFill.style.width = `${progressPct}%`;
    if (qProgressBarRole) qProgressBarRole.setAttribute('aria-valuenow', String(progressPct));
    if (qStepIndicator) qStepIndicator.textContent = `${currentIndex + 1} / ${ALL_QUESTIONS.length}`;
    if (qSectionLabel && sectionMeta) qSectionLabel.textContent = sectionMeta.navLabel;

    // 僅在各章節第一題 (Q1, Q4, Q8, Q11) 呈現內嵌章節引言
    if (qSectionQuoteBanner && sectionMeta) {
      if (q.showQuote) {
        qSectionQuoteBanner.hidden = false;
        if (qSectionQuoteTitle) qSectionQuoteTitle.textContent = sectionMeta.bannerTitle;
        if (qSectionQuoteText) qSectionQuoteText.textContent = sectionMeta.quote;
      } else {
        qSectionQuoteBanner.hidden = true;
      }
    }

    if (qPromptText) qPromptText.textContent = q.prompt;

    if (qBackBtn) {
      qBackBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
      qBackBtn.disabled = currentIndex === 0;
    }

    if (qOptionsContainer) {
      qOptionsContainer.innerHTML = '';
      const prevIdx = userAnswers[currentIndex];
      q.options.forEach((opt, optIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn' + (prevIdx === optIdx ? ' selected-prev' : '');
        btn.innerHTML = `
          <div class="quiz-option-content">
            <span class="quiz-option-badge">${escapeHtml(opt.letter)}</span>
            <span class="quiz-option-text">${escapeHtml(opt.text)}</span>
          </div>
        `;
        btn.addEventListener('click', () => handleOptionSelect(optIdx));
        qOptionsContainer.appendChild(btn);
      });
    }
  }

  function handleOptionSelect(optIdx) {
    playSound('tap');
    userAnswers[currentIndex] = optIdx;

    if (currentIndex < ALL_QUESTIONS.length - 1) {
      currentIndex += 1;
      navigateWithTransition(() => renderCurrentQuestion(), 'forward');
    } else {
      triggerAnalyzing();
    }
  }

  function goBackStep() {
    if (currentIndex <= 0) return;
    currentIndex -= 1;
    navigateWithTransition(() => renderCurrentQuestion(), 'backward');
  }

  /**
   * 嚴格依據 PDF 計分演算法判定主派別、次要影子 (>=70%) 與相似度百分比
   * @param {number[]} answers - 長度至少 10 的選項索引陣列 (Q1..Q10)
   * @param {number|null} q11Idx - Q11 所選索引 (0..3)
   */
  function evaluateQuizResult(answers, q11Idx) {
    let total = 0;
    const match = [0, 0, 0, 0, 0];

    for (let n = 0; n < SCORED_QUESTIONS.length; n++) {
      const optIdx = Number(answers[n]);
      const opt = SCORED_QUESTIONS[n].options[optIdx] || SCORED_QUESTIONS[n].options[0];
      total += opt.score;
      opt.types.forEach((t) => { match[t] += 1; });
    }

    const order = [0, 1, 2, 3, 4].sort((a, b) =>
      (match[b] - match[a]) ||
      (Math.abs(total - (10 + 5 * a)) - Math.abs(total - (10 + 5 * b))) ||
      (a - b)
    );

    const mainTypeIdx = order[0];
    const secondTypeIdx = order[1];
    const mainPersonaId = PERSONA_ORDER[mainTypeIdx];
    const secondPersonaId = PERSONA_ORDER[secondTypeIdx];
    const showSecond = match[secondTypeIdx] >= 7;

    const similarities = PERSONA_ORDER.map((pid, idx) => ({
      id: pid,
      matchCount: match[idx],
      pct: Math.round((match[idx] / 10) * 100)
    }));

    const q11Opt = (q11Idx != null && FINAL_QUESTION.options[q11Idx])
      ? FINAL_QUESTION.options[q11Idx]
      : null;

    return {
      mainPersonaId,
      secondPersonaId,
      mainPersona: PERSONAS[mainPersonaId],
      secondPersona: PERSONAS[secondPersonaId],
      mainMatchCount: match[mainTypeIdx],
      mainPct: Math.round((match[mainTypeIdx] / 10) * 100),
      secondMatchCount: match[secondTypeIdx],
      secondPct: Math.round((match[secondTypeIdx] / 10) * 100),
      showSecond,
      totalScore: total,
      matchCounts: match,
      similarities,
      q11Letter: q11Opt ? q11Opt.letter : '',
      q11Text: q11Opt ? q11Opt.text : ''
    };
  }

  function triggerAnalyzing() {
    currentEvaluation = evaluateQuizResult(userAnswers, userAnswers[10]);

    navigateWithTransition(() => {
      setActiveScreen(screenAnalyzing);
    }, 'forward');

    const subText = document.getElementById('analyzingSubtext');
    const messages = [
      '正在核對 Q1–Q10 五大派別吻合題數...',
      '正在計算光譜相似度分佈與潛在影子...',
      '正在準備你的《習慣特刊》測驗檔案...'
    ];

    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step < messages.length && subText) {
        subText.textContent = messages[step];
      }
    }, 360);

    setTimeout(() => {
      clearInterval(timer);
      playSound('success');
      if (!currentRunSerial) {
        const num = Math.floor(1000 + Math.random() * 9000);
        currentRunSerial = `${currentEvaluation.mainPersonaId.toUpperCase()}-${num}`;
      }
      document.title = `我是「${currentEvaluation.mainPersona.name}」 | MapMo 社群心理測驗`;
      renderResult(currentEvaluation, currentRunSerial);
      navigateWithTransition(() => {
        setActiveScreen(screenResult);
      }, 'forward');
      recordQuizCompletion(currentEvaluation, currentRunSerial, userAnswers);
    }, 1150);
  }

  // ─────────────────────────────────────────────────────────
  // 7. 結果頁渲染（嚴格依 PDF 規格 1~4 順序 + 習慣特刊素材 + MapMo 介紹）
  // ─────────────────────────────────────────────────────────
  function renderResult(evalObj, serialCode) {
    if (!evalObj || !evalObj.mainPersona) return;
    const persona = evalObj.mainPersona;

    const serialEl = document.getElementById('polaroidSerial');
    if (serialEl) serialEl.textContent = `NO. ${serialCode}`;

    const pillEl = document.getElementById('personaIssuePill');
    if (pillEl) pillEl.textContent = `習慣特刊 · ${persona.enTitle}`;

    const titleEl = document.getElementById('personaMainTitle');
    if (titleEl) {
      titleEl.textContent = persona.name;
      titleEl.style.color = persona.textColor;
    }

    const mottoEl = document.getElementById('personaMotto');
    if (mottoEl) mottoEl.textContent = persona.motto;

    const matchEl = document.getElementById('personaMatchHighlight');
    if (matchEl) {
      matchEl.innerHTML = `吻合度最高 · <strong>${evalObj.mainPct}%</strong>（吻合 ${evalObj.mainMatchCount} / 10 題）`;
    }

    const charImgEl = document.getElementById('resultCharImg');
    if (charImgEl) {
      charImgEl.src = persona.charImg;
      charImgEl.alt = `${persona.name}代表人物插畫`;
    }

    const descEl = document.getElementById('personaDescriptionText');
    if (descEl) descEl.textContent = persona.description;

    const shadowBox = document.getElementById('secondPersonaShadow');
    const shadowText = document.getElementById('secondPersonaShadowText');
    if (shadowBox && shadowText) {
      if (evalObj.showSecond && evalObj.secondPersona) {
        shadowBox.hidden = false;
        shadowText.textContent = `你也有幾分「${evalObj.secondPersona.name}」的影子（相似度 ${evalObj.secondPct}%）。`;
      } else {
        shadowBox.hidden = true;
      }
    }

    // 五大派別相似度長條圖（嚴格依光譜順序：潛水 -> 備忘錄 -> 悄悄 -> 精修 -> 隨心，僅主派別上色）
    const barsHost = document.getElementById('spectrumBarsList');
    if (barsHost) {
      barsHost.innerHTML = evalObj.similarities.map((item) => {
        const p = PERSONAS[item.id];
        const isWinner = item.id === persona.id;
        return `
          <div class="spectrum-col${isWinner ? ' is-winner' : ''}" style="--winner-color:${p.barColor};">
            <span class="spectrum-col-pct">${item.pct}%</span>
            <div class="spectrum-col-track" aria-hidden="true">
              <div class="spectrum-col-fill" data-target-height="${item.pct}" style="height:0%;"></div>
            </div>
            <span class="spectrum-col-label">${escapeHtml(p.shortName)}</span>
          </div>
        `;
      }).join('');

      requestAnimationFrame(() => {
        barsHost.querySelectorAll('.spectrum-col-fill').forEach((bar) => {
          const h = bar.getAttribute('data-target-height') || '0';
          bar.style.height = `${h}%`;
        });
      });
    }

    // 專屬特刊答案海報區
    const posterImg = document.getElementById('resultPosterImg');
    if (posterImg) {
      posterImg.src = persona.posterImg;
      posterImg.alt = `${persona.name}《習慣特刊》答案海報`;
    }
    const posterHeading = document.getElementById('posterCardHeading');
    if (posterHeading) posterHeading.textContent = `《習慣特刊》${persona.name}專刊`;
    const posterDesc = document.getElementById('posterObserveDesc');
    if (posterDesc) posterDesc.textContent = persona.posterObserve;

    // Q11 結尾真心話呼應 MapMo
    const q11Pill = document.getElementById('q11ReflectionPill');
    const q11TextEl = document.getElementById('q11ReflectionText');
    if (q11Pill && q11TextEl) {
      if (evalObj.q11Text) {
        q11Pill.hidden = false;
        q11TextEl.textContent = `不用擔心誰看到時，你最想分享：「${evalObj.q11Text}」`;
      } else {
        q11Pill.hidden = true;
      }
    }

    renderFeaturesList(persona.features);
    renderCardFooterQR();
    renderCrowdStatsUI(persona.id);
  }

  function renderFeaturesList(features) {
    const listEl = document.getElementById('personaFeaturesList');
    if (!listEl) return;
    listEl.innerHTML = '';

    features.primary.forEach((f) => listEl.appendChild(createFeatureCard(f, '主要適合', 'primary')));
    if (features.secondary) {
      features.secondary.forEach((f) => listEl.appendChild(createFeatureCard(f, '進階推薦', 'secondary')));
    }
  }

  function createFeatureCard(feature, badgeText, badgeClass) {
    const div = document.createElement('div');
    div.className = 'feature-match-card';
    div.innerHTML = `
      <div class="feature-badge-row">
        <div class="feature-name">
          <i class="fas fa-${escapeHtml(feature.icon)}" style="color: #D96846; margin-right: 5px;" aria-hidden="true"></i>${escapeHtml(feature.name)}
        </div>
        <span class="feature-fit-pill ${badgeClass}">${escapeHtml(badgeText)}</span>
      </div>
      <p class="feature-desc">${escapeHtml(feature.desc)}</p>
    `;
    return div;
  }

  function isCompactTouchViewport() {
    return (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
      || window.innerWidth <= 768;
  }

  function supportsNativeFileShare(mimeType = 'image/png') {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function'
      || typeof navigator.canShare !== 'function' || typeof File === 'undefined') {
      return false;
    }
    try {
      const dummy = new File([''], 'preview.png', { type: mimeType });
      return navigator.canShare({ files: [dummy] });
    } catch (_) {
      return false;
    }
  }

  function closeMediaPreviewModal() {
    if (mediaPreviewModal && mediaPreviewModal.open) mediaPreviewModal.close();
  }

  function openMediaPreviewModal({ src, alt, title, filename, blob, shareTitle, shareText, mimeType = 'image/png' }) {
    if (!mediaPreviewModal) return;

    if (mediaPreviewState.objectUrl) {
      URL.revokeObjectURL(mediaPreviewState.objectUrl);
      mediaPreviewState.objectUrl = '';
    }
    mediaPreviewState.blob = blob || null;
    mediaPreviewState.filename = filename || 'MapMo-測驗結果.png';
    mediaPreviewState.shareTitle = shareTitle || 'MapMo 社群心理測驗';
    mediaPreviewState.shareText = shareText || '我在 MapMo 測出了我的社群派別，快來測測你是哪一派！';

    let resolvedSrc = src || '';
    if (blob && !resolvedSrc) {
      mediaPreviewState.objectUrl = URL.createObjectURL(blob);
      resolvedSrc = mediaPreviewState.objectUrl;
    }

    const imgEl = document.getElementById('mediaPreviewImg');
    const titleEl = document.getElementById('mediaPreviewTitle');
    const saveEl = document.getElementById('btnSavePreviewMedia');
    const shareBtn = document.getElementById('btnSharePreviewMedia');

    if (imgEl) {
      imgEl.src = resolvedSrc;
      imgEl.alt = alt || title || '測驗結果圖片預覽';
    }
    if (titleEl) {
      titleEl.innerHTML = `<i class="fas fa-image" aria-hidden="true"></i> ${escapeHtml(title || '圖片預覽與儲存')}`;
    }
    if (saveEl) {
      saveEl.href = resolvedSrc;
      saveEl.download = mediaPreviewState.filename;
    }
    if (shareBtn) {
      const canShareFiles = supportsNativeFileShare(mimeType);
      shareBtn.hidden = !canShareFiles;
      // If previewing an image URL without a synchronous Blob yet, prefetch cleanly so transient gesture share stays synchronous
      if (canShareFiles && !blob && resolvedSrc) {
        fetch(resolvedSrc)
          .then((res) => (res.ok ? res.blob() : null))
          .then((fetched) => {
            if (fetched && mediaPreviewModal.open) {
              mediaPreviewState.blob = fetched;
            }
          })
          .catch(() => {});
      }
    }

    if (!mediaPreviewModal.open) mediaPreviewModal.showModal();
    const box = mediaPreviewModal.querySelector('.standee-modal-box');
    if (box) box.scrollTop = 0;
  }

  async function shareActivePreviewMedia() {
    playSound('tap');
    if (!mediaPreviewState.blob || typeof File === 'undefined' || typeof navigator.share !== 'function') {
      showToast('💡 長按圖片即可儲存，或改點「下載高解析原圖」');
      return;
    }
    const mime = mediaPreviewState.blob.type || 'image/png';
    const file = new File([mediaPreviewState.blob], mediaPreviewState.filename, { type: mime });
    try {
      await navigator.share({
        files: [file],
        title: mediaPreviewState.shareTitle,
        text: mediaPreviewState.shareText
      });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      showToast('💡 可直接長按圖片或點擊「下載高解析原圖」');
    }
  }

  function openZinePosterPreview() {
    playSound('tap');
    if (!currentEvaluation || !currentEvaluation.mainPersona) return;
    const p = currentEvaluation.mainPersona;
    openMediaPreviewModal({
      src: p.posterImg,
      alt: `${p.name}《習慣特刊》專刊海報`,
      title: `《習慣特刊》${p.name}海報`,
      filename: `MapMo-習慣特刊-${p.name}.jpg`,
      shareTitle: `MapMo《習慣特刊》${p.name}`,
      shareText: `我是 MapMo「${p.name}」：${p.motto}`,
      mimeType: 'image/jpeg'
    });
  }

  function downloadZinePosterFile() {
    playSound('tap');
    if (!currentEvaluation || !currentEvaluation.mainPersona) return;
    const p = currentEvaluation.mainPersona;
    const a = document.createElement('a');
    a.href = p.posterImg;
    a.download = `MapMo-習慣特刊-${p.name}.jpg`;
    a.click();
    showToast(`📰 已下載《習慣特刊》${p.name}原圖海報！`);
  }

  // ─────────────────────────────────────────────────────────
  // 8. 結果頁 2X Canvas 分享圖匯出（含手札底紋 + 人物插畫 + 光譜相似度長條 + QR Code）
  // ─────────────────────────────────────────────────────────
  function exportResultCardImage() {
    playSound('tap');
    if (!currentEvaluation || !currentEvaluation.mainPersona) return;
    showToast('🎨 正在合成高清結果檔案圖...');

    const ev = currentEvaluation;
    const p = ev.mainPersona;

    const canvas = document.createElement('canvas');
    const W = 1080;
    const H = 1440;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 牛皮手札外框背景
    ctx.fillStyle = '#D9C9A8';
    ctx.fillRect(0, 0, W, H);

    // 內頁卡片
    const cardX = 56;
    const cardY = 56;
    const cardW = W - 112;
    const cardH = H - 112;
    drawRoundRect(ctx, cardX + 10, cardY + 12, cardW, cardH, 32, '#1E1B16');
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 32, '#FFFDF8', '#1E1B16', 4);

    // 頂部特刊 Header
    ctx.fillStyle = '#4A4035';
    ctx.font = '900 22px "Outfit", "Noto Sans TC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MAPMO 習慣特刊 · 測驗檔案', cardX + 44, cardY + 60);

    ctx.textAlign = 'right';
    ctx.font = '800 20px "Outfit", sans-serif';
    ctx.fillStyle = '#786E60';
    ctx.fillText(`NO. ${currentRunSerial || p.id.toUpperCase()}`, cardX + cardW - 44, cardY + 60);

    ctx.strokeStyle = 'rgba(30, 27, 22, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(cardX + 44, cardY + 86);
    ctx.lineTo(cardX + cardW - 44, cardY + 86);
    ctx.stroke();
    ctx.setLineDash([]);

    // 派別稱號 + 徽章
    drawRoundRect(ctx, cardX + 44, cardY + 112, 340, 42, 21, '#FFE45E', '#1E1B16', 2.5);
    ctx.fillStyle = '#1E1B16';
    ctx.textAlign = 'center';
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillText(p.enTitle, cardX + 44 + 170, cardY + 140);

    ctx.textAlign = 'left';
    ctx.fillStyle = p.textColor;
    ctx.font = '900 58px "Noto Sans TC", sans-serif';
    ctx.fillText(p.name, cardX + 44, cardY + 225);

    ctx.fillStyle = '#4A4035';
    ctx.font = '800 24px "Noto Sans TC", sans-serif';
    ctx.fillText(p.motto, cardX + 44, cardY + 272);

    // 相似度徽章
    drawRoundRect(ctx, cardX + 44, cardY + 296, 360, 44, 12, '#EFE6D4', '#1E1B16', 2);
    ctx.fillStyle = '#1E1B16';
    ctx.font = '800 20px "Noto Sans TC", sans-serif';
    ctx.fillText(`吻合度最高 ${ev.mainPct}%（${ev.mainMatchCount}/10 題）`, cardX + 64, cardY + 325);

    // 派別描述區塊
    const descY = cardY + 382;
    drawRoundRect(ctx, cardX + 44, descY, cardW - 88, ev.showSecond ? 178 : 120, 20, '#FAF5EB', '#E3D9C6', 2);
    ctx.fillStyle = '#1E1B16';
    ctx.font = '600 22px "Noto Sans TC", sans-serif';
    wrapText(ctx, p.description, cardX + 70, descY + 46, cardW - 140, 34);

    if (ev.showSecond && ev.secondPersona) {
      drawRoundRect(ctx, cardX + 70, descY + 114, cardW - 140, 46, 12, '#FCEEE7', '#F2C9B6', 2);
      ctx.fillStyle = '#B94F30';
      ctx.font = '800 19px "Noto Sans TC", sans-serif';
      ctx.fillText(`✨ 你也有幾分「${ev.secondPersona.name}」的影子（相似度 ${ev.secondPct}%）`, cardX + 90, descY + 144);
    }

    // 五大派別直立長條圖（光譜順序）
    const chartY = descY + (ev.showSecond ? 210 : 154);
    ctx.fillStyle = '#1E1B16';
    ctx.font = '900 24px "Noto Sans TC", sans-serif';
    ctx.fillText('五大派別相似度光譜', cardX + 44, chartY);

    const chartInnerW = cardW - 88;
    const colGap = 18;
    const colW = (chartInnerW - colGap * 4) / 5;
    const barMaxH = 210;
    const barBaseY = chartY + 266;

    ev.similarities.forEach((item, idx) => {
      const sp = PERSONAS[item.id];
      const isWinner = item.id === p.id;
      const cx = cardX + 44 + idx * (colW + colGap);

      ctx.textAlign = 'center';
      ctx.font = isWinner ? '900 22px "Outfit", sans-serif' : '700 20px "Outfit", sans-serif';
      ctx.fillStyle = isWinner ? p.barColor : '#786E60';
      ctx.fillText(`${item.pct}%`, cx + colW / 2, chartY + 42);

      drawRoundRect(ctx, cx, chartY + 54, colW, barMaxH, 14, '#F2EDE3');
      const fillH = Math.max(8, Math.round((item.pct / 100) * barMaxH));
      if (item.pct > 0) {
        drawRoundRect(ctx, cx, barBaseY - fillH, colW, fillH, 14, isWinner ? p.barColor : '#CFC6B6');
      }

      ctx.font = isWinner ? '900 19px "Noto Sans TC", sans-serif' : '700 18px "Noto Sans TC", sans-serif';
      ctx.fillStyle = isWinner ? p.textColor : '#786E60';
      ctx.fillText(sp.shortName, cx + colW / 2, barBaseY + 32);
    });

    // Q11 真心話貼紙
    const q11Y = barBaseY + 70;
    if (ev.q11Text) {
      drawRoundRect(ctx, cardX + 44, q11Y, cardW - 88, 60, 14, '#FFE45E', '#1E1B16', 2);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#1E1B16';
      ctx.font = '800 19px "Noto Sans TC", sans-serif';
      ctx.fillText(`不用擔心誰看到時，我最想分享：「${ev.q11Text}」`, cardX + 66, q11Y + 37);
    }

    // 底部掃碼區
    const footY = cardY + cardH - 134;
    ctx.strokeStyle = 'rgba(30, 27, 22, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(cardX + 44, footY);
    ctx.lineTo(cardX + cardW - 44, footY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E1B16';
    ctx.font = '900 22px "Noto Sans TC", sans-serif';
    ctx.fillText('在 MapMo，不用在乎誰先看見', cardX + 44, footY + 46);
    ctx.font = '700 16px "Outfit", "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#786E60';
    ctx.fillText(`掃描右方 QR Code 測測你的社群派別 · ${getQuizURL()}`, cardX + 44, footY + 80);

    const qrCanvas = createBwQrCanvas(110, getQuizURL());
    ctx.drawImage(qrCanvas, cardX + cardW - 148, footY + 12, 104, 104);

    // 嘗試疊入透明人物插畫於右上角（若因跨域限制載入失敗則優雅略過）
    const finalizeBlob = () => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const filename = `MapMo社群派別-${p.name}.png`;
          if (isCompactTouchViewport()) {
            openMediaPreviewModal({
              alt: `MapMo 心理測驗結果檔案：${p.name}`,
              title: `${p.name} · 測驗結果檔案圖`,
              filename,
              blob,
              shareTitle: `我是「${p.name}」｜MapMo 社群心理測驗`,
              shareText: `我在 MapMo 測出與「${p.name}」吻合度 ${ev.mainPct}%！測測你是哪一種社群派？ ${getQuizURL()}`,
              mimeType: 'image/png'
            });
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.download = filename;
          a.href = url;
          a.click();
          URL.revokeObjectURL(url);
          showToast('🎉 測驗結果檔案圖已匯出！');
        }, 'image/png');
      } catch (_) {
        showToast('⚠️ 請透過本地伺服器或線上網址匯出圖片');
      }
    };

    const charImg = document.getElementById('resultCharImg');
    if (charImg && charImg.complete && charImg.naturalWidth > 0) {
      try {
        const cw = 330;
        const ch = Math.round((charImg.naturalHeight / charImg.naturalWidth) * cw);
        ctx.drawImage(charImg, cardX + cardW - cw - 36, cardY + 115, cw, ch);
      } catch (_) {}
    }
    finalizeBlob();
  }

  function drawRoundRect(ctx, x, y, width, height, radius, fillColor, strokeColor, lineWidth) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeColor && lineWidth) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
    ctx.restore();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = String(text || '').split('');
    let line = '';
    let currentY = y;
    for (let n = 0; n < chars.length; n++) {
      const testLine = line + chars[n];
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = chars[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  // ─────────────────────────────────────────────────────────
  // 9. 3D 情緒樹 ⇄ 像素花園 QR Code 生成引擎
  // ─────────────────────────────────────────────────────────
  const TREE_QR_PALETTES = {
    pink: { foliage: ['#CE5B7A', '#DE7290', '#EC88A4', '#F69EB7', '#FFB6CA'], qrTiles: ['#C45271', '#D66584', '#E57997', '#B24361'] },
    purple: { foliage: ['#7653DB', '#8A69EB', '#9E80F5', '#B297FC', '#C7B0FF'], qrTiles: ['#6D49D4', '#8160E6', '#9577F2', '#5A38BD'] },
    red: { foliage: ['#C4352C', '#D94940', '#EC6158', '#FA786F', '#FF938A'], qrTiles: ['#B5281F', '#CD3A31', '#E04D44', '#9C1E16'] },
    yellow: { foliage: ['#C9810E', '#DC961D', '#EEAA2F', '#FABF46', '#FFD362'], qrTiles: ['#BD7708', '#D18912', '#E39B20', '#A66504'] },
    blue: { foliage: ['#2C74C9', '#428BDE', '#5CA2F0', '#77B7FA', '#94CCFF'], qrTiles: ['#2669BA', '#397FD1', '#4E94E3', '#1E579E'] },
    grey: { foliage: ['#5C6E80', '#708394', '#8698A8', '#9CAEC0', '#B3C4D4'], qrTiles: ['#526373', '#66788A', '#7A8C9E', '#42515E'] }
  };

  const SEASON_THEMES = {
    spring: { grass: ['#669E34', '#7AB542', '#8EC754', '#A2D468'], earth: ['#85684A', '#6E5338'], slabGrassLeft: '#8EC754', slabGrassRight: '#72A83C', grassScale: 0.92, accentType: 'flowers', accentColors: ['#FF6B8B', '#FFD166', '#FFFFFF', '#C98BFF'] },
    summer: { grass: ['#1E5918', '#2A6E22', '#38872E', '#4DA13B'], earth: ['#634B32', '#4F3A25'], slabGrassLeft: '#38872E', slabGrassRight: '#24631C', grassScale: 1.75, accentType: 'fireflies', accentColors: ['#E6FF66', '#B8F553', '#FFF599', '#8AE65C'] },
    autumn: { grass: ['#9E5B1B', '#BA7322', '#D48E2B', '#E6A938'], earth: ['#754B29', '#5C381C'], slabGrassLeft: '#D48E2B', slabGrassRight: '#AD681E', grassScale: 1.05, accentType: 'maple', accentColors: ['#C93B2B', '#E05A2B', '#EB8A28', '#F2B438'] }
  };

  const TREE_BOUGHS = [
    { u: -0.04, v: -0.04, h: 266, rx: 0.30, ry: 0.30, rh: 28, drawBranch: true, branchStartH: 112, branchW: 4.8, branchEndFrac: 0.50 },
    { u: -0.24, v: 0.02, h: 234, rx: 0.34, ry: 0.32, rh: 28, drawBranch: true, branchStartH: 104, branchW: 6.4, branchEndFrac: 0.72 },
    { u: 0.04, v: -0.26, h: 238, rx: 0.34, ry: 0.32, rh: 28, drawBranch: true, branchStartH: 106, branchW: 6.4, branchEndFrac: 0.72 },
    { u: -0.36, v: -0.34, h: 204, rx: 0.42, ry: 0.40, rh: 32, drawBranch: false },
    { u: -0.06, v: -0.06, h: 206, rx: 0.38, ry: 0.38, rh: 30, drawBranch: false },
    { u: -0.50, v: 0.14, h: 186, rx: 0.38, ry: 0.35, rh: 30, drawBranch: true, branchStartH: 88, branchW: 7.4, branchEndFrac: 0.78 },
    { u: 0.16, v: -0.50, h: 192, rx: 0.38, ry: 0.35, rh: 30, drawBranch: true, branchStartH: 92, branchW: 7.4, branchEndFrac: 0.78 },
    { u: -0.60, v: 0.36, h: 154, rx: 0.34, ry: 0.32, rh: 26, drawBranch: true, branchStartH: 84, branchW: 6.2, branchEndFrac: 0.76 },
    { u: 0.36, v: -0.60, h: 158, rx: 0.34, ry: 0.32, rh: 26, drawBranch: true, branchStartH: 86, branchW: 6.2, branchEndFrac: 0.76 },
    { u: -0.24, v: 0.26, h: 176, rx: 0.32, ry: 0.30, rh: 26, drawBranch: true, branchStartH: 96, branchW: 5.8, branchEndFrac: 0.66 },
    { u: 0.28, v: -0.22, h: 182, rx: 0.32, ry: 0.30, rh: 26, drawBranch: true, branchStartH: 98, branchW: 5.8, branchEndFrac: 0.66 },
    { u: -0.14, v: 0.40, h: 150, rx: 0.28, ry: 0.26, rh: 22, drawBranch: false },
    { u: 0.38, v: -0.02, h: 158, rx: 0.28, ry: 0.26, rh: 22, drawBranch: false }
  ];

  const TREE_ROOTS = [
    { angle: 0.38, len: 0.17, startH: 20, width: 9.8 },
    { angle: 1.55, len: 0.16, startH: 19, width: 9.2 },
    { angle: 2.75, len: 0.17, startH: 20, width: 8.8 },
    { angle: 4.05, len: 0.15, startH: 19, width: 8.8 },
    { angle: 5.25, len: 0.16, startH: 20, width: 9.2 }
  ];

  const treeQrState = {
    url: FIXED_QUIZ_GITHUB_URL,
    mode: 'tree',
    morphTime: 0,
    morphP: 0,
    targetP: 0,
    season: 'spring',
    colorKey: 'pink',
    qrModel: null,
    leafParticles: [],
    grassBlades: [],
    seasonAccents: [],
    floatingPetals: [],
    animFrameId: null,
    lastTime: 0
  };

  function getQuizURL() {
    const inputEl = document.getElementById('treeQrUrlInput');
    const customVal = inputEl && inputEl.value ? inputEl.value.trim() : '';
    return customVal || FIXED_QUIZ_GITHUB_URL;
  }

  function hash2D(a, b, seed = 0) {
    let n = Math.imul(a + 37, 374761393) + Math.imul(b + 73, 668265263) + Math.imul(seed + 19, 1442695041);
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  function isFinderModule(r, c, count) {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= count - 7) return true;
    if (r >= count - 7 && c < 7) return true;
    if (r < 2 || r >= count - 2 || c < 2 || c >= count - 2) return true;
    return false;
  }

  function rebuildQrAndTreeGeometry(urlText) {
    if (typeof QRCode === 'undefined' || !QRCode.QRCodeModel) return;
    const text = (urlText || FIXED_QUIZ_GITHUB_URL).trim();
    const model = new QRCode.QRCodeModel(-1, QRCode.CorrectLevel.H);
    model.addData(text);
    model.make();
    treeQrState.qrModel = model;
    if (treeQrState.grassBlades.length === 0) generateProceduralTreeGeometry();
    rebuildLeafParticlesFromQrModel(model);
  }

  function rebuildLeafParticlesFromQrModel(model) {
    const count = model.getModuleCount();
    const subCount = count * 2;
    const particles = [];
    let idx = 0;

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (isFinderModule(r, c, count) || !model.isDark(r, c)) continue;
        for (let sr = 0; sr < 2; sr++) {
          for (let sc = 0; sc < 2; sc++) {
            idx++;
            const gr = r * 2 + sr;
            const gc = c * 2 + sc;
            const u0 = (gc / subCount) * 2 - 1;
            const v0 = (gr / subCount) * 2 - 1;
            const u1 = ((gc + 1.04) / subCount) * 2 - 1;
            const v1 = ((gr + 1.04) / subCount) * 2 - 1;
            const qrU = (u0 + u1) * 0.5;
            const qrV = (v0 + v1) * 0.5;

            let boughIdx = 0;
            const radial = Math.hypot(qrU, qrV);
            if (radial < 0.24) {
              boughIdx = idx % 3 === 0 ? 0 : (idx % 3 === 1 ? 1 : 2);
            } else {
              let bestScore = Infinity;
              for (let bi = 0; bi < TREE_BOUGHS.length; bi++) {
                const b = TREE_BOUGHS[bi];
                const d = Math.hypot(qrU - b.u, qrV - b.v) + hash2D(gr, gc, 11 + bi) * 0.25;
                if (d < bestScore) { bestScore = d; boughIdx = bi; }
              }
            }
            const bough = TREE_BOUGHS[boughIdx];
            const theta = hash2D(gr, gc, 17) * Math.PI * 2;
            const phi = Math.acos(2 * hash2D(gr, gc, 23) - 1);
            const shellR = 0.35 + Math.pow(hash2D(gr, gc, 29), 0.45) * 0.65;
            const dx = Math.sin(phi) * Math.cos(theta) * shellR;
            const dy = Math.sin(phi) * Math.sin(theta) * shellR;
            const dz = Math.cos(phi) * shellR;

            const treeU = bough.u + dx * bough.rx;
            const treeV = bough.v + dy * bough.ry;
            let treeH = bough.h + dz * bough.rh;
            if (Math.hypot(treeU, treeV) < 0.20 && treeH < 152) treeH = 156 + hash2D(gr, gc, 37) * 32;

            const localLight = dz * 0.56 - (dx + dy) * 0.28 + (treeH - 135) / 145 * 0.40 + (hash2D(gr, gc, 41) - 0.5) * 0.24;
            const shadeIdx = Math.max(0, Math.min(4, Math.floor((localLight + 0.52) * 3.9)));
            const leafW = 5.4 + hash2D(gr, gc, 53) * 3.1;
            const leafH = 4.0 + hash2D(gr, gc, 61) * 2.2;
            const outerFirst = Math.max(0, 1 - Math.min(1, radial / 1.05));
            const lowFirst = Math.max(0, Math.min(1, (treeH - 115) / 155));
            const waveDelay = outerFirst * 0.45 + lowFirst * 0.35 + hash2D(gr, gc, 71) * 0.20;
            const swirlSign = hash2D(gr, gc, 83) > 0.5 ? 1 : -1;
            const viewDepth = treeU + treeV;
            const isBehindTrunk = (viewDepth < -0.04 && treeH < 212);

            particles.push({
              r, c, sr, sc, gr, gc, u0, v0, u1, v1, qrU, qrV,
              treeU, treeV, treeH, viewDepth, isBehindTrunk,
              shadeIdx, leafW, leafH, waveDelay, swirlSign, seed: idx
            });
          }
        }
      }
    }
    particles.sort((a, b) => (a.viewDepth * 140 + a.treeH * 0.22) - (b.viewDepth * 140 + b.treeH * 0.22));
    treeQrState.leafParticles = particles;
  }

  function generateProceduralTreeGeometry() {
    const blades = [];
    for (let i = 0; i < 280; i++) {
      let u = 0, v = 0;
      const mode = i % 7;
      if (mode === 0) { u = -0.96 + hash2D(i, 11, 77) * 0.46; v = -0.96 + hash2D(i, 22, 88) * 0.46; }
      else if (mode === 1) { u = 0.50 + hash2D(i, 11, 77) * 0.46; v = -0.96 + hash2D(i, 22, 88) * 0.46; }
      else if (mode === 2) { u = -0.96 + hash2D(i, 11, 77) * 0.46; v = 0.50 + hash2D(i, 22, 88) * 0.46; }
      else if (mode === 3) { u = -0.94 + hash2D(i, 11, 77) * 1.88; v = -0.96 + hash2D(i, 22, 88) * 0.18; }
      else if (mode === 4) { u = -0.94 + hash2D(i, 11, 77) * 1.88; v = 0.78 + hash2D(i, 22, 88) * 0.18; }
      else if (mode === 5) { u = -0.96 + hash2D(i, 11, 77) * 0.18; v = -0.94 + hash2D(i, 22, 88) * 1.88; }
      else { u = 0.78 + hash2D(i, 11, 77) * 0.18; v = -0.94 + hash2D(i, 22, 88) * 1.88; }
      blades.push({
        u, v,
        height: 11 + hash2D(i, 33, 99) * 16,
        lean: (hash2D(i, 44, 11) - 0.5) * 11,
        shade: Math.floor(hash2D(i, 55, 22) * 4),
        phase: hash2D(i, 66, 33) * Math.PI * 2
      });
    }
    treeQrState.grassBlades = blades;

    const accents = [];
    for (let i = 0; i < 48; i++) {
      const targetBlade = blades[i * 5 % blades.length];
      accents.push({
        u: targetBlade.u + (hash2D(i, 71, 5) - 0.5) * 0.08,
        v: targetBlade.v + (hash2D(i, 72, 6) - 0.5) * 0.08,
        colorIdx: i % 4,
        size: 4.5 + hash2D(i, 73, 7) * 4.0,
        phase: hash2D(i, 74, 8) * Math.PI * 2,
        floatH: 6 + hash2D(i, 75, 9) * 28
      });
    }
    treeQrState.seasonAccents = accents;

    const floating = [];
    for (let i = 0; i < 24; i++) {
      floating.push({
        u: (hash2D(i, 81, 9) - 0.5) * 1.35,
        v: (hash2D(i, 82, 9) - 0.5) * 1.35,
        h: 18 + hash2D(i, 83, 9) * 195,
        speed: 16 + hash2D(i, 84, 9) * 16,
        phase: hash2D(i, 85, 9) * Math.PI * 2,
        shade: Math.floor(hash2D(i, 86, 9) * 4) + 1
      });
    }
    treeQrState.floatingPetals = floating;
  }

  function lerpHexColor(hexA, hexB, t) {
    if (t <= 0.001) return hexA;
    if (t >= 0.999) return hexB;
    const toRgb = (c) => {
      if (c.charCodeAt(0) === 35) {
        const n = parseInt(c.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      }
      const m = c.match(/\d+/g);
      return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
    };
    const [r1, g1, b1] = toRgb(hexA);
    const [r2, g2, b2] = toRgb(hexB);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  }

  function getModuleSubPixelColor(r, c, sr, sc, count, isDark, palette, seasonTheme) {
    const h = hash2D(r * 2 + sr, c * 2 + sc, 101);
    if (!isDark) return h > 0.55 ? '#EFECE4' : '#E7E3D9';
    if (isFinderModule(r, c, count)) {
      const isEdge = (r === 0 || r === 6 || c === 0 || c === 6 || r === count - 7 || r === count - 1 || c === count - 7 || c === count - 1);
      if (isEdge && h < 0.28) return seasonTheme.earth[h < 0.14 ? 0 : 1];
      return seasonTheme.grass[Math.min(3, Math.floor(h * 4))];
    }
    return palette.qrTiles[Math.min(3, Math.floor(h * 4))];
  }

  function drawTaperedLimb3D(ctx, p0, p1, p2, wStart, wEnd, fillColor, highlightColor) {
    const steps = 6;
    const leftPts = [];
    const rightPts = [];
    const hiPts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const it = 1 - t;
      const x = it * it * p0.x + 2 * it * t * p1.x + t * t * p2.x;
      const y = it * it * p0.y + 2 * it * t * p1.y + t * t * p2.y;
      const tx = 2 * it * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
      const ty = 2 * it * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
      const len = Math.hypot(tx, ty) || 1;
      const nx = -ty / len;
      const ny = tx / len;
      const halfW = (wStart * (1 - t) + wEnd * t) * 0.5;
      leftPts.push([x + nx * halfW, y + ny * halfW]);
      rightPts.push([x - nx * halfW, y - ny * halfW]);
      if (highlightColor) hiPts.push([x + nx * halfW * 0.35 - 0.8, y + ny * halfW * 0.35 - 1.0]);
    }
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(leftPts[0][0], leftPts[0][1]);
    for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i][0], leftPts[i][1]);
    for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i][0], rightPts[i][1]);
    ctx.closePath();
    ctx.fill();
    if (highlightColor && hiPts.length > 1) {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = Math.max(1.2, wStart * 0.22);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hiPts[0][0], hiPts[0][1]);
      for (let i = 1; i < hiPts.length; i++) ctx.lineTo(hiPts[i][0], hiPts[i][1]);
      ctx.stroke();
    }
  }

  function drawArtisanalTrunkAndBranches3D(ctx, project, angle, cosA, sinA, treeScale, seasonTheme) {
    const trunkBase = project(0, 0, 0);
    const trunkLower = project(0, 0, 36 * treeScale);
    const trunkMid = project(0, 0, 76 * treeScale);
    const trunkTop = project(0, 0, 128 * treeScale);

    ctx.fillStyle = 'rgba(46, 28, 18, 0.16)';
    ctx.beginPath();
    ctx.ellipse(trunkBase.x, trunkBase.y + 3 * treeScale, 34 * treeScale, 15 * treeScale, 0, 0, Math.PI * 2);
    ctx.fill();

    const sortedRoots = TREE_ROOTS.map((rt) => {
      const ru = Math.cos(rt.angle) * rt.len;
      const rv = Math.sin(rt.angle) * rt.len;
      return { ...rt, ru, rv, viewY: ru * sinA + rv * cosA };
    }).sort((a, b) => a.viewY - b.viewY);

    const drawRoot = (rt) => {
      const pStart = project(rt.ru * 0.14 * treeScale, rt.rv * 0.14 * treeScale, rt.startH * treeScale);
      const pCtrl = project(rt.ru * 0.55 * treeScale, rt.rv * 0.55 * treeScale, (rt.startH * 0.35) * treeScale);
      const pEnd = project(rt.ru * treeScale, rt.rv * treeScale, 0.5 * treeScale);
      drawTaperedLimb3D(ctx, pStart, pCtrl, pEnd, rt.width * treeScale, 2.0 * treeScale, '#4A2C1B', '#784D33');
    };

    sortedRoots.filter(r => r.viewY < 0).forEach(drawRoot);

    const branchQueue = [];
    TREE_BOUGHS.forEach((b) => {
      if (!b.drawBranch) return;
      const frac = b.branchEndFrac || 0.68;
      const p0 = project(0, 0, b.branchStartH * treeScale);
      const eu = b.u * frac;
      const ev = b.v * frac;
      const p1 = project(eu * 0.45 * treeScale, ev * 0.45 * treeScale, (b.branchStartH + (b.h - 20 - b.branchStartH) * 0.50) * treeScale);
      const p2 = project(eu * treeScale, ev * treeScale, (b.h - 18) * treeScale);
      const viewY = eu * sinA + ev * cosA;
      branchQueue.push({ p0, p1, p2, wStart: b.branchW * treeScale, wEnd: 2.3 * treeScale, viewY });
    });
    branchQueue.sort((a, b) => a.viewY - b.viewY);
    branchQueue.filter(br => br.viewY < 0).forEach(br => drawTaperedLimb3D(ctx, br.p0, br.p1, br.p2, br.wStart, br.wEnd, '#452919', '#6D442C'));

    ctx.fillStyle = '#3E2315';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 18 * treeScale, trunkBase.y + 2 * treeScale);
    ctx.quadraticCurveTo(trunkLower.x - 12 * treeScale, trunkLower.y, trunkMid.x - 9 * treeScale, trunkMid.y);
    ctx.lineTo(trunkTop.x - 6.2 * treeScale, trunkTop.y);
    ctx.lineTo(trunkTop.x + 7.2 * treeScale, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 10 * treeScale, trunkMid.y, trunkBase.x + 19 * treeScale, trunkBase.y + 2 * treeScale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#633C26';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 13 * treeScale, trunkBase.y + 1.5 * treeScale);
    ctx.quadraticCurveTo(trunkMid.x - 6.2 * treeScale, trunkMid.y, trunkTop.x - 4.2 * treeScale, trunkTop.y);
    ctx.lineTo(trunkTop.x + 5.8 * treeScale, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 7.8 * treeScale, trunkMid.y, trunkBase.x + 14 * treeScale, trunkBase.y + 1.5 * treeScale);
    ctx.closePath();
    ctx.fill();

    sortedRoots.filter(r => r.viewY >= 0).forEach(drawRoot);
    branchQueue.filter(br => br.viewY >= 0).forEach(br => drawTaperedLimb3D(ctx, br.p0, br.p1, br.p2, br.wStart, br.wEnd, '#4D2D1B', '#7C4F35'));
  }

  function renderTreeQrStudioFrame(timestamp) {
    const canvas = document.getElementById('treeQrInteractiveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const dt = treeQrState.lastTime ? Math.min(0.05, (timestamp - treeQrState.lastTime) / 1000) : 0.016;
    treeQrState.lastTime = timestamp;

    const target = treeQrState.targetP;
    if (treeQrState.morphTime !== target) {
      const step = target > treeQrState.morphTime ? dt / 1.30 : -dt / 1.15;
      treeQrState.morphTime = target > treeQrState.morphTime
        ? Math.min(target, treeQrState.morphTime + step)
        : Math.max(target, treeQrState.morphTime + step);
    }
    const u = treeQrState.morphTime;
    treeQrState.morphP = u;

    const camP = smoothstep(0.46, 0.98, u);
    const trunkVis = 1 - smoothstep(0.38, 0.64, u);
    const palette = TREE_QR_PALETTES[treeQrState.colorKey] || TREE_QR_PALETTES.pink;
    const seasonTheme = SEASON_THEMES[treeQrState.season] || SEASON_THEMES.spring;

    ctx.fillStyle = '#F6F2EA';
    ctx.fillRect(0, 0, W, H);
    if (!treeQrState.qrModel) {
      rebuildQrAndTreeGeometry(treeQrState.url);
      if (!treeQrState.qrModel) return;
    }

    const count = treeQrState.qrModel.getModuleCount();
    const angle = (1 - camP) * (Math.PI / 4);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const tiltY = 0.54 + 0.46 * camP;
    const radius = 154 + 48 * camP;
    const centerX = W / 2;
    const centerY = 368 - 108 * camP;

    function project(pu, pv, ph = 0) {
      return {
        x: centerX + (pu * cosA - pv * sinA) * radius,
        y: centerY + (pu * sinA + pv * cosA) * radius * tiltY - ph
      };
    }

    if (camP < 0.99) {
      const slabDepth = 16 * (1 - camP);
      const drawSlabSide = (uA, vA, uB, vB, stoneColor, grassColor) => {
        const pA = project(uA, vA, 0);
        const pB = project(uB, vB, 0);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pB.x, pB.y + slabDepth);
        ctx.lineTo(pA.x, pA.y + slabDepth);
        ctx.closePath();
        ctx.fillStyle = stoneColor;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pB.x, pB.y + slabDepth * 0.42);
        ctx.lineTo(pA.x, pA.y + slabDepth * 0.42);
        ctx.closePath();
        ctx.fillStyle = grassColor;
        ctx.fill();
      };
      drawSlabSide(-1, 1, 1, 1, '#B8B4AA', seasonTheme.slabGrassLeft);
      drawSlabSide(1, 1, 1, -1, '#99958B', seasonTheme.slabGrassRight);
    }

    const subCount = count * 2;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        const isDark = treeQrState.qrModel.isDark(r, c);
        const isFinder = isFinderModule(r, c, count);
        for (let sr = 0; sr < 2; sr++) {
          for (let sc = 0; sc < 2; sc++) {
            const gr = r * 2 + sr;
            const gc = c * 2 + sc;
            const u0 = (gc / subCount) * 2 - 1;
            const v0 = (gr / subCount) * 2 - 1;
            const u1 = ((gc + 1.04) / subCount) * 2 - 1;
            const v1 = ((gr + 1.04) / subCount) * 2 - 1;
            const qrColor = getModuleSubPixelColor(r, c, sr, sc, count, isDark, palette, seasonTheme);
            let tileColor = qrColor;
            if (!isFinder && isDark) {
              const restStone = hash2D(gr, gc, 55) > 0.5 ? '#D8D4C9' : '#CECAC0';
              const socketHint = lerpHexColor(restStone, '#C2BCB0', smoothstep(0.02, 0.18, u) * (1 - smoothstep(0.42, 0.56, u)));
              tileColor = lerpHexColor(socketHint, qrColor, smoothstep(0.24, 0.50, u));
            }
            const pt0 = project(u0, v0, 0);
            const pt1 = project(u1, v0, 0);
            const pt2 = project(u1, v1, 0);
            const pt3 = project(u0, v1, 0);
            ctx.fillStyle = tileColor;
            ctx.beginPath();
            ctx.moveTo(pt0.x, pt0.y);
            ctx.lineTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.lineTo(pt3.x, pt3.y);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    const floraVis = 1 - smoothstep(0.45, 0.82, u);
    if (floraVis > 0.01) {
      ctx.save();
      ctx.globalAlpha = floraVis;
      const breeze = Math.sin(timestamp * 0.0028) * 3.5;
      const gScale = seasonTheme.grassScale || 1.0;
      treeQrState.grassBlades.forEach((gb) => {
        const base = project(gb.u, gb.v, 0);
        const h = gb.height * gScale * floraVis;
        const sway = Math.sin(timestamp * 0.0032 + gb.phase) * 2.5 + breeze * 0.55;
        ctx.strokeStyle = seasonTheme.grass[gb.shade];
        ctx.lineWidth = treeQrState.season === 'summer' ? 2.4 : 1.75;
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.quadraticCurveTo(base.x + (gb.lean + sway) * 0.5, base.y - h * 0.55, base.x + gb.lean + sway, base.y - h);
        ctx.stroke();
      });
      treeQrState.seasonAccents.forEach((acc) => {
        const color = seasonTheme.accentColors[acc.colorIdx];
        if (seasonTheme.accentType === 'flowers') {
          const pt = project(acc.u, acc.v, 3 * floraVis);
          const s = acc.size * 0.9 * floraVis;
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - s * 0.7, pt.y - s * 0.25, s * 1.4, s * 0.5);
          ctx.fillRect(pt.x - s * 0.25, pt.y - s * 0.7, s * 0.5, s * 1.4);
        } else if (seasonTheme.accentType === 'fireflies') {
          const bob = Math.sin(timestamp * 0.004 + acc.phase) * 8;
          const pt = project(acc.u, acc.v, (acc.floatH + bob) * floraVis);
          const pulse = 0.45 + 0.55 * Math.sin(timestamp * 0.006 + acc.phase * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = pulse * floraVis;
          ctx.fillRect(pt.x - acc.size / 2, pt.y - acc.size / 2, acc.size, acc.size);
          ctx.globalAlpha = floraVis;
        } else if (seasonTheme.accentType === 'maple') {
          const pt = project(acc.u * 0.85, acc.v * 0.85, 1.5 * floraVis);
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - acc.size * 0.6, pt.y - acc.size * 0.35, acc.size * 1.2, acc.size * 0.7);
        }
      });
      ctx.restore();
    }

    const orderedLeaves = treeQrState.leafParticles;
    const windX = Math.sin(timestamp * 0.0022) * 2.0;

    const drawLeafOrTile = (lp) => {
      const startU = lp.waveDelay * 0.22;
      const localP = Math.max(0, Math.min(1, (u - startU) / 0.26));
      const easeP = localP < 0.5 ? 2 * localP * localP : 1 - Math.pow(-2 * localP + 2, 2) / 2;
      const swirl = Math.sin(localP * Math.PI) * 0.11 * lp.swirlSign;
      const curU = lp.treeU * (1 - easeP) + lp.qrU * easeP + swirl;
      const curV = lp.treeV * (1 - easeP) + lp.qrV * easeP - swirl * 0.7;
      const curH = lp.treeH * Math.pow(1 - easeP, 1.32);
      const pos = project(curU, curV, curH);
      const flutter = (1 - easeP) * (Math.sin(timestamp * 0.0032 + lp.seed) * 1.4 + windX * (lp.treeH / 200));
      const leafColor = palette.foliage[lp.shadeIdx];

      if (easeP > 0.74) {
        const embedT = (easeP - 0.74) / 0.26;
        const pt0 = project(lp.u0, lp.v0, 0);
        const pt1 = project(lp.u1, lp.v0, 0);
        const pt2 = project(lp.u1, lp.v1, 0);
        const pt3 = project(lp.u0, lp.v1, 0);
        const hw = lp.leafW * 0.5;
        const hh = lp.leafH * 0.5;
        const cx = pos.x + flutter;
        const cy = pos.y;
        const targetQr = getModuleSubPixelColor(lp.r, lp.c, lp.sr, lp.sc, count, true, palette, seasonTheme);
        ctx.fillStyle = embedT > 0.05 ? lerpHexColor(leafColor, targetQr, embedT) : leafColor;
        ctx.beginPath();
        ctx.moveTo((cx - hw) * (1 - embedT) + pt0.x * embedT, (cy - hh) * (1 - embedT) + pt0.y * embedT);
        ctx.lineTo((cx + hw) * (1 - embedT) + pt1.x * embedT, (cy - hh) * (1 - embedT) + pt1.y * embedT);
        ctx.lineTo((cx + hw) * (1 - embedT) + pt2.x * embedT, (cy + hh) * (1 - embedT) + pt2.y * embedT);
        ctx.lineTo((cx - hw) * (1 - embedT) + pt3.x * embedT, (cy + hh) * (1 - embedT) + pt3.y * embedT);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = leafColor;
        ctx.fillRect(pos.x + flutter - lp.leafW / 2, pos.y - lp.leafH / 2, lp.leafW, lp.leafH);
      }
    };

    if (u < 0.55) {
      orderedLeaves.forEach(lp => { if (lp.isBehindTrunk) drawLeafOrTile(lp); });
      if (trunkVis > 0.01) {
        ctx.save();
        ctx.globalAlpha = trunkVis;
        drawArtisanalTrunkAndBranches3D(ctx, project, angle, cosA, sinA, Math.max(0.25, trunkVis), seasonTheme);
        ctx.restore();
      }
      orderedLeaves.forEach(lp => { if (!lp.isBehindTrunk) drawLeafOrTile(lp); });
    } else if (trunkVis > 0.01) {
      ctx.save();
      ctx.globalAlpha = trunkVis;
      drawArtisanalTrunkAndBranches3D(ctx, project, angle, cosA, sinA, Math.max(0.25, trunkVis), seasonTheme);
      ctx.restore();
    }

    if (floraVis > 0.05) {
      ctx.save();
      ctx.globalAlpha = floraVis * 0.9;
      treeQrState.floatingPetals.forEach((ptl) => {
        ptl.h -= ptl.speed * dt;
        if (ptl.h < 4) ptl.h = 195;
        const pos = project((ptl.u + Math.sin(timestamp * 0.0025 + ptl.phase) * 0.09) * floraVis, ptl.v * floraVis, ptl.h * floraVis);
        ctx.fillStyle = palette.foliage[ptl.shade];
        ctx.fillRect(pos.x - 3 * floraVis, pos.y - 2 * floraVis, 6 * floraVis, 4 * floraVis);
      });
      ctx.restore();
    }

    if (standeeModal && standeeModal.open && activeQrStudioTab === 'tree') {
      treeQrState.animFrameId = requestAnimationFrame(renderTreeQrStudioFrame);
    }
  }

  function setTreeQrMode(mode, immediate = false) {
    treeQrState.mode = mode;
    treeQrState.targetP = mode === 'qr' ? 1 : 0;
    if (immediate) {
      treeQrState.morphTime = treeQrState.targetP;
      treeQrState.morphP = treeQrState.targetP;
    }
    const pillBtn = document.getElementById('treeQrTogglePill');
    if (pillBtn) {
      pillBtn.textContent = mode === 'qr'
        ? 'Tap to see the tree · 輕點讓葉片飛回長成大樹'
        : 'Tap the tree to see QR code · 點擊小樹顯示 QR Code';
    }
  }

  function initTreeQrStudio() {
    const canvasContainer = document.getElementById('treeQrCanvasContainer');
    const togglePill = document.getElementById('treeQrTogglePill');
    const urlInput = document.getElementById('treeQrUrlInput');
    const seasonBtns = document.querySelectorAll('.tree-season-btn');
    const colorDots = document.querySelectorAll('.tree-color-dot');
    const treeSoundBtn = document.getElementById('treeSoundToggleBtn');

    const toggleAction = () => {
      const nextMode = treeQrState.mode === 'tree' ? 'qr' : 'tree';
      playSound(nextMode === 'qr' ? 'treeToQr' : 'qrToTree');
      setTreeQrMode(nextMode, false);
    };
    if (canvasContainer) canvasContainer.addEventListener('click', toggleAction);
    if (togglePill) togglePill.addEventListener('click', toggleAction);

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        const val = urlInput.value.trim() || FIXED_QUIZ_GITHUB_URL;
        const bwUrlInput = document.getElementById('bwQrUrlInput');
        if (bwUrlInput) bwUrlInput.value = val;
        treeQrState.url = val;
        rebuildQrAndTreeGeometry(val);
        renderBwQrCanvas();
        renderCardFooterQR();
      });
    }

    seasonBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        playSound('seasonChange', idx);
        seasonBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        treeQrState.season = btn.getAttribute('data-season') || 'spring';
        renderCardFooterQR();
      });
    });

    colorDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        playSound('colorChange', idx);
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        treeQrState.colorKey = dot.getAttribute('data-color') || 'pink';
        renderCardFooterQR();
      });
    });

    if (treeSoundBtn) {
      treeSoundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        treeSoundBtn.innerHTML = isSoundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        if (isSoundEnabled) playSound('qrToTree');
      });
    }

    rebuildQrAndTreeGeometry(FIXED_QUIZ_GITHUB_URL);
  }

  function createPixelGardenQrCanvas(sizePx, urlText, colorKey, seasonKey) {
    const outCanvas = document.createElement('canvas');
    outCanvas.width = sizePx;
    outCanvas.height = sizePx;
    const ctx = outCanvas.getContext('2d');
    const model = new QRCode.QRCodeModel(-1, QRCode.CorrectLevel.H);
    model.addData((urlText || FIXED_QUIZ_GITHUB_URL).trim());
    model.make();

    const count = model.getModuleCount();
    const palette = TREE_QR_PALETTES[colorKey || treeQrState.colorKey] || TREE_QR_PALETTES.pink;
    const seasonTheme = SEASON_THEMES[seasonKey || treeQrState.season] || SEASON_THEMES.spring;
    const quietModules = 3;
    const totalSub = (count + quietModules * 2) * 2;
    const cellPx = sizePx / totalSub;

    ctx.fillStyle = '#F6F2EA';
    ctx.fillRect(0, 0, sizePx, sizePx);

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        const isDark = model.isDark(r, c);
        for (let sr = 0; sr < 2; sr++) {
          for (let sc = 0; sc < 2; sc++) {
            ctx.fillStyle = getModuleSubPixelColor(r, c, sr, sc, count, isDark, palette, seasonTheme);
            const x = ((c + quietModules) * 2 + sc) * cellPx;
            const y = ((r + quietModules) * 2 + sr) * cellPx;
            ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(cellPx), Math.ceil(cellPx));
          }
        }
      }
    }
    return outCanvas;
  }

  function renderFixedQRCodes() {
    const targetURL = getQuizURL();
    treeQrState.url = targetURL;
    rebuildQrAndTreeGeometry(targetURL);

    const captionEl = document.getElementById('standeeUrlCaption');
    if (captionEl) captionEl.textContent = targetURL;

    if (standeeQrHolder) {
      standeeQrHolder.innerHTML = '';
      standeeQrHolder.appendChild(createPixelGardenQrCanvas(260, targetURL, treeQrState.colorKey, treeQrState.season));
    }

    renderBwQrCanvas();
    renderCardFooterQR();
  }

  function renderCardFooterQR() {
    const targetURL = getQuizURL();
    if (cardFooterQrHolder && typeof QRCode !== 'undefined') {
      cardFooterQrHolder.innerHTML = '';
      const qrCanvas = createPixelGardenQrCanvas(68, targetURL, treeQrState.colorKey, treeQrState.season);
      qrCanvas.style.width = '58px';
      qrCanvas.style.height = '58px';
      qrCanvas.style.borderRadius = '8px';
      cardFooterQrHolder.appendChild(qrCanvas);
    }
  }

  function openStandeeModal(initialTab) {
    if (!standeeModal) return;
    if (!standeeModal.open) standeeModal.showModal();
    const box = standeeModal.querySelector('.standee-modal-box');
    if (box) box.scrollTop = 0;
    if (initialTab === 'tree' || initialTab === 'bw') switchQrStudioTab(initialTab);
    else switchQrStudioTab(activeQrStudioTab);
    renderFixedQRCodes();
    if (activeQrStudioTab === 'tree') {
      if (treeQrState.animFrameId) cancelAnimationFrame(treeQrState.animFrameId);
      treeQrState.lastTime = 0;
      treeQrState.animFrameId = requestAnimationFrame(renderTreeQrStudioFrame);
    }
  }

  function closeStandeeModal() {
    if (standeeModal && standeeModal.open) standeeModal.close();
  }

  function switchQrStudioTab(tabName) {
    activeQrStudioTab = tabName === 'bw' ? 'bw' : 'tree';
    const tabTree = document.getElementById('tabTreeQrBtn');
    const tabBw = document.getElementById('tabBwQrBtn');
    const treePane = document.getElementById('treeQrPane');
    const bwPane = document.getElementById('bwQrPane');

    const isBw = activeQrStudioTab === 'bw';
    if (tabTree) { tabTree.classList.toggle('active', !isBw); tabTree.setAttribute('aria-selected', String(!isBw)); }
    if (tabBw) { tabBw.classList.toggle('active', isBw); tabBw.setAttribute('aria-selected', String(isBw)); }
    if (treePane) treePane.hidden = isBw;
    if (bwPane) bwPane.hidden = !isBw;

    if (isBw) {
      if (treeQrState.animFrameId) {
        cancelAnimationFrame(treeQrState.animFrameId);
        treeQrState.animFrameId = null;
      }
      renderBwQrCanvas();
    } else if (standeeModal && standeeModal.open) {
      if (treeQrState.animFrameId) cancelAnimationFrame(treeQrState.animFrameId);
      treeQrState.lastTime = 0;
      treeQrState.animFrameId = requestAnimationFrame(renderTreeQrStudioFrame);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 10. 黑白高對比列印 QR Code 生成
  // ─────────────────────────────────────────────────────────
  function createBwQrCanvas(sizePx, urlText) {
    const outCanvas = document.createElement('canvas');
    outCanvas.width = sizePx;
    outCanvas.height = sizePx;
    const ctx = outCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, sizePx, sizePx);

    if (typeof QRCode === 'undefined' || !QRCode.QRCodeModel) return outCanvas;
    const model = new QRCode.QRCodeModel(-1, QRCode.CorrectLevel.H);
    model.addData((urlText || FIXED_QUIZ_GITHUB_URL).trim());
    model.make();

    const count = model.getModuleCount();
    const quietModules = 4;
    const totalModules = count + quietModules * 2;
    const cell = sizePx / totalModules;

    ctx.fillStyle = '#000000';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!model.isDark(r, c)) continue;
        const x1 = Math.floor((c + quietModules) * cell);
        const y1 = Math.floor((r + quietModules) * cell);
        const x2 = Math.ceil((c + quietModules + 1) * cell);
        const y2 = Math.ceil((r + quietModules + 1) * cell);
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      }
    }
    return outCanvas;
  }

  function renderBwQrCanvas() {
    const targetURL = getQuizURL();
    const canvas = document.getElementById('bwQrCanvas');
    const urlDisplay = document.getElementById('bwPrintUrlDisplay');
    const bwInput = document.getElementById('bwQrUrlInput');
    if (bwInput && bwInput.value.trim() !== targetURL) bwInput.value = targetURL;
    if (urlDisplay) urlDisplay.textContent = targetURL;
    if (!canvas) return;
    const generated = createBwQrCanvas(420, targetURL);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(generated, 0, 0, canvas.width, canvas.height);
  }

  function downloadBwRawQrPng() {
    playSound('tap');
    const hiRes = createBwQrCanvas(1200, getQuizURL());
    const a = document.createElement('a');
    a.download = 'MapMo-心理測驗-純黑白QRCode.png';
    a.href = hiRes.toDataURL('image/png');
    a.click();
    showToast('⬛ 純黑白高解析 QR Code 已下載！');
  }

  function downloadBwPosterPng() {
    playSound('tap');
    const W = 1200;
    const H = 1560;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);
    drawRoundRect(ctx, 56, 56, W - 112, H - 112, 36, '#FFFFFF', '#000000', 8);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = '900 36px "Outfit", "Noto Sans TC", sans-serif';
    ctx.fillText('MAPMO · 你是哪一種社群派？', W / 2, 168);

    const subtitleInput = document.getElementById('bwQrTitleInput');
    const titleStr = (subtitleInput && subtitleInput.value.trim()) || '掃描測出你的社群派別';
    ctx.font = '900 50px "Noto Sans TC", sans-serif';
    wrapText(ctx, titleStr, W / 2, 260, W - 200, 66);

    const qrFrameSize = 800;
    const qrBoxX = (W - qrFrameSize) / 2;
    const qrBoxY = 360;
    drawRoundRect(ctx, qrBoxX, qrBoxY, qrFrameSize, qrFrameSize, 24, '#FFFFFF', '#000000', 6);
    ctx.drawImage(createBwQrCanvas(760, getQuizURL()), qrBoxX + 20, qrBoxY + 20, 760, 760);

    ctx.fillStyle = '#111111';
    ctx.font = '700 30px "Noto Sans TC", sans-serif';
    ctx.fillText('打開手機相機對準黑白條碼即可開始 · 11 題約 2 分鐘', W / 2, 1260);
    ctx.font = '700 26px "Outfit", monospace';
    ctx.fillText(getQuizURL(), W / 2, 1340);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(140, 1390);
    ctx.lineTo(W - 140, 1390);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 22px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText('© 2026 MapMo 全匿名地理情緒樹洞', W / 2, 1445);

    const a = document.createElement('a');
    a.download = 'MapMo-心理測驗-黑白列印海報立牌.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast('🖨️ 黑白高對比列印海報已下載！');
  }

  function downloadPureQRCode() {
    playSound('tap');
    const a = document.createElement('a');
    a.download = `MapMo-像素花園QRCode-${treeQrState.colorKey}.png`;
    a.href = createPixelGardenQrCanvas(1200, getQuizURL(), treeQrState.colorKey, treeQrState.season).toDataURL('image/png');
    a.click();
    showToast('📥 像素花園 QR Code 高解析圖檔已下載！');
  }

  function downloadCurrentTreeCanvas() {
    playSound('tap');
    const canvas = document.getElementById('treeQrInteractiveCanvas');
    if (!canvas) return;
    const a = document.createElement('a');
    const modeLabel = treeQrState.mode === 'tree' ? '3D情緒樹' : '像素花園QR';
    a.download = `MapMo-${modeLabel}-${treeQrState.colorKey}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    showToast(`📥 ${modeLabel} 畫面已成功下載！`);
  }

  function copyQuizLink() {
    playSound('tap');
    const url = getQuizURL();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => showToast('🔗 測驗專屬連結已複製！')).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('🔗 專屬連結已複製！');
  }

  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (!toast) return;
    if (msgEl) msgEl.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // ─────────────────────────────────────────────────────────
  // 11. Google 試算表後台數據引擎 (11 題相似度 + Q11 展板數據 + Excel 匯出)
  // ─────────────────────────────────────────────────────────
  function getSheetsEndpointUrl() {
    const inputEl = document.getElementById('sheetsWebhookInput');
    const uiVal = inputEl && inputEl.value ? inputEl.value.trim() : '';
    if (uiVal && /^https:\/\/script\.google\.com\//i.test(uiVal)) return uiVal;
    try {
      const saved = (localStorage.getItem(WEBHOOK_STORAGE_KEY) || '').trim();
      if (saved && /^https:\/\/script\.google\.com\//i.test(saved)) return saved;
    } catch (_) {}
    return (GOOGLE_SHEETS_API_URL || '').trim();
  }

  function initBackendAndStats() {
    loadCachedData();
    statsState.isConfigured = Boolean(getSheetsEndpointUrl());
    renderCrowdStatsUI();

    if (statsState.isConfigured) {
      fetchSummaryFromSheets(false);
      flushPendingSubmissions();
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') openAdminModal();

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && getSheetsEndpointUrl()) flushPendingSubmissions();
    });
  }

  function loadCachedData() {
    try {
      const rawStats = localStorage.getItem(LOCAL_CACHE_STATS_KEY);
      if (rawStats) statsState.summary = normalizeSummaryCounts(JSON.parse(rawStats));
      const rawRecs = localStorage.getItem(LOCAL_RECORDS_STORAGE_KEY);
      if (rawRecs) {
        const list = JSON.parse(rawRecs);
        if (Array.isArray(list)) statsState.records = list;
      }
    } catch (_) {}
  }

  function saveCachedSummary(summary) {
    try { localStorage.setItem(LOCAL_CACHE_STATS_KEY, JSON.stringify(summary)); } catch (_) {}
  }

  function saveLocalRecords(list) {
    try { localStorage.setItem(LOCAL_RECORDS_STORAGE_KEY, JSON.stringify(list.slice(0, 500))); } catch (_) {}
  }

  function normalizeSummaryCounts(obj) {
    const out = { total: 0, lurker: 0, diarist: 0, stealth: 0, curator: 0, freespirit: 0 };
    let sum = 0;
    PERSONA_ORDER.forEach((id) => {
      const n = Math.max(0, parseInt(obj && obj[id] != null ? obj[id] : 0, 10) || 0);
      out[id] = n;
      sum += n;
    });
    const rawTotal = Math.max(0, parseInt(obj && obj.total != null ? obj.total : 0, 10) || 0);
    out.total = Math.max(rawTotal, sum);
    return out;
  }

  function formatLocalTime(isoOrDate) {
    if (isoOrDate === '') return '';
    const cleaned = typeof isoOrDate === 'string'
      ? isoOrDate.replace(/\s*\([^)]*\)$/, '').trim()
      : isoOrDate;
    if (cleaned === '') return '';
    const d = cleaned != null ? new Date(cleaned) : new Date();
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  async function fetchSummaryFromSheets(includeRecords = false) {
    const endpoint = getSheetsEndpointUrl();
    statsState.isConfigured = Boolean(endpoint);
    if (!endpoint) {
      statsState.isSyncing = false;
      statsState.isOnline = false;
      renderCrowdStatsUI(currentEvaluation ? currentEvaluation.mainPersonaId : null);
      if (adminModal && adminModal.open) {
        renderAdminKpisAndSummary();
        renderAdminRecordsTable();
      }
      return;
    }

    statsState.isSyncing = true;
    statsState.isLoadingRecords = includeRecords;
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = includeRecords ? `${endpoint}${sep}includeRecords=1` : endpoint;

    try {
      const res = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && json.summary) {
        statsState.summary = normalizeSummaryCounts(json.summary);
        saveCachedSummary(statsState.summary);
      }
      if (includeRecords && Array.isArray(json.records)) {
        statsState.records = json.records.map(r => ({
          ...r,
          createdAtLocal: r.createdAtLocal ? (formatLocalTime(r.createdAtLocal) || r.createdAtLocal) : ''
        }));
        saveLocalRecords(statsState.records);
      }
      statsState.isOnline = true;
    } catch (_) {
      statsState.isOnline = false;
    } finally {
      statsState.isSyncing = false;
      statsState.isLoadingRecords = false;
      renderCrowdStatsUI(currentEvaluation ? currentEvaluation.mainPersonaId : null);
      if (adminModal && adminModal.open) {
        renderAdminKpisAndSummary();
        if (includeRecords) renderAdminRecordsTable();
      }
    }
  }

  function getDeviceLabel() {
    const w = window.innerWidth || 1024;
    if (w < 640) return '手機';
    if (w <= 1024) return '平板';
    return '電腦';
  }

  function getPendingQueue() {
    try {
      const raw = localStorage.getItem(PENDING_SYNC_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (_) { return []; }
  }

  function savePendingQueue(list) {
    try { localStorage.setItem(PENDING_SYNC_STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
  }

  async function postQuizRecordToSheets(payload) {
    const endpoint = getSheetsEndpointUrl();
    if (!endpoint) throw new Error('SHEETS_NOT_CONFIGURED');
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return { ok: true };
  }

  let isFlushingQueue = false;
  async function flushPendingSubmissions() {
    const endpoint = getSheetsEndpointUrl();
    if (!endpoint || isFlushingQueue) return;
    const queue = getPendingQueue();
    if (queue.length === 0) return;

    isFlushingQueue = true;
    const remaining = [];
    for (const item of queue) {
      try { await postQuizRecordToSheets(item); }
      catch (_) { remaining.push(item); }
    }
    savePendingQueue(remaining);
    isFlushingQueue = false;
    if (remaining.length < queue.length) {
      setTimeout(() => fetchSummaryFromSheets(false), 900);
    }
  }

  async function recordQuizCompletion(evalObj, serialCode, answersArr) {
    if (!evalObj || !evalObj.mainPersona || hasSubmittedCurrentRun) return;
    hasSubmittedCurrentRun = true;

    const p = evalObj.mainPersona;
    const nowIso = new Date().toISOString();
    const answersRaw = ALL_QUESTIONS.map((q, idx) => {
      const optIdx = answersArr[idx];
      const opt = (optIdx != null && q.options[optIdx]) ? q.options[optIdx] : null;
      return `${q.id}:${opt ? opt.letter : '-'}`;
    }).join(', ');

    const simText = evalObj.similarities.map(s => `${PERSONAS[s.id].shortName.slice(0, 2)}${s.pct}%`).join(' ');
    const shadowNote = evalObj.showSecond
      ? `主 ${evalObj.mainPct}% · 含${evalObj.secondPersona.name}(${evalObj.secondPct}%)`
      : `主 ${evalObj.mainPct}%（吻合${evalObj.mainMatchCount}/10題）`;
    const pathSummary = `Q11想分享：${evalObj.q11Text || '未填'} ｜ ${simText}`;
    const docId = `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

    const payload = {
      docId,
      serial: serialCode,
      personaId: p.id,
      personaName: p.name,
      emotionLabel: shadowNote,
      pathSummary,
      answersRaw,
      recordScore: evalObj.mainPct,
      awarenessScore: evalObj.secondPct,
      shareScore: evalObj.totalScore,
      deviceType: getDeviceLabel(),
      host: String(window.location.hostname || 'local').slice(0, 80),
      createdAtIso: nowIso,
      createdAtLocal: formatLocalTime(nowIso)
    };

    statsState.summary.total += 1;
    statsState.summary[p.id] = (statsState.summary[p.id] || 0) + 1;
    saveCachedSummary(statsState.summary);
    statsState.records = [payload].concat(statsState.records);
    saveLocalRecords(statsState.records);
    renderCrowdStatsUI(p.id);

    const endpoint = getSheetsEndpointUrl();
    statsState.isConfigured = Boolean(endpoint);
    if (!endpoint) {
      const q = getPendingQueue();
      q.push(payload);
      savePendingQueue(q);
      renderCrowdStatsUI(p.id);
      return;
    }

    try {
      await postQuizRecordToSheets(payload);
      statsState.isOnline = true;
      setTimeout(() => fetchSummaryFromSheets(false), 1100);
    } catch (_) {
      statsState.isOnline = false;
      const q = getPendingQueue();
      q.push(payload);
      savePendingQueue(q);
      renderCrowdStatsUI(p.id);
    }
  }

  function renderCrowdStatsUI(highlightPersonaId) {
    const s = statsState.summary;
    const total = Math.max(0, s.total || 0);

    const startBadge = document.getElementById('startTotalBadge');
    const liveTotalEl = document.getElementById('liveStatsTotalCount');
    const startBarsEl = document.getElementById('liveStatsBars');
    const dotEl = document.getElementById('liveSyncDot');
    const noteEl = document.getElementById('liveStatsSourceNote');
    const pendingCount = getPendingQueue().length;
    const configured = Boolean(getSheetsEndpointUrl());

    if (startBadge) startBadge.textContent = String(total);
    if (liveTotalEl) liveTotalEl.textContent = String(total);
    if (dotEl) dotEl.classList.toggle('offline', !configured || (!statsState.isOnline && !statsState.isSyncing));
    if (noteEl) {
      if (!configured) noteEl.textContent = '目前為本機匿名統計中';
      else if (statsState.isOnline) noteEl.textContent = pendingCount > 0 ? `全場匿名統計同步中（${pendingCount} 筆待補傳）` : '全場匿名統計即時更新中';
      else if (statsState.isSyncing) noteEl.textContent = '正在連線同步全場匿名統計...';
      else noteEl.textContent = `暫離線快取顯示（待補同步 ${pendingCount} 筆）`;
    }

    const sortedIds = PERSONA_ORDER.slice().sort((a, b) => (s[b] || 0) - (s[a] || 0));
    const buildBarsHtml = (activeId) => sortedIds.map((id) => {
      const p = PERSONAS[id];
      const cnt = s[id] || 0;
      const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
      const isMe = activeId && activeId === id;
      return `
        <div class="live-stat-row${isMe ? ' is-user-persona' : ''}">
          <div class="live-stat-meta">
            <span class="live-stat-name">
              <span class="live-stat-dot" style="background:${p.barColor};"></span>
              <span>${escapeHtml(p.name)}</span>
              ${isMe ? '<span class="live-stat-you-badge">你</span>' : ''}
            </span>
            <span class="live-stat-num">${cnt} 人 (${pct}%)</span>
          </div>
          <div class="live-stat-track">
            <div class="live-stat-fill" style="width:${pct}%;background:${p.barColor};"></div>
          </div>
        </div>
      `;
    }).join('');

    if (startBarsEl) startBarsEl.innerHTML = buildBarsHtml(null);

    const resultHeadline = document.getElementById('resultCrowdHeadline');
    const resultBars = document.getElementById('resultCrowdBars');
    const resultBadge = document.getElementById('resultCrowdSyncBadge');
    if (highlightPersonaId && PERSONAS[highlightPersonaId]) {
      const p = PERSONAS[highlightPersonaId];
      const myCnt = s[highlightPersonaId] || 0;
      const myPct = total > 0 ? Math.round((myCnt / total) * 100) : 0;
      if (resultHeadline) resultHeadline.textContent = `全場累積 ${total} 人測驗，其中 ${myCnt} 人（${myPct}%）和你同屬「${p.name}」`;
      if (resultBars) resultBars.innerHTML = buildBarsHtml(highlightPersonaId);
      if (resultBadge) {
        if (!configured) resultBadge.textContent = '已記錄（本機）';
        else resultBadge.textContent = statsState.isOnline ? '全場即時同步' : '暫存待雲端同步';
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // 12. 後台統計面板、Q11 展板分析與 Excel 匯出
  // ─────────────────────────────────────────────────────────
  function computeQ11Distribution(records) {
    const counts = { A: 0, B: 0, C: 0, D: 0, total: 0 };
    (records || []).forEach((r) => {
      const match = String(r.answersRaw || '').match(/\bQ11:([A-D])\b/i);
      if (match && counts.hasOwnProperty(match[1].toUpperCase())) {
        counts[match[1].toUpperCase()] += 1;
        counts.total += 1;
      }
    });
    return counts;
  }

  function buildGoogleAppsScriptSource() {
    return [
      "var DETAILS_SHEET_NAME = '逐筆測驗明細';",
      "var SUMMARY_SHEET_NAME = '人格統計總覽';",
      'var PERSONAS_META = [',
      "  ['lurker', '潛水觀察派', '很少記錄、幾乎不發文，主要看別人的生活'],",
      "  ['diarist', '備忘錄日記派', '記錄很多，但大多留給自己，偶爾才分享'],",
      "  ['stealth', '悄悄發佈派', '想分享，但不想太快被注意'],",
      "  ['curator', '精修完美派', '常發文，在意呈現效果、讚數與反應'],",
      "  ['freespirit', '隨心所欲派', '常發文，想發就發，不太在意別人怎麼看']",
      '];',
      '',
      'function ensureSheets_(ss) {',
      '  var detail = ss.getSheetByName(DETAILS_SHEET_NAME);',
      '  if (!detail) {',
      '    detail = ss.insertSheet(DETAILS_SHEET_NAME);',
      "    detail.appendRow(['序號', '完成時間', '流水號', '人格代碼', '社群人格名稱', '相似度與影子摘要', 'Q11與五派別吻合', 'Q1-Q11作答明細', '主相似度%', '次相似度%', '參考總分(10-30)', '裝置類型', '來源網域', '紀錄ID']);",
      '    detail.setFrozenRows(1);',
      '  }',
      '  var summary = ss.getSheetByName(SUMMARY_SHEET_NAME);',
      '  if (!summary) {',
      '    summary = ss.insertSheet(SUMMARY_SHEET_NAME, 0);',
      "    summary.appendRow(['人格代碼', '社群人格名稱', '特徵說明', '累積人數', '佔比']);",
      '    for (var i = 0; i < PERSONAS_META.length; i++) {',
      '      var r = i + 2;',
      '      summary.appendRow([',
      '        PERSONAS_META[i][0],',
      '        PERSONAS_META[i][1],',
      '        PERSONAS_META[i][2],',
      "        \"=COUNTIF('\" + DETAILS_SHEET_NAME + \"'!D:D, A\" + r + \")\",",
      "        '=IF($D$7>0, D' + r + '/$D$7, 0)'",
      '      ]);',
      '    }',
      "    summary.appendRow(['TOTAL', '總計累積人數', '全部五大派別', '=SUM(D2:D6)', '=IF(D7>0, 1, 0)']);",
      "    summary.getRange('E2:E7').setNumberFormat('0.0%');",
      '    summary.setFrozenRows(1);',
      '  }',
      '  return { detail: detail, summary: summary };',
      '}',
      '',
      'function doGet(e) {',
      '  var ss = SpreadsheetApp.getActiveSpreadsheet();',
      '  var sheets = ensureSheets_(ss);',
      '  var counts = { total: 0, lurker: 0, diarist: 0, stealth: 0, curator: 0, freespirit: 0 };',
      '  var sumVals = sheets.summary.getRange(2, 1, 6, 4).getValues();',
      '  for (var i = 0; i < sumVals.length; i++) {',
      "    var code = String(sumVals[i][0] || '');",
      '    var num = Number(sumVals[i][3]) || 0;',
      "    if (code === 'TOTAL') counts.total = num;",
      '    else if (counts.hasOwnProperty(code)) counts[code] = num;',
      '  }',
      '  var result = { ok: true, summary: counts, records: [] };',
      "  var includeRecords = e && e.parameter && e.parameter.includeRecords === '1';",
      '  if (includeRecords) {',
      '    var lastRow = sheets.detail.getLastRow();',
      '    if (lastRow > 1) {',
      '      var rows = sheets.detail.getRange(2, 1, lastRow - 1, 14).getValues();',
      '      for (var r = rows.length - 1; r >= 0; r--) {',
      '        var row = rows[r];',
      '        var rawTime = row[1];',
      "        var timeStr = (rawTime instanceof Date) ? Utilities.formatDate(rawTime, ss.getSpreadsheetTimeZone(), 'yyyy/MM/dd HH:mm:ss') : String(rawTime || '');",
      '        result.records.push({',
      '          createdAtLocal: timeStr,',
      "          serial: String(row[2] || ''),",
      "          personaId: String(row[3] || ''),",
      "          personaName: String(row[4] || ''),",
      "          emotionLabel: String(row[5] || ''),",
      "          pathSummary: String(row[6] || ''),",
      "          answersRaw: String(row[7] || ''),",
      '          recordScore: Number(row[8]) || 0,',
      '          awarenessScore: Number(row[9]) || 0,',
      '          shareScore: Number(row[10]) || 0,',
      "          deviceType: String(row[11] || ''),",
      "          host: String(row[12] || ''),",
      "          docId: String(row[13] || '')",
      '        });',
      '      }',
      '    }',
      '  }',
      '  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);',
      '}',
      '',
      'function doPost(e) {',
      '  var lock = LockService.getScriptLock();',
      '  lock.waitLock(10000);',
      '  try {',
      "    var data = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : '{}');",
      '    if (!data.personaId) {',
      "      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'missing_persona' })).setMimeType(ContentService.MimeType.JSON);",
      '    }',
      '    var ss = SpreadsheetApp.getActiveSpreadsheet();',
      '    var sheets = ensureSheets_(ss);',
      '    var detail = sheets.detail;',
      '    var lastRow = detail.getLastRow();',
      '    if (data.docId && lastRow > 1) {',
      '      var checkCount = Math.min(50, lastRow - 1);',
      '      var recentIds = detail.getRange(lastRow - checkCount + 1, 14, checkCount, 1).getValues();',
      '      for (var i = 0; i < recentIds.length; i++) {',
      '        if (String(recentIds[i][0]) === String(data.docId)) {',
      '          return ContentService.createTextOutput(JSON.stringify({ ok: true, duplicate: true })).setMimeType(ContentService.MimeType.JSON);',
      '        }',
      '      }',
      '    }',
      '    var seq = Math.max(1, lastRow);',
      '    detail.appendRow([',
      '      seq,',
      "      data.createdAtLocal || '',",
      "      data.serial || '',",
      "      data.personaId || '',",
      "      data.personaName || '',",
      "      data.emotionLabel || '',",
      "      data.pathSummary || '',",
      "      data.answersRaw || '',",
      '      Number(data.recordScore) || 0,',
      '      Number(data.awarenessScore) || 0,',
      '      Number(data.shareScore) || 0,',
      "      data.deviceType || '',",
      "      data.host || '',",
      "      data.docId || ''",
      '    ]);',
      '    return ContentService.createTextOutput(JSON.stringify({ ok: true, seq: seq })).setMimeType(ContentService.MimeType.JSON);',
      '  } finally {',
      '    lock.releaseLock();',
      '  }',
      '}'
    ].join('\n');
  }

  function bindAdminEvents() {
    const btnRefresh = document.getElementById('btnRefreshAdmin');
    if (btnRefresh) btnRefresh.addEventListener('click', () => { playSound('tap'); refreshAdminData(); });

    const btnExportXls = document.getElementById('btnExportXls');
    if (btnExportXls) btnExportXls.addEventListener('click', () => exportExcelWorkbook());

    const btnExportCsv = document.getElementById('btnExportCsv');
    if (btnExportCsv) btnExportCsv.addEventListener('click', () => exportCsvData());

    const btnReset = document.getElementById('btnResetTestStats');
    if (btnReset) btnReset.addEventListener('click', () => clearLocalCachedStats());

    const webhookInput = document.getElementById('sheetsWebhookInput');
    if (webhookInput) {
      try {
        webhookInput.value = localStorage.getItem(WEBHOOK_STORAGE_KEY) || GOOGLE_SHEETS_API_URL || '';
      } catch (_) {}
    }

    const btnSaveWebhook = document.getElementById('btnSaveWebhook');
    if (btnSaveWebhook) {
      btnSaveWebhook.addEventListener('click', () => {
        const val = webhookInput ? webhookInput.value.trim() : '';
        if (val && !/^https:\/\/script\.google\.com\//i.test(val)) {
          showToast('⚠️ 請填入有效的 Google Apps Script https:// 網址');
          return;
        }
        try {
          if (val) localStorage.setItem(WEBHOOK_STORAGE_KEY, val);
          else localStorage.removeItem(WEBHOOK_STORAGE_KEY);
          statsState.isConfigured = Boolean(getSheetsEndpointUrl());
          showToast(val ? '✅ 已儲存試算表網址，正在連線...' : '已還原為預設試算表網址');
          refreshAdminData();
        } catch (_) {}
      });
    }

    const btnCopyScript = document.getElementById('btnCopyAppsScript');
    if (btnCopyScript) {
      btnCopyScript.addEventListener('click', () => {
        const scriptCode = buildGoogleAppsScriptSource();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(scriptCode).then(() => showToast('📋 Google 試算表完整腳本已複製！')).catch(() => fallbackCopy(scriptCode));
        } else {
          fallbackCopy(scriptCode);
        }
      });
    }

    const btnTestWebhook = document.getElementById('btnTestWebhook');
    if (btnTestWebhook) {
      btnTestWebhook.addEventListener('click', async () => {
        const endpoint = getSheetsEndpointUrl();
        if (!endpoint) {
          showToast('⚠️ 請先貼入並儲存 Google 試算表網址');
          return;
        }
        const testRow = {
          docId: `test_${Date.now().toString(36)}`,
          serial: 'TEST-0000',
          personaId: 'stealth',
          personaName: '悄悄發佈派 (測試寫入)',
          emotionLabel: '主 80% · 含精修完美派(70%)',
          pathSummary: 'Q11想分享：一處讓我停下腳步的風景 ｜ 潛水10% 備忘40% 悄悄80% 精修70% 隨心30%',
          answersRaw: 'Q1:A, Q2:C, Q3:B, Q4:C, Q5:B, Q6:B, Q7:C, Q8:C, Q9:C, Q10:C, Q11:A',
          recordScore: 80,
          awarenessScore: 70,
          shareScore: 22,
          deviceType: getDeviceLabel(),
          host: String(window.location.hostname || 'local'),
          createdAtLocal: formatLocalTime()
        };
        try {
          await postQuizRecordToSheets(testRow);
          showToast('🚀 已送出測試列，請確認試算表（測試完記得到試算表刪掉該列）');
          setTimeout(() => refreshAdminData(), 1100);
        } catch (_) {
          showToast('❌ 測試送出失敗，請檢查部署權限是否為「所有人」');
        }
      });
    }
  }

  function openAdminModal() {
    if (!adminModal) return;
    if (!adminModal.open) adminModal.showModal();
    const box = adminModal.querySelector('.standee-modal-box');
    if (box) box.scrollTop = 0;
    const configBox = document.getElementById('adminSheetsConfigBox');
    if (configBox && !getSheetsEndpointUrl()) configBox.open = true;
    renderAdminKpisAndSummary();
    renderAdminRecordsTable();
    refreshAdminData();
  }

  function closeAdminModal() {
    if (adminModal && adminModal.open) adminModal.close();
  }

  async function refreshAdminData() {
    await flushPendingSubmissions();
    await fetchSummaryFromSheets(true);
    renderAdminKpisAndSummary();
    renderAdminRecordsTable();
  }

  function renderAdminKpisAndSummary() {
    const s = statsState.summary;
    const total = s.total || 0;
    const pending = getPendingQueue().length;
    const configured = Boolean(getSheetsEndpointUrl());

    const kpiTotal = document.getElementById('adminKpiTotal');
    const kpiTop = document.getElementById('adminKpiTop');
    const kpiRows = document.getElementById('adminKpiRows');
    const kpiPending = document.getElementById('adminKpiPending');
    const statusBadge = document.getElementById('adminSyncStatus');

    if (kpiTotal) kpiTotal.textContent = String(total);
    if (kpiRows) kpiRows.textContent = String(statsState.records.length);
    if (kpiPending) kpiPending.textContent = String(pending);

    let topId = '';
    let topCount = -1;
    PERSONA_ORDER.forEach((id) => {
      if ((s[id] || 0) > topCount) { topCount = s[id] || 0; topId = id; }
    });
    if (kpiTop) {
      kpiTop.textContent = total > 0 && PERSONAS[topId] ? `${PERSONAS[topId].name} (${topCount})` : '尚無紀錄';
    }

    if (statusBadge) {
      if (!configured) statusBadge.innerHTML = '<span class="live-dot-pulse offline" aria-hidden="true"></span> 待綁定 Google 試算表';
      else if (statsState.isOnline) statusBadge.innerHTML = '<span class="live-dot-pulse" aria-hidden="true"></span> Google 試算表已連線';
      else statusBadge.innerHTML = '<span class="live-dot-pulse offline" aria-hidden="true"></span> 連線異常 (暫存本機)';
    }

    const sumBody = document.getElementById('adminSummaryBody');
    if (sumBody) {
      sumBody.innerHTML = PERSONA_ORDER.map((id) => {
        const p = PERSONAS[id];
        const cnt = s[id] || 0;
        const pct = total > 0 ? ((cnt / total) * 100).toFixed(1) : '0.0';
        return `
          <tr>
            <td data-label="派別名稱"><strong><span class="live-stat-dot" style="background:${p.barColor};display:inline-block;margin-right:6px;"></span>${escapeHtml(p.name)}</strong></td>
            <td data-label="典型特徵">${escapeHtml(p.traitSummary)}</td>
            <td data-label="累積人數"><strong>${cnt}</strong></td>
            <td data-label="佔比">${pct}%</td>
          </tr>
        `;
      }).join('');
    }

    const q11Body = document.getElementById('adminQ11Body');
    if (q11Body) {
      const q11Dist = computeQ11Distribution(statsState.records);
      q11Body.innerHTML = FINAL_QUESTION.options.map((opt) => {
        const cnt = q11Dist[opt.letter] || 0;
        const pct = q11Dist.total > 0 ? ((cnt / q11Dist.total) * 100).toFixed(1) : '0.0';
        return `
          <tr>
            <td data-label="選項"><strong>${escapeHtml(opt.letter)}</strong></td>
            <td data-label="心聲內容">${escapeHtml(opt.text)}</td>
            <td data-label="選擇人數"><strong>${cnt}</strong></td>
            <td data-label="佔比">${pct}%</td>
          </tr>
        `;
      }).join('');
    }
  }

  function renderAdminRecordsTable() {
    const tbody = document.getElementById('adminRecordsBody');
    if (!tbody) return;
    if (statsState.records.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#786E60;padding:24px;">尚未有作答紀錄（完成一次測驗即會寫入）。</td></tr>';
      return;
    }

    tbody.innerHTML = statsState.records.slice(0, 100).map((r, i) => `
      <tr>
        <td data-label="#">${i + 1}</td>
        <td data-label="完成時間">${escapeHtml(r.createdAtLocal || r.createdAtIso)}</td>
        <td data-label="檔案編號"><code>${escapeHtml(r.serial || '—')}</code></td>
        <td data-label="主派別"><span><strong>${escapeHtml(r.personaName || r.personaId)}</strong><br><small style="color:#786E60;">${escapeHtml(r.emotionLabel || '')}</small></span></td>
        <td data-label="Q11與吻合" class="wrap-cell">${escapeHtml(r.pathSummary || '—')}</td>
        <td data-label="裝置">${escapeHtml(r.deviceType || '—')}</td>
      </tr>
    `).join('');
  }

  function clearLocalCachedStats() {
    savePendingQueue([]);
    statsState.records = [];
    statsState.summary = { total: 0, lurker: 0, diarist: 0, stealth: 0, curator: 0, freespirit: 0 };
    saveCachedSummary(statsState.summary);
    saveLocalRecords([]);
    renderCrowdStatsUI(currentEvaluation ? currentEvaluation.mainPersonaId : null);
    renderAdminKpisAndSummary();
    renderAdminRecordsTable();
    showToast('🧹 已清除本機暫存（雲端 Google 試算表需至試算表內手動刪列）');
    if (getSheetsEndpointUrl()) fetchSummaryFromSheets(true);
  }

  function formatFileTimestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeXml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function safeSpreadsheetString(val) {
    const s = String(val == null ? '' : val);
    return /^[=+\-@]/.test(s) ? `'${s}` : s;
  }

  async function exportExcelWorkbook() {
    playSound('tap');
    showToast('📊 正在抓取最新紀錄並產生 Excel 活頁簿...');
    await refreshAdminData();

    const s = statsState.summary;
    const records = statsState.records;
    const q11Dist = computeQ11Distribution(records);

    const xmlCell = (val, type = 'String', styleId = '') => {
      const styleAttr = styleId ? ` ss:StyleID="${styleId}"` : '';
      if (type === 'Number') {
        return `<Cell${styleAttr}><Data ss:Type="Number">${Number(val) || 0}</Data></Cell>`;
      }
      return `<Cell${styleAttr}><Data ss:Type="String">${escapeXml(safeSpreadsheetString(val))}</Data></Cell>`;
    };

    const summaryHeaderRow = ['派別代碼', '派別名稱', '典型特徵', '累積人數', '佔比']
      .map(h => xmlCell(h, 'String', 'Header')).join('');

    const summaryRows = PERSONA_ORDER.map((id) => {
      const p = PERSONAS[id];
      const cnt = s[id] || 0;
      const pctRatio = s.total > 0 ? (cnt / s.total) : 0;
      return `<Row>${[
        xmlCell(id),
        xmlCell(p.name),
        xmlCell(p.traitSummary),
        xmlCell(cnt, 'Number'),
        `<Cell ss:StyleID="Percent" ss:Formula="=IF(R7C4&gt;0,RC[-1]/R7C4,0)"><Data ss:Type="Number">${pctRatio.toFixed(4)}</Data></Cell>`
      ].join('')}</Row>`;
    }).join('');

    const summaryTotalRow = `<Row>${[
      xmlCell('TOTAL', 'String', 'Total'),
      xmlCell('總計累積人數', 'String', 'Total'),
      xmlCell('全部五大派別', 'String', 'Total'),
      `<Cell ss:StyleID="Total" ss:Formula="=SUM(R[-5]C:R[-1]C)"><Data ss:Type="Number">${s.total || 0}</Data></Cell>`,
      `<Cell ss:StyleID="TotalPercent" ss:Formula="=IF(R7C4&gt;0,1,0)"><Data ss:Type="Number">${s.total > 0 ? 1 : 0}</Data></Cell>`
    ].join('')}</Row>`;

    // Sheet 2: Q11 展板心聲統計
    const q11HeaderRow = ['選項代碼', 'Q11 最想分享的心聲內容', '選擇人數', '佔比']
      .map(h => xmlCell(h, 'String', 'Header')).join('');

    const q11Rows = FINAL_QUESTION.options.map((opt) => {
      const cnt = q11Dist[opt.letter] || 0;
      const pctRatio = q11Dist.total > 0 ? (cnt / q11Dist.total) : 0;
      return `<Row>${[
        xmlCell(opt.letter),
        xmlCell(opt.text),
        xmlCell(cnt, 'Number'),
        `<Cell ss:StyleID="Percent" ss:Formula="=IF(R6C3&gt;0,RC[-1]/R6C3,0)"><Data ss:Type="Number">${pctRatio.toFixed(4)}</Data></Cell>`
      ].join('')}</Row>`;
    }).join('');

    const q11TotalRow = `<Row>${[
      xmlCell('TOTAL', 'String', 'Total'),
      xmlCell('Q11 有效作答總數', 'String', 'Total'),
      `<Cell ss:StyleID="Total" ss:Formula="=SUM(R[-4]C:R[-1]C)"><Data ss:Type="Number">${q11Dist.total || 0}</Data></Cell>`,
      `<Cell ss:StyleID="TotalPercent" ss:Formula="=IF(R6C3&gt;0,1,0)"><Data ss:Type="Number">${q11Dist.total > 0 ? 1 : 0}</Data></Cell>`
    ].join('')}</Row>`;

    // Sheet 3: 逐筆明細
    const detailHeaders = ['序號', '完成時間', '檔案編號', '派別代碼', '社群派別名稱', '相似度與影子摘要', 'Q11與五派別吻合', 'Q1-Q11作答明細', '主相似度%', '次相似度%', '參考總分(10-30)', '裝置類型', '來源網域'];
    const detailHeaderRow = `<Row>${detailHeaders.map(h => xmlCell(h, 'String', 'Header')).join('')}</Row>`;
    const detailRows = records.map((r, idx) => `<Row>${[
      xmlCell(idx + 1, 'Number'),
      xmlCell(r.createdAtLocal || r.createdAtIso),
      xmlCell(r.serial),
      xmlCell(r.personaId),
      xmlCell(r.personaName),
      xmlCell(r.emotionLabel),
      xmlCell(r.pathSummary),
      xmlCell(r.answersRaw),
      xmlCell(r.recordScore, 'Number'),
      xmlCell(r.awarenessScore, 'Number'),
      xmlCell(r.shareScore, 'Number'),
      xmlCell(r.deviceType),
      xmlCell(r.host)
    ].join('')}</Row>`).join('');

    const workbookXml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<?mso-application progid="Excel.Sheet"?>',
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
      ' <Styles>',
      '  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Font ss:FontName="Microsoft JhengHei" ss:Size="11"/></Style>',
      '  <Style ss:ID="Header"><Font ss:FontName="Microsoft JhengHei" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1E1B16" ss:Pattern="Solid"/></Style>',
      '  <Style ss:ID="Percent"><NumberFormat ss:Format="0.0%"/></Style>',
      '  <Style ss:ID="Total"><Font ss:FontName="Microsoft JhengHei" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#EFE6D4" ss:Pattern="Solid"/></Style>',
      '  <Style ss:ID="TotalPercent"><Font ss:FontName="Microsoft JhengHei" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#EFE6D4" ss:Pattern="Solid"/><NumberFormat ss:Format="0.0%"/></Style>',
      ' </Styles>',
      ' <Worksheet ss:Name="五大派別統計總覽">',
      '  <Table>',
      '   <Column ss:Width="95"/><Column ss:Width="135"/><Column ss:Width="260"/><Column ss:Width="95"/><Column ss:Width="95"/>',
      `   <Row>${summaryHeaderRow}</Row>`,
      summaryRows,
      summaryTotalRow,
      '  </Table>',
      ' </Worksheet>',
      ' <Worksheet ss:Name="Q11展板心聲統計">',
      '  <Table>',
      '   <Column ss:Width="80"/><Column ss:Width="290"/><Column ss:Width="95"/><Column ss:Width="95"/>',
      `   <Row>${q11HeaderRow}</Row>`,
      q11Rows,
      q11TotalRow,
      '  </Table>',
      ' </Worksheet>',
      ' <Worksheet ss:Name="逐筆測驗明細">',
      '  <Table>',
      '   <Column ss:Width="55"/><Column ss:Width="150"/><Column ss:Width="130"/><Column ss:Width="95"/><Column ss:Width="125"/><Column ss:Width="210"/><Column ss:Width="340"/><Column ss:Width="240"/><Column ss:Width="85"/><Column ss:Width="85"/><Column ss:Width="100"/><Column ss:Width="75"/><Column ss:Width="150"/>',
      detailHeaderRow,
      detailRows,
      '  </Table>',
      ' </Worksheet>',
      '</Workbook>'
    ].join('\n');

    const blob = new Blob([workbookXml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MapMo-社群派別統計與明細-${formatFileTimestamp()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 已匯出 Excel 活頁簿（含 3 個工作表，共 ${records.length} 筆明細）！`);
  }

  async function exportCsvData() {
    playSound('tap');
    showToast('📄 正在抓取最新紀錄並產生 CSV...');
    await refreshAdminData();

    const csvCell = (val) => `"${safeSpreadsheetString(val).replace(/"/g, '""')}"`;
    const headers = ['序號', '完成時間', '檔案編號', '派別代碼', '社群派別名稱', '相似度與影子摘要', 'Q11與五派別吻合', 'Q1-Q11作答明細', '主相似度%', '次相似度%', '參考總分(10-30)', '裝置類型', '來源網域'];
    const lines = [headers.map(csvCell).join(',')];

    statsState.records.forEach((r, idx) => {
      lines.push([
        idx + 1,
        r.createdAtLocal || r.createdAtIso,
        r.serial,
        r.personaId,
        r.personaName,
        r.emotionLabel,
        r.pathSummary,
        r.answersRaw,
        r.recordScore,
        r.awarenessScore,
        r.shareScore,
        r.deviceType,
        r.host
      ].map(csvCell).join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MapMo-社群派別逐筆明細-${formatFileTimestamp()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`📥 已匯出 CSV（共 ${statsState.records.length} 筆）！`);
  }

  // Export testable pure evaluator hook onto window.__MAPMO_QUIZ_TEST__ strictly read-only if needed
  window.__MAPMO_QUIZ_ENGINE__ = {
    SCORED_QUESTIONS,
    FINAL_QUESTION,
    PERSONA_ORDER,
    evaluateQuizResult
  };

})();
