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

  // 10. 3D 情緒樹 ⇄ 像素花園 QR Code 互動生成引擎 (Louis Raille Style V3 - 真實分枝大樹與 3D 深度排序)
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

  // 季節草地與定位框配色：春（嫩綠+繁花）、夏（深翠綠+高大茂密草叢+流螢）、秋（金橘紅+落楓地毯）
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

  // 8 個真實大樹分枝樹冠團塊 (Multi-Tiered Canopy Boughs)
  // 每一個團塊都精準對應一條從主幹伸出的 3D 分枝，創造高挺樹幹 + 蓬鬆分層大樹剪影
  const TREE_BOUGHS = [
    { u: -0.05, v: -0.05, h: 256, rx: 0.25, ry: 0.25, rh: 28, branchStartH: 132, branchW: 5.5 }, // 0: 高聳樹頂尖峰
    { u: -0.28, v: 0.04,  h: 214, rx: 0.30, ry: 0.27, rh: 26, branchStartH: 122, branchW: 6.0 }, // 1: 左上中高冠
    { u: 0.16,  v: -0.28, h: 218, rx: 0.30, ry: 0.27, rh: 26, branchStartH: 122, branchW: 6.0 }, // 2: 右上中高冠
    { u: -0.34, v: -0.36, h: 178, rx: 0.35, ry: 0.33, rh: 26, branchStartH: 108, branchW: 6.5 }, // 3: 正後方襯底大冠
    { u: -0.60, v: 0.28,  h: 144, rx: 0.34, ry: 0.31, rh: 24, branchStartH: 92,  branchW: 7.2 }, // 4: 左側寬大展開翼 (橫跨左側島嶼)
    { u: 0.50,  v: -0.54, h: 148, rx: 0.34, ry: 0.31, rh: 24, branchStartH: 94,  branchW: 7.2 }, // 5: 右側寬大展開翼 (橫跨右側島嶼)
    { u: -0.18, v: 0.44,  h: 164, rx: 0.28, ry: 0.26, rh: 22, branchStartH: 105, branchW: 5.8 }, // 6: 左前高挑分枝冠
    { u: 0.44,  v: 0.10,  h: 160, rx: 0.28, ry: 0.26, rh: 22, branchStartH: 105, branchW: 5.8 }  // 7: 右前高挑分枝冠
  ];

  let treeQrState = {
    url: FIXED_QUIZ_GITHUB_URL,
    mode: 'tree',         // 'tree' (p->0) | 'qr' (p->1)
    morphP: 0,            // 0 = 3D 等距大樹, 1 = 2D 俯視像素花園 QR Code
    targetP: 0,
    season: 'spring',
    colorKey: 'pink',
    qrModel: null,
    leafParticles: [],    // 每一格 QR 深色資料磚對應一片樹冠小葉，點擊時直接飄落拼成地面 QR Code
    grassBlades: [],
    seasonAccents: [],    // 春花 / 夏螢 / 秋楓
    floatingPetals: [],
    animFrameId: null,
    lastTime: 0
  };

  function getQuizURL() {
    const inputEl = document.getElementById('treeQrUrlInput');
    const customVal = inputEl && inputEl.value ? inputEl.value.trim() : '';
    return customVal || FIXED_QUIZ_GITHUB_URL;
  }

  // 決定性雜湊函數 (確保每個像素格紋理固定不閃爍)
  function hash2D(a, b, seed = 0) {
    let n = Math.imul(a + 37, 374761393) + Math.imul(b + 73, 668265263) + Math.imul(seed + 19, 1442695041);
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function isFinderModule(r, c, count) {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= count - 7) return true;
    if (r >= count - 7 && c < 7) return true;
    if (r < 2 || r >= count - 2 || c < 2 || c >= count - 2) return true;
    return false;
  }

  // 建立 QR 矩陣與「葉片構成 8 團分枝大樹 ⇄ 飄落拼成 QR 磚塊」幾何
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

  // 核心演算法：將地面所有內部 QR Code 深色子像素有結構地分派至 8 個立體大樹冠團塊，
  // 控制單葉細緻尺度 + 保留樹幹視窗走廊，達成「枝葉分明、高挺寬闊的像素大樹」效果！
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

            // 挑選最適配這顆地面磚塊的樹冠分枝團塊 (就近方位 + 確定性分布均衡到樹頂)
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

            // 在該分枝團塊橢球內生成輕盈有機小簇 (使用根號分布使表面輪廓清晰、內部保留層次)
            const theta = hash2D(gr, gc, 17) * Math.PI * 2;
            const phi = Math.acos(2 * hash2D(gr, gc, 23) - 1);
            const shellR = 0.35 + Math.pow(hash2D(gr, gc, 29), 0.45) * 0.65;

            const dx = Math.sin(phi) * Math.cos(theta) * shellR;
            const dy = Math.sin(phi) * Math.sin(theta) * shellR;
            const dz = Math.cos(phi) * shellR;

            let treeU = bough.u + dx * bough.rx;
            let treeV = bough.v + dy * bough.ry;
            let treeH = bough.h + dz * bough.rh;

            // 絕對淨空保護門檻 (Trunk Corridor Guard)：確保正前方與中央樹幹區域 (u+v > -0.15, |u-v| < 0.35)
            // 不會出現遮擋主幹的低垂葉片，讓樹幹與 Y 型分枝始終清晰立體！
            const frontness = treeU + treeV;
            const lateral = Math.abs(treeU - treeV);
            if (frontness > -0.12 && lateral < 0.38 && treeH < 142) {
              treeH = 144 + hash2D(gr, gc, 37) * 28;
            }

            // 以左上受光面與高度算出局部立體明暗階層 (每團樹冠底部較深、外緣頂端明亮)
            const localLight = dz * 0.55 - (dx + dy) * 0.32 + (treeH - 135) / 145 * 0.42 + (hash2D(gr, gc, 41) - 0.5) * 0.25;
            const shadeIdx = Math.max(0, Math.min(4, Math.floor((localLight + 0.55) * 3.8)));

            // 精緻像素小葉尺寸 (避免 1,400+ 片糊成實心水泥球，保留透氣邊緣感)
            const leafW = 6.2 + hash2D(gr, gc, 53) * 4.4;
            const leafH = 4.5 + hash2D(gr, gc, 61) * 3.2;
            const delay = hash2D(gr, gc, 71) * 0.28;
            const swirlSign = hash2D(gr, gc, 83) > 0.5 ? 1 : -1;
            const depth = treeU + treeV;

            particles.push({
              r, c, sr, sc, gr, gc,
              u0, v0, u1, v1, qrU, qrV,
              treeU, treeV, treeH, depth,
              shadeIdx, leafW, leafH,
              delay, swirlSign,
              seed: idx
            });
          }
        }
      }
    }

    // 預先依 3D 等距深度排序：遠處背面葉片在前、前側葉片在後，配合 Painter's Algorithm 與樹幹分層
    particles.sort((a, b) => (a.depth * 100 + a.treeH * 0.14) - (b.depth * 100 + b.treeH * 0.14));
    treeQrState.leafParticles = particles;
  }

  function generateProceduralTreeGeometry() {
    // 1. 生成 3 個定位角與四周邊框的 3D 搖曳草叢 (數量增至 280 株)
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

    // 2. 季節專屬地面與草叢點綴 (春季繽紛小花 / 夏季流螢光點 / 秋季紅楓地毯)
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

    // 3. 空中飄落花瓣/葉片 + 地面樹幹周圍落花
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

  // 色彩線性插值輔助
  function lerpHexColor(hexA, hexB, t) {
    const a = parseInt(hexA.slice(1), 16);
    const b = parseInt(hexB.slice(1), 16);
    const r = Math.round(((a >> 16) & 255) * (1 - t) + ((b >> 16) & 255) * t);
    const g = Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t);
    const bl = Math.round((a & 255) * (1 - t) + (b & 255) * t);
    return `rgb(${r},${g},${bl})`;
  }

  // 取得單一子像素 (r, c, sr, sc) 在 QR 模式下的目標色
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

  // 繪製 3D 立體樹幹與連接至 8 團樹冠中心的真實空間樹枝
  function drawTrunkAndBranches3D(ctx, project, treeScale) {
    const trunkBase = project(0, 0, 0);
    const trunkMid = project(0, 0, 72 * treeScale);
    const trunkTop = project(0, 0, 146 * treeScale);

    // 1. 樹幹根部微微抓地寬座與樹影
    ctx.fillStyle = 'rgba(62, 38, 24, 0.22)';
    ctx.beginPath();
    ctx.ellipse(trunkBase.x, trunkBase.y + 3 * treeScale, 32 * treeScale, 14 * treeScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 主幹深色背光陰影面
    ctx.fillStyle = '#3B2315';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 20 * treeScale, trunkBase.y + 3 * treeScale);
    ctx.quadraticCurveTo(trunkMid.x - 11 * treeScale, trunkMid.y, trunkTop.x - 7 * treeScale, trunkTop.y);
    ctx.lineTo(trunkTop.x + 8 * treeScale, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 12 * treeScale, trunkMid.y, trunkBase.x + 21 * treeScale, trunkBase.y + 3 * treeScale);
    ctx.closePath();
    ctx.fill();

    // 3. 主幹受光面亮部紋理
    ctx.fillStyle = '#6B452F';
    ctx.beginPath();
    ctx.moveTo(trunkBase.x - 6 * treeScale, trunkBase.y + 2 * treeScale);
    ctx.quadraticCurveTo(trunkMid.x - 3 * treeScale, trunkMid.y, trunkTop.x - 2 * treeScale, trunkTop.y);
    ctx.lineTo(trunkTop.x + 7 * treeScale, trunkTop.y);
    ctx.quadraticCurveTo(trunkMid.x + 10 * treeScale, trunkMid.y, trunkBase.x + 13 * treeScale, trunkBase.y + 2 * treeScale);
    ctx.closePath();
    ctx.fill();

    // 4. 連接至 8 個分枝冠團中心的真實 3D 空間樹枝
    ctx.lineCap = 'round';
    TREE_BOUGHS.forEach((b, bIdx) => {
      const startPt = project(0, 0, b.branchStartH * treeScale);
      const endPt = project(b.u * 0.78 * treeScale, b.v * 0.78 * treeScale, (b.h - 14) * treeScale);
      const ctrlPt = project(b.u * 0.35 * treeScale, b.v * 0.35 * treeScale, (b.branchStartH + (b.h - b.branchStartH) * 0.6) * treeScale);

      // 外側深色枝條輪廓
      ctx.strokeStyle = '#3E2517';
      ctx.lineWidth = b.branchW * treeScale;
      ctx.beginPath();
      ctx.moveTo(startPt.x, startPt.y);
      ctx.quadraticCurveTo(ctrlPt.x, ctrlPt.y, endPt.x, endPt.y);
      ctx.stroke();

      // 內側受光棕木亮線
      if (bIdx >= 4) {
        ctx.strokeStyle = '#5E3B27';
        ctx.lineWidth = (b.branchW * 0.45) * treeScale;
        ctx.beginPath();
        ctx.moveTo(startPt.x + 1, startPt.y - 1);
        ctx.quadraticCurveTo(ctrlPt.x + 1, ctrlPt.y - 1, endPt.x + 1, endPt.y - 1);
        ctx.stroke();
      }
    });
  }

  // 主畫布渲染迴圈 (Painter's Algorithm 分層渲染：背面葉冠 -> 3D 樹幹樹枝 -> 前方葉冠 -> 飄落動畫)
  function renderTreeQrStudioFrame(timestamp) {
    const canvas = document.getElementById('treeQrInteractiveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const dt = treeQrState.lastTime ? Math.min(0.05, (timestamp - treeQrState.lastTime) / 1000) : 0.016;
    treeQrState.lastTime = timestamp;

    // 平滑趨近目標狀態 p (0 = Tree, 1 = QR)
    const diff = treeQrState.targetP - treeQrState.morphP;
    if (Math.abs(diff) > 0.001) {
      treeQrState.morphP += diff * Math.min(1, dt * 6.8);
    } else {
      treeQrState.morphP = treeQrState.targetP;
    }

    const p = treeQrState.morphP;
    const palette = TREE_QR_PALETTES[treeQrState.colorKey] || TREE_QR_PALETTES.pink;
    const seasonTheme = SEASON_THEMES[treeQrState.season] || SEASON_THEMES.spring;

    // 1. 溫暖米白背景
    ctx.fillStyle = '#F6F2EA';
    ctx.fillRect(0, 0, W, H);

    if (!treeQrState.qrModel) {
      rebuildQrAndTreeGeometry(treeQrState.url);
      if (!treeQrState.qrModel) return;
    }

    const count = treeQrState.qrModel.getModuleCount();

    // 投影參數插值 (p=0: 高挺大樹等距視角 centerY=368 留出充足樹高; p=1: QR 平面置中 centerY=260)
    const angle = (1 - p) * (Math.PI / 4);
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const tiltY = 0.54 + 0.46 * p;
    const radius = 154 + 48 * p;
    const centerX = W / 2;
    const centerY = 368 - 108 * p;
    const treeScale = Math.max(0, 1 - p * 1.18);

    function project(u, v, h = 0) {
      const xr = (u * cosA - v * sinA) * radius;
      const yr = (u * sinA + v * cosA) * radius * tiltY;
      return {
        x: centerX + xr,
        y: centerY + yr - h
      };
    }

    // 2. 繪製 3D 島嶼底座側面厚度
    if (p < 0.99) {
      const slabDepth = 16 * (1 - p);
      const pLeft = project(-1, 1, 0);
      const pFront = project(1, 1, 0);
      const pRight = project(1, -1, 0);

      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.lineTo(pFront.x, pFront.y + slabDepth);
      ctx.lineTo(pLeft.x, pLeft.y + slabDepth);
      ctx.closePath();
      ctx.fillStyle = '#B8B4AA';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.lineTo(pFront.x, pFront.y + slabDepth * 0.42);
      ctx.lineTo(pLeft.x, pLeft.y + slabDepth * 0.42);
      ctx.closePath();
      ctx.fillStyle = seasonTheme.slabGrassLeft;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pFront.x, pFront.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pRight.x, pRight.y + slabDepth);
      ctx.lineTo(pFront.x, pFront.y + slabDepth);
      ctx.closePath();
      ctx.fillStyle = '#99958B';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pFront.x, pFront.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.lineTo(pRight.x, pRight.y + slabDepth * 0.42);
      ctx.lineTo(pFront.x, pFront.y + slabDepth * 0.42);
      ctx.closePath();
      ctx.fillStyle = seasonTheme.slabGrassRight;
      ctx.fill();
    }

    // 3. 繪製地面石板底座與定位角草皮
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
              const stoneShadow = hash2D(gr, gc, 55) > 0.5 ? '#D8D3C8' : '#CFC9BD';
              const settleT = Math.max(0, Math.min(1, (p - 0.72) / 0.28));
              tileColor = lerpHexColor(stoneShadow, qrColor, settleT);
            } else if (isFinder && !isDark && treeQrState.season === 'autumn') {
              tileColor = '#EFE9DC';
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

    // 4. 繪製地面搖曳草叢與季節專屬點綴 (春花 / 夏日高草+流螢 / 秋楓地毯)
    if (treeScale > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, treeScale * 1.15);

      const breeze = Math.sin(timestamp * 0.0028) * 3.8;
      const gScale = seasonTheme.grassScale || 1.0;

      treeQrState.grassBlades.forEach((gb, idx) => {
        const base = project(gb.u, gb.v, 0);
        const h = gb.height * gScale * treeScale;
        const sway = Math.sin(timestamp * 0.0032 + gb.phase) * 2.8 + breeze * 0.55;
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
          const pt = project(acc.u, acc.v, 3 * treeScale);
          const s = acc.size * treeScale;
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - s * 0.7, pt.y - s * 0.25, s * 1.4, s * 0.5);
          ctx.fillRect(pt.x - s * 0.25, pt.y - s * 0.7, s * 0.5, s * 1.4);
          ctx.fillStyle = '#FFE066';
          ctx.fillRect(pt.x - s * 0.22, pt.y - s * 0.22, s * 0.44, s * 0.44);
        } else if (seasonTheme.accentType === 'fireflies') {
          const bob = Math.sin(timestamp * 0.004 + acc.phase) * 8;
          const pt = project(acc.u, acc.v, (acc.floatH + bob) * treeScale);
          const pulse = 0.45 + 0.55 * Math.sin(timestamp * 0.006 + acc.phase * 2);
          const s = acc.size * (0.8 + pulse * 0.5) * treeScale;
          ctx.fillStyle = color;
          ctx.globalAlpha = pulse * Math.min(1, treeScale * 1.15);
          ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s);
          ctx.globalAlpha = Math.min(1, treeScale * 1.15);
        } else if (seasonTheme.accentType === 'maple') {
          const pt = project(acc.u * 0.85, acc.v * 0.85, 1.5 * treeScale);
          const s = acc.size * 1.35 * treeScale;
          ctx.fillStyle = color;
          ctx.fillRect(pt.x - s * 0.6, pt.y - s * 0.35, s * 1.2, s * 0.7);
        }
      });

      // 樹幹周圍地面散落的小花瓣
      for (let i = 0; i < 28; i++) {
        const ang = hash2D(i, 91, 3) * Math.PI * 2;
        const r = 0.10 + hash2D(i, 92, 4) * 0.42;
        const pt = project(Math.cos(ang) * r, Math.sin(ang) * r, 1);
        ctx.fillStyle = palette.foliage[2 + (i % 3)];
        ctx.fillRect(pt.x - 3 * treeScale, pt.y - 1.5 * treeScale, 6 * treeScale, 3 * treeScale);
      }

      ctx.restore();
    }

    // 5. 核心視覺：「Painter's Algorithm 分層渲染」+「每片樹葉即一格 QR Code 磚塊」！
    // 先畫背面樹冠葉片 (depth < 0.04) -> 再畫立體 3D 樹幹與大樹枝 -> 最後畫前側與頂層樹冠葉片 (depth >= 0.04)
    const windX = Math.sin(timestamp * 0.0022) * 2.4;
    const orderedLeaves = treeQrState.leafParticles;
    let trunkDrawn = false;

    const drawLeaf = (lp) => {
      const localP = Math.max(0, Math.min(1, (p - lp.delay * 0.35) / (1 - lp.delay * 0.35)));
      const easeP = localP < 0.5
        ? 2 * localP * localP
        : 1 - Math.pow(-2 * localP + 2, 2) / 2;

      const swirl = Math.sin(localP * Math.PI) * 0.14 * lp.swirlSign;
      const curU = lp.treeU * (1 - easeP) + lp.qrU * easeP + swirl;
      const curV = lp.treeV * (1 - easeP) + lp.qrV * easeP - swirl * 0.7;
      const curH = lp.treeH * Math.pow(1 - easeP, 1.35);

      const pos = project(curU, curV, curH);
      const flutter = (1 - easeP) * (Math.sin(timestamp * 0.0032 + lp.seed) * 1.5 + windX * (lp.treeH / 200));

      const subSpan = ((1.06) / subCount) * 2 * radius;
      const w = lp.leafW * (1 - easeP) + subSpan * easeP;
      const h = lp.leafH * (1 - easeP) + subSpan * tiltY * easeP;

      // 顏色全程保持所選色系（粉色葉子落下就是粉色 QR 磚）
      ctx.fillStyle = palette.foliage[lp.shadeIdx];
      ctx.fillRect(pos.x + flutter - w / 2, pos.y - h / 2, w, h);

      // 僅對最亮外緣的 35% 受光葉片輕點精細像素高光，保留透氣層次不結塊
      if (easeP < 0.55 && lp.shadeIdx >= 3 && (lp.seed % 3 === 0)) {
        ctx.fillStyle = palette.foliage[4];
        ctx.fillRect(pos.x + flutter - w * 0.25, pos.y - h * 0.5, w * 0.5, h * 0.4);
      }
    };

    if (p < 0.98) {
      for (let i = 0; i < orderedLeaves.length; i++) {
        const lp = orderedLeaves[i];
        if (!trunkDrawn && lp.depth >= 0.04) {
          trunkDrawn = true;
          if (treeScale > 0.01) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, treeScale * 1.15);
            drawTrunkAndBranches3D(ctx, project, treeScale);
            ctx.restore();
          }
        }
        drawLeaf(lp);
      }
    }

    if (!trunkDrawn && treeScale > 0.01) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, treeScale * 1.15);
      drawTrunkAndBranches3D(ctx, project, treeScale);
      ctx.restore();
    }

    // 6. 空中常駐緩緩飄落的花瓣/葉片動態 (樹模式下)
    if (treeScale > 0.05) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, treeScale);
      treeQrState.floatingPetals.forEach((ptl) => {
        ptl.h -= ptl.speed * dt;
        if (ptl.h < 4) ptl.h = 195;
        const driftU = ptl.u + Math.sin(timestamp * 0.0025 + ptl.phase) * 0.09;
        const pos = project(driftU * treeScale, ptl.v * treeScale, ptl.h * treeScale);
        ctx.fillStyle = palette.foliage[ptl.shade];
        ctx.fillRect(pos.x - 3.6 * treeScale, pos.y - 2.2 * treeScale, 7.2 * treeScale, 4.4 * treeScale);
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
      treeQrState.morphP = treeQrState.targetP;
    }
    const pillBtn = document.getElementById('treeQrTogglePill');
    if (pillBtn) {
      pillBtn.textContent = mode === 'qr'
        ? 'Tap to see the tree · 點擊切換回 3D 小樹'
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
    }
  }

  function closeStandeeModal() {
    if (standeeModal) standeeModal.classList.remove('open');
    if (treeQrState.animFrameId) {
      cancelAnimationFrame(treeQrState.animFrameId);
      treeQrState.animFrameId = null;
    }
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
