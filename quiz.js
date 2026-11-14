/**
 * MapMo - 社群習慣心理測驗 (Social Media Habits Quiz Engine)
 * Decision Tree State Machine, Audio Synthesis, Canvas Exporter, QR Standee
 */

(function() {
  'use strict';

  // 1. 測驗題目與樹狀圖定義 (Strict Decision Tree matching PDF)
  const QUIZ_TREE = {
    q1: {
      step: 1,
      totalSteps: 4,
      category: 'Step 01 · 紀錄習慣',
      question: '看到喜歡的風景、美食或日常瞬間，你習慣隨手拍照把它記下來嗎？',
      options: [
        {
          id: 'A',
          text: '會，習慣隨手拍照把心動的片刻記錄下來 📸',
          next: 'q2',
          breadcrumb: '隨手拍照記錄'
        },
        {
          id: 'B',
          text: '沒有特別習慣，享受當下居多，很少拍照留念 🍃',
          result: 'lurker',
          breadcrumb: '享受當下很少拍照'
        }
      ]
    },
    q2: {
      step: 2,
      totalSteps: 4,
      category: 'Step 02 · 分享欲求',
      question: '紀錄下來的這些片刻，你通常會想發到社群上與大家分享嗎？',
      options: [
        {
          id: 'A',
          text: '會，想把這些生活切片發到社群上與大家分享 💬',
          next: 'q3',
          breadcrumb: '渴望社群分享'
        },
        {
          id: 'B',
          text: '我喜歡紀錄給自己看，純粹私人留存，不喜歡分享給別人 🔒',
          result: 'diarist',
          breadcrumb: '只留給自己看'
        }
      ]
    },
    q3: {
      step: 3,
      totalSteps: 4,
      category: 'Step 03 · 關注焦慮',
      question: '發文後，你會希望你的追蹤者不要第一時間注意到你的貼文嗎？',
      options: [
        {
          id: 'A',
          text: '會，不希望追蹤者第一時間注意到，想默默發佈 🤫',
          result: 'stealth',
          breadcrumb: '希望避開即時關注'
        },
        {
          id: 'B',
          text: '我不在意，發了就發了，什麼時候被看到都無所謂 🎈',
          next: 'q4',
          breadcrumb: '不在意被何時看見'
        }
      ]
    },
    q4: {
      step: 4,
      totalSteps: 4,
      category: 'Step 04 · 審美與目光',
      question: '你是否會在意他人眼光，並在發文前再三確認音樂、文案、排版等是否合適？',
      options: [
        {
          id: 'A',
          text: '我會在意，每次發文都要花很多時間調整音樂、濾鏡、排版與文案 ✨',
          result: 'curator',
          breadcrumb: '在意眼光反覆精修'
        },
        {
          id: 'B',
          text: '我不在意，不介意他人眼光，展現最真實不設限的自己 🚀',
          result: 'freespirit',
          breadcrumb: '不介意眼光隨心所欲'
        }
      ]
    }
  };

  // 2. 五大社群人格完整設定 (100% 定錨 PDF 內容)
  const PERSONAS = {
    lurker: {
      id: 'lurker',
      name: '潛水觀察派',
      tagline: '靜默漫遊的城市觀察者',
      badgeColor: '#4285F4',
      badgeBg: '#DBE5FC',
      accentColor: '#2563EB',
      emotionId: 'sad',
      emotionLabel: '哀 · 靜謐思緒',
      soulQuote: '「我不在社群大聲喧嘩，但我比誰都細膩地閱讀著這座城市的喜怒哀樂。」',
      status: '沒有特別習慣紀錄生活，但是喜歡看熟人或陌生人紀錄的生活。',
      dimensions: {
        record: { label: '紀錄生活熱情', value: 18, color: '#4285F4' },
        awareness: { label: '他人眼光敏感度', value: 20, color: '#9E9E9E' },
        share: { label: '公開分享欲求', value: 12, color: '#6366F1' }
      },
      personalityInsight: '你是最溫柔的城市讀者。比起自己發文成為焦點，你更享受在無壓力的角落默默看著熟人與陌生人的生活切片，在別人的悲歡離合裡捕捉專屬於你的微小共鳴。',
      features: {
        primary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '使用情緒篩選器，默默觀看地圖上各種情緒的貼文，找到有共鳴的回憶。'
          },
          {
            name: '收藏與AI推播',
            icon: 'heart',
            desc: '把有共鳴的回憶珍藏起來，AI根據你的珍藏推播地圖上其他使用者類似的回憶。'
          }
        ],
        secondary: [
          {
            name: '私人發文',
            icon: 'lock',
            desc: '即使很少拍照，也可以偶爾隨筆留下只給未來的自己看的安靜足跡。'
          }
        ]
      }
    },

    diarist: {
      id: 'diarist',
      name: '備忘錄日記派',
      tagline: '與自己對話的心靈收藏家',
      badgeColor: '#FBBD04',
      badgeBg: '#FCF4D9',
      accentColor: '#D97706',
      emotionId: 'joy',
      emotionLabel: '喜 · 明亮溫暖',
      soulQuote: '「生活是過給自己的，每一張照片都是我私密而珍貴的時光標本。」',
      status: '喜歡紀錄生活，但只喜歡紀錄給自己看，不喜歡分享給別人。',
      dimensions: {
        record: { label: '紀錄生活熱情', value: 92, color: '#FBBD04' },
        awareness: { label: '他人眼光敏感度', value: 15, color: '#9E9E9E' },
        share: { label: '公開分享欲求', value: 8, color: '#6366F1' }
      },
      personalityInsight: '生活是自己的作品集。你的手機相簿裡藏滿了街角的光影、好吃的晚餐與天邊的晚霞，你熱愛記錄每個動人瞬間，但不需要任何人的點讚來證明生活的美好。',
      features: {
        primary: [
          {
            name: '私人發文',
            icon: 'lock',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。讓只想紀錄，不想分享的生活也有地方安放。'
          }
        ],
        secondary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '使用情緒篩選器，默默觀看地圖上各種情緒的貼文，找到有共鳴的回憶。'
          },
          {
            name: '收藏與AI推播',
            icon: 'heart',
            desc: '把有共鳴的回憶珍藏起來，AI根據你的珍藏推播地圖上其他使用者類似的回憶。'
          }
        ]
      }
    },

    stealth: {
      id: 'stealth',
      name: '悄悄發佈派',
      tagline: '避開聚光燈的溫柔低語者',
      badgeColor: '#F48FB1',
      badgeBg: '#FDE4EF',
      accentColor: '#BE185D',
      emotionId: 'fun',
      emotionLabel: '樂 · 舒心雀躍',
      soulQuote: '「我想向世界敞開一扇窗，但只想在無人緊迫盯人的角落，靜靜等待懂我的人。」',
      status: '喜歡紀錄生活，喜歡分享，但不希望追蹤者第一時間注意到你的貼文，喜歡默默分享。',
      dimensions: {
        record: { label: '紀錄生活熱情', value: 88, color: '#F48FB1' },
        awareness: { label: '他人眼光敏感度', value: 78, color: '#EA4335' },
        share: { label: '公開分享欲求', value: 72, color: '#6366F1' }
      },
      personalityInsight: '你渴望被理解，卻又恐懼被熟人目光審視。你經常在深夜發文、或是把摯友清單刪改好幾次。MapMo 的全匿名地理發布，正是為你量身打造的社交解藥——在沒有人認識你的地圖上，放下所有包袱大膽呼吸。',
      features: {
        primary: [
          {
            name: '匿名分享',
            icon: 'user-secret',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。安心分享每一則純粹紀錄的生活和感受在Mapmo平台上，讓路過的Mapmo使用者找到與你的共鳴。'
          },
          {
            name: '私人發文',
            icon: 'lock',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。讓只想紀錄，不想分享的生活也有地方安放。'
          }
        ],
        secondary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '使用情緒篩選器，默默觀看地圖上各種情緒的貼文，找到有共鳴的回憶。'
          },
          {
            name: '收藏與AI推播',
            icon: 'heart',
            desc: '把有共鳴的回憶珍藏起來，AI根據你的珍藏推播地圖上其他使用者類似的回憶。'
          }
        ]
      }
    },

    curator: {
      id: 'curator',
      name: '精修完美派',
      tagline: '雕琢生活溫度的美學策展人',
      badgeColor: '#1C1C1E',
      badgeBg: '#E5E5EA',
      accentColor: '#6366F1',
      emotionId: 'angry',
      emotionLabel: '真 · 稜角美學',
      soulQuote: '「不是愛做作，而是每一格畫面、每一句文案，都該對得起按下快門那一刻的心動。」',
      status: '喜歡紀錄生活，喜歡分享，不會太在意別人是否第一時間注意到你的貼文，但在意別人會怎麼看，發文前會花很多時間在音樂、濾鏡、排版、文案等內容。',
      dimensions: {
        record: { label: '紀錄生活熱情', value: 96, color: '#1C1C1E' },
        awareness: { label: '他人眼光敏感度', value: 92, color: '#EA4335' },
        share: { label: '公開分享欲求', value: 86, color: '#6366F1' }
      },
      personalityInsight: '你是具有極高審美要求的策展型靈魂。發一則貼文常常要精修半小時、甚至因為文案不夠好而忍痛放棄。但請記得，真實的你已經足夠動人。MapMo 讓你的精緻被懂你的人看見，也讓你的脆弱有私人樹洞溫柔安放。',
      features: {
        primary: [
          {
            name: '匿名分享',
            icon: 'user-secret',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。安心分享每一則純粹紀錄的生活和感受在Mapmo平台上，讓路過的Mapmo使用者找到與你的共鳴。'
          },
          {
            name: '私人發文',
            icon: 'lock',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。讓只想紀錄，不想分享的生活也有地方安放。'
          }
        ],
        secondary: [
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '使用情緒篩選器，默默觀看地圖上各種情緒的貼文，找到有共鳴的回憶。'
          },
          {
            name: '收藏與AI推播',
            icon: 'heart',
            desc: '把有共鳴的回憶珍藏起來，AI根據你的珍藏推播地圖上其他使用者類似的回憶。'
          }
        ]
      }
    },

    freespirit: {
      id: 'freespirit',
      name: '隨心所欲派',
      tagline: '率真自由的真實生活家',
      badgeColor: '#30D158',
      badgeBg: '#E8FBEB',
      accentColor: '#EA4335',
      emotionId: 'joy',
      emotionLabel: '喜與樂 · 自由肆意',
      soulQuote: '「不迎合、不討好、不設限！這就是最真實、最滾燙、最不加濾鏡的我。」',
      status: '喜歡紀錄生活，喜歡分享，不介意他人眼光，展現最真實不設限的自己。',
      dimensions: {
        record: { label: '紀錄生活熱情', value: 85, color: '#30D158' },
        awareness: { label: '他人眼光敏感度', value: 10, color: '#9E9E9E' },
        share: { label: '公開分享欲求', value: 95, color: '#EA4335' }
      },
      personalityInsight: '你是社群裡稀缺的明朗太陽。你不被世俗定義拘束，想到什麼拍什麼、想說什麼說什麼。你的坦蕩與純粹，能為路過你足跡的每個孤單靈魂注入滿滿的元氣！',
      features: {
        primary: [
          {
            name: '匿名分享',
            icon: 'user-secret',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。安心分享每一則純粹紀錄的生活和感受在Mapmo平台上，讓路過的Mapmo使用者找到與你的共鳴。'
          }
        ],
        secondary: [
          {
            name: '私人發文',
            icon: 'lock',
            desc: '紀錄生活與情緒，讓日後回顧這些回憶可以更具體。讓只想紀錄，不想分享的生活也有地方安放。'
          },
          {
            name: '情緒地圖',
            icon: 'map-marked-alt',
            desc: '使用情緒篩選器，默默觀看地圖上各種情緒的貼文，找到有共鳴的回憶。'
          },
          {
            name: '收藏與AI推播',
            icon: 'heart',
            desc: '把有共鳴的回憶珍藏起來，AI根據你的珍藏推播地圖上其他使用者類似的回憶。'
          }
        ]
      }
    }
  };

  // 3. 狀態管理器
  let currentQuestionId = 'q1';
  let historyStack = []; // 歷程返回堆疊
  let currentResult = null;
  let isSoundEnabled = true;

  // 4. Web Audio API 音效合成引擎 (零依賴純程式音效)
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

  let rainAudioNodes = null;

  function startRainAudio() {
    if (!isSoundEnabled || rainAudioNodes) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const duration = 2.5;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // 柔和粉紅/棕色雜訊濾波，呈現清澈自然細雨沙沙聲
        lastOut = (lastOut + 0.04 * white) / 1.04;
        data[i] = lastOut * 2.2 + white * 0.14;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1450, ctx.currentTime);

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(260, ctx.currentTime);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.45);

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(masterGain);
      masterGain.connect(ctx.destination);
      source.start(ctx.currentTime);

      rainAudioNodes = { source, masterGain, ctx };
    } catch (_) {}
  }

  function stopRainAudio() {
    if (!rainAudioNodes) return;
    try {
      const { source, masterGain, ctx } = rainAudioNodes;
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value), now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      source.stop(now + 0.30);
    } catch (_) {}
    rainAudioNodes = null;
  }

  function updateRainAudioState() {
    const isModalOpen = standeeModal && standeeModal.classList.contains('open');
    if (isSoundEnabled && isModalOpen && typeof treeQrState !== 'undefined' && treeQrState.isRainEnabled) {
      startRainAudio();
    } else {
      stopRainAudio();
    }
  }

  function playSound(type, extraIndex = 0) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 輔助：合成樹葉沙沙聲 (Filtered White Noise)
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
        gain.gain.setValueAtTime(0.12, now);
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
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'treeToQr') {
        // 樹葉飄落化為 QR 磚塊：清脆樹葉沙沙聲 + 下行接上行的水晶木琴琶音
        playLeafRustle(0.52, 0.09, 1900);
        const notes = [880, 783.99, 659.25, 587.33, 523.25, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === notes.length - 1 ? 'sine' : 'triangle';
          const t0 = now + i * 0.055;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.11, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.24);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.25);
        });
      } else if (type === 'qrToTree') {
        // QR 磚塊升起綻放成大樹：溫潤木質基底音 + 向上綻放豎琴和弦 + 微風樹葉聲
        playLeafRustle(0.48, 0.07, 1400);
        const woodOsc = ctx.createOscillator();
        const woodGain = ctx.createGain();
        woodOsc.type = 'sine';
        woodOsc.frequency.setValueAtTime(160, now);
        woodOsc.frequency.exponentialRampToValueAtTime(310, now + 0.14);
        woodGain.gain.setValueAtTime(0.15, now);
        woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        woodOsc.connect(woodGain);
        woodGain.connect(ctx.destination);
        woodOsc.start(now);
        woodOsc.stop(now + 0.17);

        const bloomNotes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
        bloomNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t0 = now + 0.04 + i * 0.052;
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.095, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.34);
        });
      } else if (type === 'seasonChange') {
        playLeafRustle(0.28, 0.06, 2100);
        const chords = [
          [659.25, 880, 1046.5],   // Spring: 明亮鳥鳴三音
          [523.25, 659.25, 783.99], // Summer: 飽滿陽光大三和弦
          [440, 554.37, 659.25]     // Autumn: 溫潤秋日木質和弦
        ];
        const notes = chords[extraIndex % 3] || chords[0];
        notes.forEach((freq, i) => {
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
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'rainToggle') {
        // 水滴清脆共振叮咚聲
        const drops = extraIndex ? [784, 1046.5, 1318.5] : [659.25, 493.88];
        drops.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const t0 = now + idx * 0.065;
          osc.frequency.setValueAtTime(f * 0.9, t0);
          osc.frequency.exponentialRampToValueAtTime(f * 1.25, t0 + 0.08);
          gain.gain.setValueAtTime(0.10, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.20);
        });
      } else if (type === 'success') {
        // 和弦音效 C5, E5, G5, C6
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, idx) => {
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

  // 5. DOM 元素快取
  let screenStart, screenQuiz, screenAnalyzing, screenResult;
  let qProgressFill, qStepIndicator, qBackBtn, qBreadcrumbTracker;
  let qCategoryTag, qPromptText, qOptionsContainer;
  let standeeModal, standeeQrHolder, cardFooterQrHolder;
  let soundToggleBtn, standeeOpenBtn;

  // 6. 初始化進入點
  document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    bindEvents();
    renderFixedQRCodes();
  });

  function cacheDOMElements() {
    screenStart = document.getElementById('screenStart');
    screenQuiz = document.getElementById('screenQuiz');
    screenAnalyzing = document.getElementById('screenAnalyzing');
    screenResult = document.getElementById('screenResult');

    qProgressFill = document.getElementById('qProgressFill');
    qStepIndicator = document.getElementById('qStepIndicator');
    qBackBtn = document.getElementById('qBackBtn');
    qBreadcrumbTracker = document.getElementById('qBreadcrumbTracker');
    qCategoryTag = document.getElementById('qCategoryTag');
    qPromptText = document.getElementById('qPromptText');
    qOptionsContainer = document.getElementById('qOptionsContainer');

    standeeModal = document.getElementById('standeeModal');
    standeeQrHolder = document.getElementById('standeeQrHolder');
    cardFooterQrHolder = document.getElementById('cardFooterQrHolder');

    soundToggleBtn = document.getElementById('soundToggleBtn');
    standeeOpenBtn = document.getElementById('standeeOpenBtn');
  }

  function bindEvents() {
    // 開始測驗
    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        playSound('tap');
        startQuiz();
      });
    }

    // 回上一題
    if (qBackBtn) {
      qBackBtn.addEventListener('click', () => {
        playSound('whoosh');
        goBackStep();
      });
    }

    // 重新測驗
    const restartBtn = document.getElementById('btnRestartQuiz');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        playSound('tap');
        restartQuiz();
      });
    }

    // 複製連結
    const copyLinkBtn = document.getElementById('btnCopyQuizLink');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        copyQuizLink();
      });
    }

    // 下載結果圖片 (2X Retina Canvas)
    const downloadImgBtn = document.getElementById('btnDownloadResultImg');
    if (downloadImgBtn) {
      downloadImgBtn.addEventListener('click', () => {
        exportResultCardImage();
      });
    }

    // 音效切換
    if (soundToggleBtn) {
      soundToggleBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggleBtn.innerHTML = isSoundEnabled
          ? '<i class="fas fa-volume-up"></i> 音效開啟'
          : '<i class="fas fa-volume-mute"></i> 音效關閉';
        soundToggleBtn.classList.toggle('active', isSoundEnabled);
        updateRainAudioState();
        if (isSoundEnabled) playSound('tap');
      });
    }

    // 展覽立牌 Modal 彈窗開關
    if (standeeOpenBtn) {
      standeeOpenBtn.addEventListener('click', () => {
        playSound('tap');
        openStandeeModal();
      });
    }

    const standeeCloseBtn = document.getElementById('standeeCloseBtn');
    if (standeeCloseBtn) {
      standeeCloseBtn.addEventListener('click', () => {
        closeStandeeModal();
      });
    }

    if (standeeModal) {
      standeeModal.addEventListener('click', (e) => {
        if (e.target === standeeModal) closeStandeeModal();
      });
    }

    // 立牌直接列印
    const btnPrintStandee = document.getElementById('btnPrintStandee');
    if (btnPrintStandee) {
      btnPrintStandee.addEventListener('click', () => {
        // 列印前確保切換至正面可掃描之像素花園 QR Code 模式
        setTreeQrMode('qr', true);
        setTimeout(() => {
          window.print();
        }, 120);
      });
    }

    // 立牌下載高解析像素花園 QR Code
    const btnDownloadQR = document.getElementById('btnDownloadQR');
    if (btnDownloadQR) {
      btnDownloadQR.addEventListener('click', () => {
        downloadPureQRCode();
      });
    }

    // 下載當前畫面 (3D 小樹或 QR Code)
    const btnDownloadTreeView = document.getElementById('btnDownloadTreeView');
    if (btnDownloadTreeView) {
      btnDownloadTreeView.addEventListener('click', () => {
        downloadCurrentTreeCanvas();
      });
    }

    // 初始化 3D 情緒樹 ⇄ 像素花園 QR Code 互動工作室
    initTreeQrStudio();

    // 行動版漢堡選單切換
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navLinks.classList.toggle('open');
      });
    }
  }

  // 7. 流程切換核心
  function switchScreen(targetScreen) {
    [screenStart, screenQuiz, screenAnalyzing, screenResult].forEach(s => {
      if (s) {
        s.classList.remove('active');
        s.style.display = 'none';
      }
    });

    if (targetScreen) {
      targetScreen.style.display = 'flex';
      setTimeout(() => {
        targetScreen.classList.add('active');
      }, 20);
    }
  }

  function startQuiz() {
    currentQuestionId = 'q1';
    historyStack = [];
    currentResult = null;
    switchScreen(screenQuiz);
    renderQuestion(currentQuestionId);
  }

  function restartQuiz() {
    switchScreen(screenStart);
  }

  function renderQuestion(qId) {
    const qData = QUIZ_TREE[qId];
    if (!qData) return;

    currentQuestionId = qId;

    // 進度條
    const percent = ((qData.step - 1) / qData.totalSteps) * 100 + 25;
    if (qProgressFill) qProgressFill.style.width = `${Math.min(100, percent)}%`;
    if (qStepIndicator) qStepIndicator.textContent = `Q${qData.step} / ${qData.totalSteps}`;

    // 返回按鈕狀態
    if (qBackBtn) {
      qBackBtn.style.visibility = historyStack.length > 0 ? 'visible' : 'hidden';
    }

    // 決策路徑追蹤 (Breadcrumbs)
    renderBreadcrumbs();

    // 題目文案
    if (qCategoryTag) qCategoryTag.textContent = qData.category;
    if (qPromptText) qPromptText.textContent = qData.question;

    // 選項渲染
    if (qOptionsContainer) {
      qOptionsContainer.innerHTML = '';
      qData.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `
          <div class="quiz-option-content">
            <div class="quiz-option-badge">${opt.id}</div>
            <div class="quiz-option-text">${opt.text}</div>
          </div>
          <div class="quiz-option-arrow"><i class="fas fa-chevron-right"></i></div>
        `;
        btn.addEventListener('click', () => {
          handleOptionSelect(qId, opt);
        });
        qOptionsContainer.appendChild(btn);
      });
    }
  }

  function handleOptionSelect(qId, option) {
    playSound('tap');

    // 記錄歷程
    historyStack.push({
      questionId: qId,
      optionId: option.id,
      breadcrumb: option.breadcrumb
    });

    if (option.next) {
      // 進入下一題
      playSound('whoosh');
      renderQuestion(option.next);
    } else if (option.result) {
      // 命中結果！進入演算過渡
      triggerAnalyzing(option.result);
    }
  }

  function goBackStep() {
    if (historyStack.length === 0) return;
    const last = historyStack.pop();
    renderQuestion(last.questionId);
  }

  function renderBreadcrumbs() {
    if (!qBreadcrumbTracker) return;
    if (historyStack.length === 0) {
      qBreadcrumbTracker.innerHTML = '<span class="path-node">測驗起點</span> <span class="path-arrow">➔</span> <span class="path-node" style="color: #6366F1;">探索中...</span>';
      return;
    }

    let html = '';
    historyStack.forEach((h, i) => {
      html += `<span class="path-node">${h.breadcrumb}</span>`;
      html += ' <span class="path-arrow">➔</span> ';
    });
    html += '<span class="path-node" style="color: #6366F1;">當前選擇</span>';
    qBreadcrumbTracker.innerHTML = html;
  }

  // 8. 心理演算過渡
  function triggerAnalyzing(personaId) {
    currentResult = PERSONAS[personaId];
    switchScreen(screenAnalyzing);

    const subText = document.getElementById('analyzingSubtext');
    const texts = [
      '正在比對 5 大社群性格光譜...',
      '正在計算他人眼光與紀錄特質維度...',
      '正在為您匹配專屬 MapMo 心靈避風港...'
    ];

    let tIdx = 0;
    const interval = setInterval(() => {
      tIdx++;
      if (tIdx < texts.length && subText) {
        subText.textContent = texts[tIdx];
      }
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      playSound('success');
      renderResult(currentResult);
      switchScreen(screenResult);
    }, 1300);
  }

  // 9. 渲染結果頁
  function renderResult(persona) {
    if (!persona) return;

    // 頂部流水號
    const serialEl = document.getElementById('polaroidSerial');
    if (serialEl) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      serialEl.textContent = `NO. ${persona.id.toUpperCase()}-${randNum}`;
    }

    // 徽章與色彩
    const badgeEl = document.getElementById('personaBadgePill');
    if (badgeEl) {
      badgeEl.style.backgroundColor = persona.badgeColor;
      badgeEl.innerHTML = `<i class="fas fa-sparkles"></i> ${persona.emotionLabel}`;
    }

    // 主標題與副標
    const titleEl = document.getElementById('personaMainTitle');
    if (titleEl) {
      titleEl.textContent = `｜${persona.name}｜`;
      titleEl.style.color = persona.badgeColor;
    }

    const taglineEl = document.getElementById('personaTagline');
    if (taglineEl) taglineEl.textContent = persona.tagline;

    // 靈魂金句
    const soulQuoteEl = document.getElementById('personaSoulQuote');
    if (soulQuoteEl) {
      soulQuoteEl.textContent = persona.soulQuote;
      const box = document.getElementById('personaSoulQuoteBox');
      if (box) box.style.borderLeftColor = persona.badgeColor;
    }

    // 社群現狀
    const statusEl = document.getElementById('personaStatusText');
    if (statusEl) statusEl.textContent = persona.status;

    // 隱藏性格解析
    const insightEl = document.getElementById('personaInsightText');
    if (insightEl) insightEl.textContent = persona.personalityInsight;

    // 三維特質能量條
    renderDimensionBar('dimRecord', persona.dimensions.record);
    renderDimensionBar('dimAwareness', persona.dimensions.awareness);
    renderDimensionBar('dimShare', persona.dimensions.share);

    // 適合功能列表
    renderFeaturesList(persona.features);

    // 重新渲染底部的卡片 QR Code
    renderCardFooterQR();
  }

  function renderDimensionBar(prefix, dimData) {
    const labelEl = document.getElementById(`${prefix}Label`);
    const valEl = document.getElementById(`${prefix}Val`);
    const fillEl = document.getElementById(`${prefix}Fill`);
    if (labelEl) labelEl.textContent = dimData.label;
    if (valEl) valEl.textContent = `${dimData.value}%`;
    if (fillEl) {
      fillEl.style.backgroundColor = dimData.color;
      fillEl.style.width = '0%';
      setTimeout(() => {
        fillEl.style.width = `${dimData.value}%`;
      }, 100);
    }
  }

  function renderFeaturesList(features) {
    const listEl = document.getElementById('personaFeaturesList');
    if (!listEl) return;
    listEl.innerHTML = '';

    // 主要推薦
    features.primary.forEach(f => {
      const card = createFeatureCard(f, '主要適合', 'primary');
      listEl.appendChild(card);
    });

    // 次要推薦
    if (features.secondary && features.secondary.length > 0) {
      features.secondary.forEach(f => {
        const card = createFeatureCard(f, '次要推薦', 'secondary');
        listEl.appendChild(card);
      });
    }
  }

  function createFeatureCard(feature, badgeText, badgeClass) {
    const div = document.createElement('div');
    div.className = 'feature-match-card';
    div.innerHTML = `
      <div class="feature-badge-row">
        <div class="feature-name">
          <i class="fas fa-${feature.icon}" style="color: #6366F1; margin-right: 4px;"></i>
          ${feature.name}
        </div>
        <span class="feature-type-chip ${badgeClass}">${badgeText}</span>
      </div>
      <div class="feature-desc">${feature.desc}</div>
    `;
    return div;
  }

  // 10. 3D 情緒樹 ⇄ 像素花園 QR Code 互動生成引擎 (V5: 360°自由旋轉 · 精雕樹幹 · 細雨漣漪 · 因果連線落葉)
  const FIXED_QUIZ_GITHUB_URL = 'https://chen1an.github.io/mapmo-quiz/';

  // 6 種調色盤定義：飽和立體明暗 5 階 + 同色系 QR 磚塊色階
  const TREE_QR_PALETTES = {
    pink: {
      label: '櫻花粉 (樂)',
      foliage: ['#A83854', '#BF4866', '#D45A79', '#E6718F', '#F28AA5'],
      qrTiles: ['#BF4866', '#D45A79', '#E6718F', '#A83854']
    },
    purple: {
      label: '薰衣草紫',
      foliage: ['#462BA8', '#593DC2', '#6E52DB', '#846AEB', '#9A83F5'],
      qrTiles: ['#593DC2', '#6E52DB', '#846AEB', '#462BA8']
    },
    red: {
      label: '楓葉紅 (怒)',
      foliage: ['#8F1D15', '#AD2920', '#C9382E', '#DF4F45', '#EF695E'],
      qrTiles: ['#AD2920', '#C9382E', '#DF4F45', '#8F1D15']
    },
    yellow: {
      label: '暖陽金 (喜)',
      foliage: ['#946103', '#B07609', '#C98A12', '#E0A122', '#F0B838'],
      qrTiles: ['#B07609', '#C98A12', '#E0A122', '#946103']
    },
    blue: {
      label: '晴空藍 (哀)',
      foliage: ['#214E8F', '#3062AB', '#4278C4', '#588FD9', '#70A6EC'],
      qrTiles: ['#3062AB', '#4278C4', '#588FD9', '#214E8F']
    },
    grey: {
      label: '銀霧白 / 暮灰 (無)',
      foliage: ['#536373', '#667788', '#7A8C9E', '#8FA2B3', '#A6B7C7'],
      qrTiles: ['#536373', '#667788', '#7A8C9E', '#445361']
    }
  };

  // 季節草地與定位框配色：春（嫩綠+繁花）、夏（深翠綠+高茂密草叢+流螢）、秋（金橘紅+落楓地毯）
  const SEASON_THEMES = {
    spring: {
      grass: ['#669E34', '#7AB542', '#8EC754', '#A2D468'],
      earth: ['#85684A', '#6E5338'],
      slabGrassLeft: '#8EC754',
      slabGrassRight: '#72A83C',
      grassScale: 0.92,
      accentType: 'flowers',
      accentColors: ['#FF6B8B', '#FFD166', '#FFFFFF', '#C98BFF']
    },
    summer: {
      grass: ['#1E5918', '#2A6E22', '#38872E', '#4DA13B'],
      earth: ['#634B32', '#4F3A25'],
      slabGrassLeft: '#38872E',
      slabGrassRight: '#24631C',
      grassScale: 1.75,
      accentType: 'fireflies',
      accentColors: ['#E6FF66', '#B8F553', '#FFF599', '#8AE65C']
    },
    autumn: {
      grass: ['#9E5B1B', '#BA7322', '#D48E2B', '#E6A938'],
      earth: ['#754B29', '#5C381C'],
      slabGrassLeft: '#D48E2B',
      slabGrassRight: '#AD681E',
      grassScale: 1.05,
      accentType: 'maple',
      accentColors: ['#C93B2B', '#E05A2B', '#EB8A28', '#F2B438']
    }
  };

  // 11 個連貫交疊、有機錯落的大樹冠分枝團塊 (Canopy Boughs)
  // 每個主團搭配獨立一級/二級分枝條屬性，從 360° 任何角度旋轉都能看見立體樹枝骨架
  const TREE_BOUGHS = [
    { u: -0.05, v: -0.05, h: 254, rx: 0.34, ry: 0.34, rh: 34, drawBranch: true,  branchStartH: 108, branchW: 5.5, branchEndFrac: 0.45 }, // 0: 樹頂主峰冠冕
    { u: -0.28, v: 0.04,  h: 214, rx: 0.38, ry: 0.35, rh: 32, drawBranch: true,  branchStartH: 102, branchW: 7.2, branchEndFrac: 0.60 }, // 1: 上左主冠
    { u: 0.16,  v: -0.26, h: 222, rx: 0.38, ry: 0.35, rh: 32, drawBranch: true,  branchStartH: 104, branchW: 7.2, branchEndFrac: 0.60 }, // 2: 上右主冠
    { u: -0.34, v: -0.34, h: 184, rx: 0.44, ry: 0.42, rh: 32, drawBranch: true,  branchStartH: 95,  branchW: 6.4, branchEndFrac: 0.58 }, // 3: 後方濃密背光核心
    { u: -0.04, v: -0.04, h: 188, rx: 0.42, ry: 0.40, rh: 32, drawBranch: false },                                                        // 4: 中央遮蔭樹心層
    { u: -0.68, v: 0.32,  h: 138, rx: 0.38, ry: 0.36, rh: 30, drawBranch: true,  branchStartH: 82,  branchW: 9.2, branchEndFrac: 0.74 }, // 5: 左側寬闊伸展大翼
    { u: 0.58,  v: -0.60, h: 146, rx: 0.38, ry: 0.36, rh: 30, drawBranch: true,  branchStartH: 86,  branchW: 9.2, branchEndFrac: 0.74 }, // 6: 右側寬闊伸展大翼
    { u: -0.40, v: 0.24,  h: 166, rx: 0.36, ry: 0.34, rh: 28, drawBranch: false },                                                        // 7: 中左橋接冠
    { u: 0.36,  v: -0.24, h: 174, rx: 0.36, ry: 0.34, rh: 28, drawBranch: false },                                                        // 8: 中右橋接冠
    { u: -0.22, v: 0.48,  h: 148, rx: 0.32, ry: 0.30, rh: 26, drawBranch: true,  branchStartH: 94,  branchW: 6.8, branchEndFrac: 0.64 }, // 9: 左前自然垂枝
    { u: 0.48,  v: 0.06,  h: 162, rx: 0.32, ry: 0.30, rh: 26, drawBranch: true,  branchStartH: 96,  branchW: 6.5, branchEndFrac: 0.62 }  // 10: 右前較高層冠
  ];

  // 5 條放射狀抓地立體樹根 (Flared 3D Roots)
  const TREE_ROOTS = [
    { angle: 0.35, len: 0.26, startH: 26, width: 12.5 },
    { angle: 1.55, len: 0.24, startH: 24, width: 11.5 },
    { angle: 2.75, len: 0.25, startH: 25, width: 11.0 },
    { angle: 4.05, len: 0.23, startH: 24, width: 11.0 },
    { angle: 5.25, len: 0.24, startH: 25, width: 11.5 }
  ];

  let treeQrState = {
    url: FIXED_QUIZ_GITHUB_URL,
    mode: 'tree',         // 'tree' (morphTime -> 0) | 'qr' (morphTime -> 1)
    morphTime: 0,         // 三幕劇舞台劇線性時間軸 (0 -> 1, ~1.55 秒)
    morphP: 0,            // 同步相容欄位
    targetP: 0,
    season: 'spring',
    colorKey: 'pink',
    isRainEnabled: false, // 下雨特效開關
    userYaw: 0,           // 360° 使用者旋轉弧度
    yawVelocity: 0,       // 放開滑鼠後的慣性角速度
    isDragging: false,
    pointerStartX: 0,
    lastPointerX: 0,
    dragDistance: 0,
    lastSortedAngle: 999,
    qrModel: null,
    leafParticles: [],
    grassBlades: [],
    seasonAccents: [],
    floatingPetals: [],
    rainDrops: [],        // 3D 空間雨絲粒子池
    rainRipples: [],      // 地面水波橢圓漣漪池
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

  // 建立 QR 矩陣與 3D 粒子/雨水系統
  function rebuildQrAndTreeGeometry(urlText) {
    if (typeof QRCode === 'undefined' || !QRCode.QRCodeModel) return;
    const text = (urlText || FIXED_QUIZ_GITHUB_URL).trim();
    const model = new QRCode.QRCodeModel(-1, QRCode.CorrectLevel.H);
    model.addData(text);
    model.make();
    treeQrState.qrModel = model;

    if (treeQrState.grassBlades.length === 0) {
      generateProceduralTreeGeometry();
    }
    rebuildLeafParticlesFromQrModel(model);
  }

  // 建立 1:1 QR 磚塊對應葉片粒子，並依波浪次序與團塊分佈編排落葉序列
  function rebuildLeafParticlesFromQrModel(model) {
    const count = model.getModuleCount();
    const subCount = count * 2;
    const particles = [];
    let idx = 0;

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (isFinderModule(r, c, count)) continue;
        if (!model.isDark(r, c)) continue;

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
                if (d < bestScore) {
                  bestScore = d;
                  boughIdx = bi;
                }
              }
            }
            const bough = TREE_BOUGHS[boughIdx];

            const theta = hash2D(gr, gc, 17) * Math.PI * 2;
            const phi = Math.acos(2 * hash2D(gr, gc, 23) - 1);
            const shellR = 0.35 + Math.pow(hash2D(gr, gc, 29), 0.45) * 0.65;

            const dx = Math.sin(phi) * Math.cos(theta) * shellR;
            const dy = Math.sin(phi) * Math.sin(theta) * shellR;
            const dz = Math.cos(phi) * shellR;

            let treeU = bough.u + dx * bough.rx;
            let treeV = bough.v + dy * bough.ry;
            let treeH = bough.h + dz * bough.rh;

            // 環繞 360° 的中央樹幹走廊保護 (距離主幹軸心半徑 < 0.22 且低於 132 者上移至上層枝條)
            const distFromAxis = Math.hypot(treeU, treeV);
            if (distFromAxis < 0.22 && treeH < 132) {
              treeH = 136 + hash2D(gr, gc, 37) * 28;
            }

            const localLight = dz * 0.58 - (dx + dy) * 0.30 + (treeH - 125) / 145 * 0.42 + (hash2D(gr, gc, 41) - 0.5) * 0.22;
            const shadeIdx = Math.max(0, Math.min(4, Math.floor((localLight + 0.55) * 3.85)));

            const leafW = 7.6 + hash2D(gr, gc, 53) * 4.6;
            const leafH = 5.5 + hash2D(gr, gc, 61) * 3.4;

            // 有序「由外圍垂枝 → 中心頂梢」波浪式飄落時間，強烈連結落葉與地面格子的歸屬感
            const outerFirst = Math.max(0, 1 - Math.min(1, radial / 1.05));
            const lowFirst = Math.max(0, Math.min(1, (treeH - 110) / 160));
            const waveDelay = outerFirst * 0.45 + lowFirst * 0.35 + hash2D(gr, gc, 71) * 0.20;
            const swirlSign = hash2D(gr, gc, 83) > 0.5 ? 1 : -1;

            particles.push({
              r, c, sr, sc, gr, gc,
              u0, v0, u1, v1, qrU, qrV,
              treeU, treeV, treeH,
              viewDepth: treeU + treeV,
              isBehindTrunk: false,
              shadeIdx, leafW, leafH,
              waveDelay, swirlSign,
              seed: idx
            });
          }
        }
      }
    }

    treeQrState.leafParticles = particles;
    treeQrState.lastSortedAngle = 999; // 強制下一幀依實際視角排序
  }

  function generateProceduralTreeGeometry() {
    // 1. 生成 3 個定位角與四周邊框的 3D 搖曳草叢 (280 株)
    const blades = [];
    for (let i = 0; i < 280; i++) {
      let u = 0, v = 0;
      const mode = i % 7;
      if (mode === 0) {
        u = -0.96 + hash2D(i, 11, 77) * 0.46;
        v = -0.96 + hash2D(i, 22, 88) * 0.46;
      } else if (mode === 1) {
        u = 0.50 + hash2D(i, 11, 77) * 0.46;
        v = -0.96 + hash2D(i, 22, 88) * 0.46;
      } else if (mode === 2) {
        u = -0.96 + hash2D(i, 11, 77) * 0.46;
        v = 0.50 + hash2D(i, 22, 88) * 0.46;
      } else if (mode === 3) {
        u = -0.94 + hash2D(i, 11, 77) * 1.88;
        v = -0.96 + hash2D(i, 22, 88) * 0.18;
      } else if (mode === 4) {
        u = -0.94 + hash2D(i, 11, 77) * 1.88;
        v = 0.78 + hash2D(i, 22, 88) * 0.18;
      } else if (mode === 5) {
        u = -0.96 + hash2D(i, 11, 77) * 0.18;
        v = -0.94 + hash2D(i, 22, 88) * 1.88;
      } else {
        u = 0.78 + hash2D(i, 11, 77) * 0.18;
        v = -0.94 + hash2D(i, 22, 88) * 1.88;
      }
      const height = 11 + hash2D(i, 33, 99) * 16;
      const lean = (hash2D(i, 44, 11) - 0.5) * 11;
      const shade = Math.floor(hash2D(i, 55, 22) * 4);
      blades.push({ u, v, height, lean, shade, phase: hash2D(i, 66, 33) * Math.PI * 2 });
    }
    treeQrState.grassBlades = blades;

    // 2. 季節專屬地面與草叢點綴 (春花 / 夏螢 / 秋楓)
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

    // 3. 空中飄落花瓣動態
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

    // 4. 預先配置 3D 雨絲粒子池與地面等距水波漣漪池
    const drops = [];
    for (let i = 0; i < 72; i++) {
      drops.push({
        u: (hash2D(i, 121, 13) - 0.5) * 2.5,
        v: (hash2D(i, 122, 17) - 0.5) * 2.5,
        h: hash2D(i, 123, 19) * 320,
        speed: 340 + hash2D(i, 124, 23) * 150,
        len: 14 + hash2D(i, 125, 29) * 14,
        alpha: 0.25 + hash2D(i, 126, 31) * 0.35
      });
    }
    treeQrState.rainDrops = drops;

    const ripples = [];
    for (let i = 0; i < 22; i++) {
      ripples.push({
        u: (hash2D(i, 131, 37) - 0.5) * 1.85,
        v: (hash2D(i, 132, 41) - 0.5) * 1.85,
        age: hash2D(i, 133, 43) * 0.85,
        maxAge: 0.55 + hash2D(i, 134, 47) * 0.35,
        active: true
      });
    }
    treeQrState.rainRipples = ripples;
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
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const bl = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function getModuleSubPixelColor(r, c, sr, sc, count, isDark, palette, seasonTheme) {
    const h = hash2D(r * 2 + sr, c * 2 + sc, 101);
    if (!isDark) {
      return h > 0.55 ? '#EFECE4' : '#E7E3D9';
    }
    if (isFinderModule(r, c, count)) {
      const isEdge = (r === 0 || r === 6 || c === 0 || c === 6 || r === count - 7 || r === count - 1 || c === count - 7 || c === count - 1);
      if (isEdge && h < 0.28) {
        return seasonTheme.earth[h < 0.14 ? 0 : 1];
      }
      const gIdx = Math.min(3, Math.floor(h * 4));
      return seasonTheme.grass[gIdx];
    }
    const cIdx = Math.min(3, Math.floor(h * 4));
    return palette.qrTiles[cIdx];
  }

  // 繪製實心漸細貝茲樹枝（基底粗、末梢細，帶暗部樹皮與上方迎光木紋邊緣）
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
      if (highlightColor) {
        hiPts.push([x + nx * halfW * 0.35 - 0.8, y + ny * halfW * 0.35 - 1.0]);
      }
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

  // 繪製精雕細琢的 3D 盤根樹紋立體樹幹、動態旋轉樹洞與雙層漸細分枝系統
  function drawArtisanalTrunkAndBranches3D(ctx, project, angle, cosA, sinA, treeScale, seasonTheme) {
    const trunkBase = project(0, 0, 0);
    const trunkLower = project(0, 0, 32 * treeScale);
    const trunkMid = project(0, 0, 68 * treeScale);
    const trunkTop = project(0, 0, 114 * treeScale);

    // 1. 地面柔和投射樹影
    ctx.fillStyle = 'rgba(46, 28, 18, 0.20)';
    ctx.beginPath();
    ctx.ellipse(trunkBase.x, trunkBase.y + 3 * treeScale, 42 * treeScale, 18 * treeScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 依當前視角排序 5 條放射狀抓地樹根 (viewY < 0 的背面樹根先畫)
    const sortedRoots = TREE_ROOTS.map((rt) => {
      const ru = Math.cos(rt.angle) * rt.len;
      const rv = Math.sin(rt.angle) * rt.len;
      const viewY = ru * sinA + rv * cosA;
      return { ...rt, ru, rv, viewY };
    }).sort((a, b) => a.viewY - b.viewY);

    const drawRoot = (rt) => {
      const pStart = project(rt.ru * 0.14 * treeScale, rt.rv * 0.14 * treeScale, rt.startH * treeScale);
      const pCtrl = project(rt.ru * 0.55 * treeScale, rt.rv * 0.55 * treeScale, (rt.startH * 0.35) * treeScale);
      const pEnd = project(rt.ru * treeScale, rt.rv * treeScale, 0.5 * treeScale);
      drawTaperedLimb3D(ctx, pStart, pCtrl, pEnd, rt.width * treeScale, 2.2 * treeScale, '#3D2416', '#69432B');

      // 根尖嵌入土縫處點綴兩簇有機草葉，讓樹根自然埋入地表而非突兀方塊
      ctx.strokeStyle = seasonTheme.grass[1];
      ctx.lineWidth = Math.max(1.2, 1.5 * treeScale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pEnd.x - 1 * treeScale, pEnd.y);
      ctx.quadraticCurveTo(pEnd.x - 3 * treeScale, pEnd.y - 4 * treeScale, pEnd.x - 4 * treeScale, pEnd.y - 6.5 * treeScale);
      ctx.moveTo(pEnd.x + 1.5 * treeScale, pEnd.y + 0.5 * treeScale);
      ctx.quadraticCurveTo(pEnd.x + 3.5 * treeScale, pEnd.y - 3.5 * treeScale, pEnd.x + 4.5 * treeScale, pEnd.y - 5.5 * treeScale);
      ctx.stroke();
    };

    // 先畫背面樹根
    sortedRoots.filter(r => r.viewY < 0).forEach(drawRoot);

    // 計算並排序所有 1 級與 2 級枝條，使遠方枝幹位於主幹後、前方枝幹朝觀者伸出
    const branchQueue = [];
    TREE_BOUGHS.forEach((b, bIdx) => {
      if (!b.drawBranch) return;
      const frac = b.branchEndFrac || 0.62;
      const p0 = project(0, 0, b.branchStartH * treeScale);
      const eu = b.u * frac;
      const ev = b.v * frac;
      const p1 = project(eu * 0.45 * treeScale, ev * 0.45 * treeScale, (b.branchStartH + (b.h - 26 - b.branchStartH) * 0.48) * treeScale);
      const p2 = project(eu * treeScale, ev * treeScale, (b.h - 26) * treeScale);
      const viewY = eu * sinA + ev * cosA;
      branchQueue.push({ p0, p1, p2, wStart: b.branchW * treeScale, wEnd: 2.6 * treeScale, viewY, b, bIdx, isPrimary: true });

      // 為主要大側枝加上 2 條優雅分岔小枝 (Secondary Twigs)
      if (b.branchW >= 6.5) {
        const perpU = -ev * 0.32;
        const perpV = eu * 0.32;
        const twigMidU = eu * 0.62;
        const twigMidV = ev * 0.62;
        const twigMidH = b.branchStartH + (b.h - 26 - b.branchStartH) * 0.65;
        const tp0 = project(twigMidU * treeScale, twigMidV * treeScale, twigMidH * treeScale);
        const tpCtrl = project((eu * 0.85 + perpU * 0.5) * treeScale, (ev * 0.85 + perpV * 0.5) * treeScale, (b.h - 20) * treeScale);
        const tpEnd = project((eu + perpU) * treeScale, (ev + perpV) * treeScale, (b.h - 12) * treeScale);
        branchQueue.push({ p0: tp0, p1: tpCtrl, p2: tpEnd, wStart: (b.branchW * 0.48) * treeScale, wEnd: 1.5 * treeScale, viewY: viewY + 0.01, isPrimary: false });
      }
    });
    branchQueue.sort((a, b) => a.viewY - b.viewY);

    // 背面枝條先行繪製
    branchQueue.filter(br => br.viewY < 0).forEach((br) => {
      drawTaperedLimb3D(ctx, br.p0, br.p1, br.p2, br.wStart, br.wEnd, '#362013', '#593723');
    });

    // 2. 繪製有機曲線主樹幹 (含外廓陰影棕 + 主幹胡桃棕 + 左側迎光亮脊 + 細緻豎向樹皮裂紋)
    const leanX = Math.sin(angle * 2) * 3.5 * treeScale;
    ctx.fillStyle = '#2F1B10';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 21 * treeScale, trunkBase.y + 3 * treeScale);
    ctx.quadraticCurveTo(trunkLower.x - 14 * treeScale + leanX * 0.4, trunkLower.y, trunkMid.x - 10.5 * treeScale + leanX, trunkMid.y);
    ctx.lineTo(trunkTop.x - 7.5 * treeScale + leanX * 0.6, trunkTop.y);
    ctx.lineTo(trunkTop.x + 8.5 * treeScale + leanX * 0.6, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 11.5 * treeScale + leanX, trunkMid.y, trunkBase.x + 22 * treeScale, trunkBase.y + 3 * treeScale);
    ctx.closePath();
    ctx.fill();

    // 主幹溫潤胡桃木中調層
    ctx.fillStyle = '#523220';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 15 * treeScale, trunkBase.y + 2 * treeScale);
    ctx.quadraticCurveTo(trunkMid.x - 7 * treeScale + leanX, trunkMid.y, trunkTop.x - 5 * treeScale + leanX * 0.6, trunkTop.y);
    ctx.lineTo(trunkTop.x + 7 * treeScale + leanX * 0.6, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 9 * treeScale + leanX, trunkMid.y, trunkBase.x + 16 * treeScale, trunkBase.y + 2 * treeScale);
    ctx.closePath();
    ctx.fill();

    // 左前迎光高亮木紋脊線（隨轉動在圓柱面上滑順浮現）
    ctx.fillStyle = '#734B33';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 12 * treeScale, trunkBase.y + 1 * treeScale);
    ctx.quadraticCurveTo(trunkMid.x - 5 * treeScale + leanX, trunkMid.y, trunkTop.x - 3 * treeScale + leanX * 0.6, trunkTop.y);
    ctx.lineTo(trunkTop.x + 2.5 * treeScale + leanX * 0.6, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 1 * treeScale + leanX, trunkMid.y, trunkBase.x - 2 * treeScale, trunkBase.y + 1 * treeScale);
    ctx.closePath();
    ctx.fill();

    // 4 道精細樹皮縱向裂紋紋理（隨角度微繞柱面產生立體轉動視差）
    ctx.strokeStyle = '#331D11';
    ctx.lineWidth = Math.max(1, 1.4 * treeScale);
    for (let bi = 0; bi < 4; bi++) {
      const barkTheta = angle + bi * 1.55;
      const sinB = Math.sin(barkTheta);
      if (Math.cos(barkTheta) > -0.25) {
        const bxBottom = trunkBase.x + sinB * 13 * treeScale;
        const bxMid = trunkMid.x + leanX + sinB * 7.5 * treeScale;
        const bxTop = trunkTop.x + leanX * 0.6 + sinB * 5.2 * treeScale;
        ctx.beginPath();
        ctx.moveTo(bxBottom, trunkBase.y - 6 * treeScale);
        ctx.quadraticCurveTo(bxMid, trunkMid.y, bxTop, trunkTop.y + 8 * treeScale);
        ctx.stroke();
      }
    }

    // 迷你可愛樹節 / 樹洞紋理（僅朝向正面時顯示，轉到背面自然消失！）
    const knotRel = angle - 0.25;
    const knotVis = Math.cos(knotRel);
    if (knotVis > 0.15) {
      const knotX = trunkLower.x + leanX * 0.45 + Math.sin(knotRel) * 9.5 * treeScale;
      const knotY = trunkLower.y - 16 * treeScale;
      const kw = (4.2 * knotVis) * treeScale;
      const kh = 6.2 * treeScale;
      // 樹洞高光邊框
      ctx.fillStyle = '#82573D';
      ctx.beginPath();
      ctx.ellipse(knotX + 0.8 * treeScale, knotY, kw + 1.5 * treeScale, kh + 1.6 * treeScale, 0, 0, Math.PI * 2);
      ctx.fill();
      // 深色小樹洞核心
      ctx.fillStyle = '#221209';
      ctx.beginPath();
      ctx.ellipse(knotX, knotY, kw, kh, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 前面樹根抓地覆蓋主幹底緣
    sortedRoots.filter(r => r.viewY >= 0).forEach(drawRoot);

    // 前側大枝幹與小枝朝觀者伸出
    branchQueue.filter(br => br.viewY >= 0).forEach((br) => {
      drawTaperedLimb3D(ctx, br.p0, br.p1, br.p2, br.wStart, br.wEnd, '#3E2517', '#6C462E');
    });
  }

  // 主畫布渲染迴圈 (V5 支援 360° 旋轉、三幕劇連線落葉、精雕樹幹與 3D 細雨特效)
  function renderTreeQrStudioFrame(timestamp) {
    const canvas = document.getElementById('treeQrInteractiveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const dt = treeQrState.lastTime ? Math.min(0.05, (timestamp - treeQrState.lastTime) / 1000) : 0.016;
    treeQrState.lastTime = timestamp;

    // 1. 三幕劇舞台時間軸 morphTime ∈ [0, 1]（約 1.55 秒平滑演出樹葉落入地磚過程）
    const target = treeQrState.targetP;
    if (treeQrState.morphTime !== target) {
      const step = target > treeQrState.morphTime ? dt / 1.55 : -dt / 1.35;
      treeQrState.morphTime = target > treeQrState.morphTime
        ? Math.min(target, treeQrState.morphTime + step)
        : Math.max(target, treeQrState.morphTime + step);
    }
    const u = treeQrState.morphTime;
    treeQrState.morphP = u;

    // Stage 分解：
    // Stage 1 (u ∈ [0, 0.52]): 攝影機穩住 3D 等距角度、樹幹完整矗立，全部樹葉依外圍到樹頂波浪旋落並逐格嵌進地面石板槽。
    // Stage 2 (u ∈ [0.50, 0.98]): 光禿樹幹柔和淡出後，已鑲滿彩色葉片磚的 3D 石板底座抬升轉正成可直接掃描的 2D QR Code。
    const camP = smoothstep(0.50, 0.98, u);
    const trunkVis = 1 - smoothstep(0.42, 0.70, u);

    // 2. 360° 旋轉慣性物理與進入 QR 時平滑擺正對焦
    if (treeQrState.mode === 'qr') {
      const nearestZero = Math.round(treeQrState.userYaw / (Math.PI * 2)) * Math.PI * 2;
      treeQrState.userYaw += (nearestZero - treeQrState.userYaw) * Math.min(1, dt * 5.2);
      treeQrState.yawVelocity = 0;
    } else if (!treeQrState.isDragging && Math.abs(treeQrState.yawVelocity) > 0.0005) {
      treeQrState.userYaw += treeQrState.yawVelocity * dt;
      treeQrState.yawVelocity *= Math.exp(-dt * 4.5);
    }

    const palette = TREE_QR_PALETTES[treeQrState.colorKey] || TREE_QR_PALETTES.pink;
    const seasonTheme = SEASON_THEMES[treeQrState.season] || SEASON_THEMES.spring;
    const isRain = !!treeQrState.isRainEnabled;

    // 背景色（晴天為溫暖米白 #F6F2EA，細雨天為清透柔霧天青灰 #EAEFF3）
    ctx.fillStyle = isRain ? '#EAF0F4' : '#F6F2EA';
    ctx.fillRect(0, 0, W, H);

    if (!treeQrState.qrModel) {
      rebuildQrAndTreeGeometry(treeQrState.url);
      if (!treeQrState.qrModel) return;
    }

    const count = treeQrState.qrModel.getModuleCount();

    // 投影參數隨 camP 與 userYaw 實時計算
    const baseIsoAngle = (1 - camP) * (Math.PI / 4);
    const angle = baseIsoAngle + treeQrState.userYaw * (1 - camP);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const tiltY = 0.54 + 0.46 * camP;
    const radius = 154 + 48 * camP;
    const centerX = W / 2;
    const centerY = 368 - 108 * camP;

    function project(pu, pv, ph = 0) {
      const xr = (pu * cosA - pv * sinA) * radius;
      const yr = (pu * sinA + pv * cosA) * radius * tiltY;
      return {
        x: centerX + xr,
        y: centerY + yr - ph
      };
    }

    // 3. 360° 動態旋轉島嶼側面厚度（四邊背面剔除，哪兩面朝向攝影機就畫哪兩面！）
    if (camP < 0.99) {
      const slabDepth = 16 * (1 - camP);
      const sides = [
        { u1: -1, v1: 1,  u2: 1,  v2: 1,  nu: 0,  nv: 1 },  // front
        { u1: 1,  v1: 1,  u2: 1,  v2: -1, nu: 1,  nv: 0 },  // right
        { u1: 1,  v1: -1, u2: -1, v2: -1, nu: 0,  nv: -1 }, // back
        { u1: -1, v1: -1, u2: -1, v2: 1,  nu: -1, nv: 0 }   // left
      ];
      sides.forEach((s) => {
        const ny = s.nu * sinA + s.nv * cosA;
        if (ny <= 0.01) return; // 背向攝影機的一面剔除不畫
        const nx = s.nu * cosA - s.nv * sinA;
        const isLeftLit = nx < 0;
        const pA = project(s.u1, s.v1, 0);
        const pB = project(s.u2, s.v2, 0);

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pB.x, pB.y + slabDepth);
        ctx.lineTo(pA.x, pA.y + slabDepth);
        ctx.closePath();
        ctx.fillStyle = isLeftLit ? '#B8B4AA' : '#99958B';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pB.x, pB.y + slabDepth * 0.42);
        ctx.lineTo(pA.x, pA.y + slabDepth * 0.42);
        ctx.closePath();
        ctx.fillStyle = isLeftLit ? seasonTheme.slabGrassLeft : seasonTheme.slabGrassRight;
        ctx.fill();
      });
    }

    // 4. 繪製地面石板底座（含未落葉時淡淡的棋盤槽位暗示，強烈連結葉子飛落與地磚填入！）
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
              // 在樹模式下維持柔和棋盤 камен/石板紋；一進入落葉階段 (u > 0.04) 微亮暗槽輪廓並隨葉片於 u ∈ [0.28, 0.54] 著陸逐步點亮為 QR 磚
              const restStone = isRain
                ? (hash2D(gr, gc, 55) > 0.5 ? '#C8C5BC' : '#BEBBAF')
                : (hash2D(gr, gc, 55) > 0.5 ? '#D4CFC3' : '#C9C3B7');
              const socketHintColor = lerpHexColor(restStone, '#BEB6A6', smoothstep(0.02, 0.20, u) * (1 - smoothstep(0.45, 0.60, u)));
              const settleT = smoothstep(0.28, 0.54, u);
              tileColor = lerpHexColor(socketHintColor, qrColor, settleT);
            } else if (!isDark) {
              tileColor = isRain
                ? (hash2D(r * 2 + sr, c * 2 + sc, 101) > 0.55 ? '#E2E4E0' : '#D9DCD8')
                : qrColor;
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

    // 4b. 雨天地面等距水波紋擴散（在草地與葉片下方）
    if (isRain) {
      ctx.save();
      treeQrState.rainRipples.forEach((rp) => {
        rp.age += dt;
        if (rp.age >= rp.maxAge) {
          rp.age = 0;
          rp.u = (Math.random() - 0.5) * 1.82;
          rp.v = (Math.random() - 0.5) * 1.82;
        }
        const t = rp.age / rp.maxAge;
        const pt = project(rp.u, rp.v, 1);
        const rx = (3.5 + t * 15);
        const ry = rx * tiltY;
        ctx.strokeStyle = `rgba(92, 150, 194, ${(1 - t) * 0.65})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 剛落水瞬間加一圈同心內漣漪增加立體水花層次
        if (t < 0.55) {
          const rxInner = 1.5 + t * 9;
          ctx.strokeStyle = `rgba(148, 198, 228, ${(0.55 - t) * 0.85})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, rxInner, rxInner * tiltY, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    // 5. 繪製地面搖曳草叢與季節點綴 (跟隨 camera elevation 柔和淡出)
    const floraVis = 1 - smoothstep(0.48, 0.85, u);
    if (floraVis > 0.01) {
      ctx.save();
      ctx.globalAlpha = floraVis;

      const rainWindBoost = isRain ? 1.65 : 1.0;
      const breeze = Math.sin(timestamp * 0.0028 * rainWindBoost) * (3.8 * rainWindBoost);
      const gScale = seasonTheme.grassScale || 1.0;

      treeQrState.grassBlades.forEach((gb, idx) => {
        const base = project(gb.u, gb.v, 0);
        const h = gb.height * gScale * floraVis;
        const sway = Math.sin(timestamp * 0.0032 * rainWindBoost + gb.phase) * 2.8 * rainWindBoost + breeze * 0.55;
        ctx.strokeStyle = seasonTheme.grass[gb.shade];
        ctx.lineWidth = treeQrState.season === 'summer' ? 2.8 : 2.1;
        ctx.beginPath();
        ctx.moveTo(base.x, base.y);
        ctx.quadraticCurveTo(base.x + (gb.lean + sway) * 0.5, base.y - h * 0.55, base.x + gb.lean + sway, base.y - h);
        ctx.stroke();

        if (treeQrState.season === 'summer' && idx % 2 === 0) {
          const h2 = h * 0.78;
          ctx.strokeStyle = seasonTheme.grass[(gb.shade + 1) % 4];
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(base.x + 2, base.y);
          ctx.quadraticCurveTo(base.x - (gb.lean - sway) * 0.4, base.y - h2 * 0.5, base.x - gb.lean * 0.7 + sway, base.y - h2);
          ctx.stroke();
        }
      });

      treeQrState.seasonAccents.forEach((acc) => {
        const color = seasonTheme.accentColors[acc.colorIdx];
        if (seasonTheme.accentType === 'flowers') {
          const pt = project(acc.u, acc.v, 3 * floraVis);
          const s = acc.size * floraVis;
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - s * 0.7, pt.y - s * 0.25, s * 1.4, s * 0.5);
          ctx.fillRect(pt.x - s * 0.25, pt.y - s * 0.7, s * 0.5, s * 1.4);
          ctx.fillStyle = '#FFE066';
          ctx.fillRect(pt.x - s * 0.22, pt.y - s * 0.22, s * 0.44, s * 0.44);
        } else if (seasonTheme.accentType === 'fireflies') {
          const bob = Math.sin(timestamp * 0.004 + acc.phase) * 8;
          const pt = project(acc.u, acc.v, (acc.floatH + bob) * floraVis);
          const pulse = 0.45 + 0.55 * Math.sin(timestamp * 0.006 + acc.phase * 2);
          const s = acc.size * (0.8 + pulse * 0.5) * floraVis;
          ctx.fillStyle = color;
          ctx.globalAlpha = pulse * floraVis;
          ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s);
          ctx.globalAlpha = floraVis;
        } else if (seasonTheme.accentType === 'maple') {
          const pt = project(acc.u * 0.85, acc.v * 0.85, 1.5 * floraVis);
          const s = acc.size * 1.35 * floraVis;
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - s * 0.6, pt.y - s * 0.35, s * 1.2, s * 0.7);
        }
      });

      // 樹幹周圍地面散落的小花瓣
      for (let i = 0; i < 28; i++) {
        const ang = hash2D(i, 91, 3) * Math.PI * 2;
        const r = 0.12 + hash2D(i, 92, 4) * 0.40;
        const pt = project(Math.cos(ang) * r, Math.sin(ang) * r, 1);
        ctx.fillStyle = palette.foliage[2 + (i % 3)];
        ctx.fillRect(pt.x - 3 * floraVis, pt.y - 1.5 * floraVis, 6 * floraVis, 3 * floraVis);
      }

      ctx.restore();
    }

    // 6. 依當前旋轉角度實時進行葉片 3D 深度排序 (僅角度變化時才排，靜止 0ms 開銷)
    const orderedLeaves = treeQrState.leafParticles;
    if (Math.abs(angle - treeQrState.lastSortedAngle) > 0.025) {
      treeQrState.lastSortedAngle = angle;
      for (let i = 0; i < orderedLeaves.length; i++) {
        const lp = orderedLeaves[i];
        lp.viewDepth = lp.treeU * sinA + lp.treeV * cosA;
        lp.isBehindTrunk = (lp.viewDepth < -0.10 && lp.treeH < 182);
      }
      orderedLeaves.sort((a, b) => (a.viewDepth * 140 + a.treeH * 0.22) - (b.viewDepth * 140 + b.treeH * 0.22));
    }

    // 7. 因果連線落葉演出：「每片樹葉脫枝旋落 → 精準貼合填滿地面 QR 棋盤四邊形！」
    const windX = Math.sin(timestamp * 0.0022 * (isRain ? 1.5 : 1)) * (isRain ? 3.2 : 2.2);

    const drawLeafOrSettlingTile = (lp) => {
      // Stage 1: 每片葉子的起飛點 waveDelay * 0.24，飛行時長 0.28 -> 全數葉片於 u = 0.52 前精準嵌入地面格！
      const startU = lp.waveDelay * 0.24;
      const localP = Math.max(0, Math.min(1, (u - startU) / 0.28));
      const easeP = localP < 0.5
        ? 2 * localP * localP
        : 1 - Math.pow(-2 * localP + 2, 2) / 2;

      const swirl = Math.sin(localP * Math.PI) * 0.12 * lp.swirlSign;
      const curU = lp.treeU * (1 - easeP) + lp.qrU * easeP + swirl;
      const curV = lp.treeV * (1 - easeP) + lp.qrV * easeP - swirl * 0.7;
      const curH = lp.treeH * Math.pow(1 - easeP, 1.32);

      const pos = project(curU, curV, curH);
      const flutter = (1 - easeP) * (Math.sin(timestamp * 0.0032 + lp.seed) * 1.5 + windX * (lp.treeH / 200));
      const leafColor = palette.foliage[lp.shadeIdx];

      // 葉片下墜接近目標格位時，先在目標格子地面投下柔和對位影，強化「這片葉子飛向這格石磚」的視覺因果
      if (localP > 0.25 && easeP < 0.92) {
        const destCenter = project(lp.qrU, lp.qrV, 0.5);
        ctx.fillStyle = palette.qrTiles[1];
        ctx.globalAlpha = Math.sin(((localP - 0.25) / 0.75) * Math.PI) * 0.28;
        ctx.fillRect(destCenter.x - 2.2, destCenter.y - 1.2, 4.4, 2.4);
        ctx.globalAlpha = 1;
      }

      // 當葉片已經非常接近地面並進入嵌入階段 (easeP > 0.74) 時，
      // 畫出跟地面石板格精準對齊的 4 頂點四邊形，並將花瓣色柔和收束進專屬 QR 磚色！
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

        const targetQrColor = getModuleSubPixelColor(lp.r, lp.c, lp.sr, lp.sc, count, true, palette, seasonTheme);
        ctx.fillStyle = embedT > 0.05 ? lerpHexColor(leafColor, targetQrColor, embedT) : leafColor;
        ctx.beginPath();
        ctx.moveTo((cx - hw) * (1 - embedT) + pt0.x * embedT, (cy - hh) * (1 - embedT) + pt0.y * embedT);
        ctx.lineTo((cx + hw) * (1 - embedT) + pt1.x * embedT, (cy - hh) * (1 - embedT) + pt1.y * embedT);
        ctx.lineTo((cx + hw) * (1 - embedT) + pt2.x * embedT, (cy + hh) * (1 - embedT) + pt2.y * embedT);
        ctx.lineTo((cx - hw) * (1 - embedT) + pt3.x * embedT, (cy + hh) * (1 - embedT) + pt3.y * embedT);
        ctx.closePath();
        ctx.fill();
      } else {
        // 飛行半空中時，對每第 5 片葉子繪製淡雅落葉軌跡光點，強化從枝頭連向地面的動態感
        if (localP > 0.05 && lp.seed % 5 === 0) {
          const trailPos = project(curU - swirl * 0.25, curV + swirl * 0.15, curH + 16);
          ctx.fillStyle = palette.foliage[Math.min(4, lp.shadeIdx + 1)];
          ctx.globalAlpha = 0.35;
          ctx.fillRect(trailPos.x - 1.5, trailPos.y - 1.5, 3, 3);
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = leafColor;
        ctx.fillRect(pos.x + flutter - lp.leafW / 2, pos.y - lp.leafH / 2, lp.leafW, lp.leafH);

        if (easeP < 0.45 && lp.shadeIdx >= 3 && (lp.seed % 3 === 0)) {
          ctx.fillStyle = palette.foliage[4];
          ctx.fillRect(pos.x + flutter - lp.leafW * 0.25, pos.y - lp.leafH * 0.5, lp.leafW * 0.5, lp.leafH * 0.4);
        }
      }
    };

    // Painter's Algorithm 分層：背面葉片 -> 精雕樹幹 -> 前面/高冠葉片 (當 u < 0.60 葉片嵌入完成後交給地磚層直接呈現銳利 QR)
    let trunkDrawn = false;
    if (u < 0.60) {
      for (let i = 0; i < orderedLeaves.length; i++) {
        if (orderedLeaves[i].isBehindTrunk) drawLeafOrSettlingTile(orderedLeaves[i]);
      }

      if (trunkVis > 0.01) {
        trunkDrawn = true;
        ctx.save();
        ctx.globalAlpha = trunkVis;
        drawArtisanalTrunkAndBranches3D(ctx, project, angle, cosA, sinA, Math.max(0.25, trunkVis), seasonTheme);
        ctx.restore();
      }

      for (let i = 0; i < orderedLeaves.length; i++) {
        if (!orderedLeaves[i].isBehindTrunk) drawLeafOrSettlingTile(orderedLeaves[i]);
      }
    }

    if (!trunkDrawn && trunkVis > 0.01) {
      ctx.save();
      ctx.globalAlpha = trunkVis;
      drawArtisanalTrunkAndBranches3D(ctx, project, angle, cosA, sinA, Math.max(0.25, trunkVis), seasonTheme);
      ctx.restore();
    }

    // 8. 空中常駐飄落花瓣動態 (樹模式下)
    if (floraVis > 0.05) {
      ctx.save();
      ctx.globalAlpha = floraVis;
      treeQrState.floatingPetals.forEach((ptl) => {
        ptl.h -= ptl.speed * dt * (isRain ? 1.45 : 1);
        if (ptl.h < 4) ptl.h = 195;
        const driftU = ptl.u + Math.sin(timestamp * 0.0025 + ptl.phase) * 0.09;
        const pos = project(driftU * floraVis, ptl.v * floraVis, ptl.h * floraVis);
        ctx.fillStyle = palette.foliage[ptl.shade];
        ctx.fillRect(pos.x - 3.6 * floraVis, pos.y - 2.2 * floraVis, 7.2 * floraVis, 4.4 * floraVis);
      });
      ctx.restore();
    }

    // 9. 最前景 3D 雨絲特效 (穿透整個島嶼與大樹前方，使用穩定視角切線風向避免旋轉翻轉)
    if (isRain) {
      ctx.save();
      ctx.lineCap = 'round';
      const rainShiftU = 0.016 * cosA;
      const rainShiftV = -0.016 * sinA;
      treeQrState.rainDrops.forEach((rd) => {
        rd.h -= rd.speed * dt;
        rd.u -= 0.05 * dt * cosA;
        rd.v += 0.05 * dt * sinA;
        if (rd.h < -10) {
          rd.h = 310 + Math.random() * 60;
          rd.u = (Math.random() - 0.5) * 2.5;
          rd.v = (Math.random() - 0.5) * 2.5;
        }
        const pTop = project(rd.u + rainShiftU, rd.v + rainShiftV, Math.max(0, rd.h + rd.len));
        const pBot = project(rd.u, rd.v, Math.max(0, rd.h));
        ctx.strokeStyle = `rgba(88, 146, 190, ${Math.min(0.68, rd.alpha + 0.14)})`;
        ctx.lineWidth = rd.speed > 550 ? 1.7 : 1.35;
        ctx.beginPath();
        ctx.moveTo(pTop.x, pTop.y);
        ctx.lineTo(pBot.x, pBot.y);
        ctx.stroke();
      });
      ctx.restore();
    }

    if (standeeModal && standeeModal.classList.contains('open')) {
      treeQrState.animFrameId = requestAnimationFrame(renderTreeQrStudioFrame);
    }
  }

  function setTreeQrMode(mode, immediate = false) {
    treeQrState.mode = mode;
    treeQrState.targetP = mode === 'qr' ? 1 : 0;
    if (immediate) {
      treeQrState.morphTime = treeQrState.targetP;
      treeQrState.morphP = treeQrState.targetP;
      if (mode === 'qr') {
        treeQrState.userYaw = 0;
        treeQrState.yawVelocity = 0;
      }
    }
    const pillBtn = document.getElementById('treeQrTogglePill');
    if (pillBtn) {
      pillBtn.textContent = mode === 'qr'
        ? '輕點讓 QR 花瓣飛回長成 3D 大樹'
        : '左右拖曳 360° 旋轉大樹 · 輕點落葉成 QR Code';
    }
  }

  function initTreeQrStudio() {
    const canvasContainer = document.getElementById('treeQrCanvasContainer');
    const togglePill = document.getElementById('treeQrTogglePill');
    const urlInput = document.getElementById('treeQrUrlInput');
    const seasonBtns = document.querySelectorAll('.tree-season-btn');
    const colorDots = document.querySelectorAll('.tree-color-dot');
    const treeRainBtn = document.getElementById('treeRainToggleBtn');
    const treeSoundBtn = document.getElementById('treeSoundToggleBtn');

    const toggleAction = () => {
      const nextMode = treeQrState.mode === 'tree' ? 'qr' : 'tree';
      playSound(nextMode === 'qr' ? 'treeToQr' : 'qrToTree');
      setTreeQrMode(nextMode, false);
    };

    // 支援滑鼠/觸控左右拖曳 360° 旋轉，並嚴格區分拖曳與輕點切換 QR Code
    if (canvasContainer) {
      const onStart = (clientX) => {
        treeQrState.isDragging = true;
        treeQrState.pointerStartX = clientX;
        treeQrState.lastPointerX = clientX;
        treeQrState.dragDistance = 0;
        treeQrState.yawVelocity = 0;
        canvasContainer.classList.add('dragging');
      };

      const onMove = (clientX) => {
        if (!treeQrState.isDragging) return;
        const dx = clientX - treeQrState.lastPointerX;
        treeQrState.dragDistance += Math.abs(dx);
        treeQrState.lastPointerX = clientX;

        if (treeQrState.mode === 'tree' || treeQrState.morphTime < 0.55) {
          const deltaAngle = dx * 0.0095;
          treeQrState.userYaw += deltaAngle;
          treeQrState.yawVelocity = deltaAngle * 55;
        }
      };

      const onEnd = () => {
        if (!treeQrState.isDragging) return;
        treeQrState.isDragging = false;
        canvasContainer.classList.remove('dragging');
        if (treeQrState.dragDistance <= 7) {
          toggleAction();
        }
      };

      if (typeof window !== 'undefined' && 'PointerEvent' in window) {
        canvasContainer.addEventListener('pointerdown', (e) => {
          onStart(e.clientX);
          if (canvasContainer.setPointerCapture) {
            try { canvasContainer.setPointerCapture(e.pointerId); } catch (_) {}
          }
        });
        canvasContainer.addEventListener('pointermove', (e) => onMove(e.clientX));
        canvasContainer.addEventListener('pointerup', onEnd);
        canvasContainer.addEventListener('pointercancel', onEnd);
      } else {
        canvasContainer.addEventListener('mousedown', (e) => onStart(e.clientX));
        window.addEventListener('mousemove', (e) => onMove(e.clientX));
        window.addEventListener('mouseup', onEnd);
        canvasContainer.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) onStart(e.touches[0].clientX);
        }, { passive: true });
        canvasContainer.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches[0]) onMove(e.touches[0].clientX);
        }, { passive: true });
        canvasContainer.addEventListener('touchend', onEnd);
      }
    }

    if (togglePill) togglePill.addEventListener('click', toggleAction);

    if (urlInput) {
      urlInput.addEventListener('input', () => {
        const val = urlInput.value.trim() || FIXED_QUIZ_GITHUB_URL;
        treeQrState.url = val;
        rebuildQrAndTreeGeometry(val);
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

    if (treeRainBtn) {
      treeRainBtn.addEventListener('click', () => {
        treeQrState.isRainEnabled = !treeQrState.isRainEnabled;
        treeRainBtn.classList.toggle('active', treeQrState.isRainEnabled);
        playSound('rainToggle', treeQrState.isRainEnabled ? 1 : 0);
        updateRainAudioState();
      });
    }

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
        treeSoundBtn.innerHTML = isSoundEnabled
          ? '<i class="fas fa-volume-up"></i>'
          : '<i class="fas fa-volume-mute"></i>';
        updateRainAudioState();
        if (isSoundEnabled) playSound('qrToTree');
      });
    }

    rebuildQrAndTreeGeometry(FIXED_QUIZ_GITHUB_URL);
  }

  // 將高解析「像素花園 QR Code」繪製至任意指定 Canvas (供下載、列印與拍立得結果卡使用)
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
            const color = getModuleSubPixelColor(r, c, sr, sc, count, isDark, palette, seasonTheme);
            const x = ((c + quietModules) * 2 + sc) * cellPx;
            const y = ((r + quietModules) * 2 + sr) * cellPx;
            ctx.fillStyle = color;
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
      const qrCanvas = createPixelGardenQrCanvas(260, targetURL, treeQrState.colorKey, treeQrState.season);
      standeeQrHolder.appendChild(qrCanvas);
    }

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

  function openStandeeModal() {
    if (standeeModal) {
      standeeModal.classList.add('open');
      renderFixedQRCodes();
      if (treeQrState.animFrameId) cancelAnimationFrame(treeQrState.animFrameId);
      treeQrState.lastTime = 0;
      treeQrState.animFrameId = requestAnimationFrame(renderTreeQrStudioFrame);
      updateRainAudioState();
    }
  }

  function closeStandeeModal() {
    if (standeeModal) standeeModal.classList.remove('open');
    if (treeQrState.animFrameId) {
      cancelAnimationFrame(treeQrState.animFrameId);
      treeQrState.animFrameId = null;
    }
    updateRainAudioState();
  }

  function copyQuizLink() {
    playSound('tap');
    const url = getQuizURL();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('🔗 測驗專屬連結已成功複製！');
      }).catch(() => {
        fallbackCopy(url);
      });
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
    showToast('🔗 測驗專屬連結已成功複製！');
  }

  function downloadPureQRCode() {
    playSound('tap');
    const hiResCanvas = createPixelGardenQrCanvas(1200, getQuizURL(), treeQrState.colorKey, treeQrState.season);
    const a = document.createElement('a');
    a.download = `MapMo-像素花園QRCode-${treeQrState.colorKey}.png`;
    a.href = hiResCanvas.toDataURL('image/png');
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

  function showToast(msg) {
    let toast = document.getElementById('quizToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'quizToast';
      toast.className = 'quiz-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 11. 2X 高解析 Canvas 測驗結果卡片匯出 (Instagram 4:5 / 列印專用)
  function exportResultCardImage() {
    playSound('tap');
    if (!currentResult) return;

    showToast('🎨 正在生成 2X 高解析社群分享圖...');

    // 建立 1080 x 1440 專業 IG 尺寸的高畫質離屏 Canvas
    const canvas = document.createElement('canvas');
    const W = 1080;
    const H = 1440;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 1. 背景與卡片基底
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, W, H);

    // 拍立得相紙主體 (白色圓角卡片)
    const cardX = 60;
    const cardY = 60;
    const cardW = W - 120;
    const cardH = H - 120;
    drawRoundRect(ctx, cardX, cardY, cardW, cardH, 36, '#FFFFFF', '#1C1C1E', 3);

    // 頂部膠帶意象
    ctx.fillStyle = currentResult.badgeColor + '55';
    ctx.fillRect(W / 2 - 90, cardY - 14, 180, 32);

    // 2. 品牌 Header
    ctx.fillStyle = '#1C1C1E';
    ctx.font = '900 24px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MAPMO ARCHIVE · 2026', cardX + 40, cardY + 65);

    ctx.textAlign = 'right';
    ctx.font = '700 20px "Outfit", sans-serif';
    ctx.fillStyle = '#8E8E93';
    ctx.fillText(`NO. ${currentResult.id.toUpperCase()}-7788`, cardX + cardW - 40, cardY + 65);

    // 虛線分隔線
    ctx.strokeStyle = '#E5E5EA';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(cardX + 40, cardY + 95);
    ctx.lineTo(cardX + cardW - 40, cardY + 95);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 派系核心稱號
    ctx.textAlign = 'center';

    // 徽章
    drawRoundRect(ctx, W / 2 - 130, cardY + 130, 260, 46, 23, currentResult.badgeColor);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
    ctx.fillText(currentResult.emotionLabel, W / 2, cardY + 160);

    // 大標題
    ctx.fillStyle = currentResult.badgeColor;
    ctx.font = '900 58px "Noto Sans TC", sans-serif';
    ctx.fillText(`｜${currentResult.name}｜`, W / 2, cardY + 245);

    // 稱號
    ctx.fillStyle = '#48484A';
    ctx.font = '700 26px "Noto Sans TC", sans-serif';
    ctx.fillText(currentResult.tagline, W / 2, cardY + 295);

    // 4. 靈魂金句色塊
    const quoteBoxY = cardY + 340;
    drawRoundRect(ctx, cardX + 40, quoteBoxY, cardW - 80, 110, 20, '#FAF9F6');
    // 左側色條
    ctx.fillStyle = currentResult.badgeColor;
    ctx.fillRect(cardX + 40, quoteBoxY, 8, 110);

    ctx.textAlign = 'left';
    ctx.font = 'italic 500 22px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#2C2C2E';
    wrapText(ctx, currentResult.soulQuote, cardX + 70, quoteBoxY + 50, cardW - 140, 36);

    // 5. 社群現狀文字
    const statusY = quoteBoxY + 140;
    drawRoundRect(ctx, cardX + 40, statusY, cardW - 80, 100, 20, '#FFFFFF', '#E5E5EA', 2);
    ctx.fillStyle = '#1C1C1E';
    ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
    ctx.fillText('社群現狀剖析：', cardX + 65, statusY + 38);
    ctx.fillStyle = '#48484A';
    ctx.font = '500 18px "Noto Sans TC", sans-serif';
    wrapText(ctx, currentResult.status, cardX + 65, statusY + 72, cardW - 130, 28);

    // 6. 三維特質能量條
    const dimY = statusY + 135;
    ctx.font = 'bold 22px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#1C1C1E';
    ctx.fillText('三維社群能量指數', cardX + 40, dimY);

    const dims = [
      currentResult.dimensions.record,
      currentResult.dimensions.awareness,
      currentResult.dimensions.share
    ];
    dims.forEach((d, i) => {
      const rowY = dimY + 36 + i * 54;
      ctx.font = '600 18px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#48484A';
      ctx.fillText(d.label, cardX + 40, rowY + 16);

      ctx.textAlign = 'right';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.fillStyle = d.color;
      ctx.fillText(`${d.value}%`, cardX + cardW - 40, rowY + 16);
      ctx.textAlign = 'left';

      // 能量軌道與填色
      const trackW = cardW - 80;
      drawRoundRect(ctx, cardX + 40, rowY + 26, trackW, 12, 6, '#E5E5EA');
      const fillW = (trackW * d.value) / 100;
      drawRoundRect(ctx, cardX + 40, rowY + 26, fillW, 12, 6, d.color);
    });

    // 7. 適合 MapMo 功能
    const featY = dimY + 225;
    ctx.font = '900 22px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#1C1C1E';
    ctx.fillText('最適合你的 MapMo 專屬功能：', cardX + 40, featY);

    const allFeats = currentResult.features.primary;
    allFeats.forEach((f, idx) => {
      const fy = featY + 26 + idx * 72;
      drawRoundRect(ctx, cardX + 40, fy, cardW - 80, 62, 14, '#FAF9F6', '#E5E5EA', 1.5);
      ctx.font = 'bold 18px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#1C1C1E';
      ctx.fillText(`✦ ${f.name}（主要適合）`, cardX + 60, fy + 26);
      ctx.font = '500 14px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#6E6E73';
      ctx.fillText(f.desc.slice(0, 36) + '...', cardX + 60, fy + 48);
    });

    // 8. 底部 QR Code 導流區
    const footY = cardY + cardH - 120;
    ctx.strokeStyle = '#E5E5EA';
    ctx.beginPath();
    ctx.moveTo(cardX + 40, footY);
    ctx.lineTo(cardX + cardW - 40, footY);
    ctx.stroke();

    ctx.font = 'bold 20px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#1C1C1E';
    ctx.fillText('掃描 QR Code · 測出你的社群靈魂', cardX + 40, footY + 45);
    ctx.font = '500 15px "Outfit", sans-serif';
    ctx.fillStyle = '#6366F1';
    ctx.fillText(getQuizURL(), cardX + 40, footY + 75);

    // 繪製 QR Code (從 cardFooterQrHolder 讀取 canvas)
    const qrCanvas = cardFooterQrHolder ? cardFooterQrHolder.querySelector('canvas') : null;
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, cardX + cardW - 130, footY + 15, 90, 90);
    }

    // 匯出圖檔
    setTimeout(() => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = `MapMo社群人格-${currentResult.name}.png`;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
        showToast('🎉 結果圖片已成功匯出至下載資料夾！');
      }, 'image/png');
    }, 200);
  }

  // Canvas 繪製圓角矩形 Helper
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

  // Canvas 文字自動換行 Helper
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let line = '';
    let currentY = y;

    for (let n = 0; n < chars.length; n++) {
      const testLine = line + chars[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = chars[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

})();
