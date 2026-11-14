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

  function playSound(type) {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

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
        window.print();
      });
    }

    // 立牌下載純 QR Code
    const btnDownloadQR = document.getElementById('btnDownloadQR');
    if (btnDownloadQR) {
      btnDownloadQR.addEventListener('click', () => {
        downloadPureQRCode();
      });
    }

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

  // 10. 固定 QR Code 與展覽立牌渲染
  const FIXED_QUIZ_GITHUB_URL = 'https://chen1an.github.io/mapmo-quiz/';

  function getQuizURL() {
    // 統一鎖定 GitHub Pages 永久短網址，確保本機列印與線上分享之 QR Code 100% 一致且好掃描
    return FIXED_QUIZ_GITHUB_URL;
  }

  function renderFixedQRCodes() {
    const targetURL = getQuizURL();

    // 更新立牌網址文字
    const captionEl = document.getElementById('standeeUrlCaption');
    if (captionEl) captionEl.textContent = targetURL;

    // 渲染立牌的大 QR Code (220x220)
    if (standeeQrHolder && typeof QRCode !== 'undefined') {
      standeeQrHolder.innerHTML = '';
      new QRCode(standeeQrHolder, {
        text: targetURL,
        width: 220,
        height: 220,
        colorDark: '#1C1C1E',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    renderCardFooterQR();
  }

  function renderCardFooterQR() {
    const targetURL = getQuizURL();
    if (cardFooterQrHolder && typeof QRCode !== 'undefined') {
      cardFooterQrHolder.innerHTML = '';
      new QRCode(cardFooterQrHolder, {
        text: targetURL,
        width: 58,
        height: 58,
        colorDark: '#1C1C1E',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.M
      });
    }
  }

  function openStandeeModal() {
    if (standeeModal) {
      standeeModal.classList.add('open');
      renderFixedQRCodes();
    }
  }

  function closeStandeeModal() {
    if (standeeModal) standeeModal.classList.remove('open');
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
    if (!standeeQrHolder) return;
    const canvas = standeeQrHolder.querySelector('canvas');
    if (canvas) {
      const a = document.createElement('a');
      a.download = 'MapMo-社群習慣心理測驗-QRCode.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      showToast('📥 QR Code 圖檔已成功下載！');
    }
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
