/**
 * Lotto 6/45 Generator Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // App State
  const state = {
    gameCount: 1,
    includeNumbers: new Set(),
    excludeNumbers: new Set(),
    oddEvenFilter: true,
    sumFilter: true,
    pickerMode: 'include', // 'include' or 'exclude'
    currentGames: [],
    history: JSON.parse(localStorage.getItem('lotto_history') || '[]'),
    favorites: JSON.parse(localStorage.getItem('lotto_favorites') || '[]'),
    soundEnabled: true,
    theme: localStorage.getItem('lotto_theme') || 'dark'
  };

  // DOM Elements
  const soundToggle = document.getElementById('soundToggle');
  const themeToggle = document.getElementById('themeToggle');
  const segButtons = document.querySelectorAll('.seg-btn');
  const oddEvenFilterInput = document.getElementById('oddEvenFilter');
  const sumFilterInput = document.getElementById('sumFilter');
  const generateBtn = document.getElementById('generateBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultActions = document.getElementById('resultActions');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const saveFavoriteBtn = document.getElementById('saveFavoriteBtn');
  const innerBalls = document.getElementById('innerBalls');
  const activeExtractBall = document.getElementById('activeExtractBall');

  // Modal Elements
  const pickerModal = document.getElementById('pickerModal');
  const openNumberPicker = document.getElementById('openNumberPicker');
  const closeModal = document.getElementById('closeModal');
  const pickerGrid = document.getElementById('pickerGrid');
  const includeTags = document.getElementById('includeTags');
  const excludeTags = document.getElementById('excludeTags');
  const resetPickerBtn = document.getElementById('resetPickerBtn');
  const savePickerBtn = document.getElementById('savePickerBtn');
  const filterBadge = document.getElementById('filterBadge');
  const modeButtons = document.querySelectorAll('.mode-btn');

  // Tabs Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const historyList = document.getElementById('historyList');
  const favoritesList = document.getElementById('favoritesList');
  const toast = document.getElementById('toast');

  // Web Audio Synthesizer for Ball Pops
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  function playPopSound(freq = 440) {
    if (!state.soundEnabled) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.error(e);
    }
  }

  // Helper: Get Official Lotto Ball Color Class
  function getBallColorClass(num) {
    if (num <= 10) return 'b-yellow';
    if (num <= 20) return 'b-blue';
    if (num <= 30) return 'b-red';
    if (num <= 40) return 'b-purple';
    return 'b-green';
  }

  // Initialize UI & Theme
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();
  renderInnerMachineBalls();
  renderHistory();
  renderFavorites();
  updateStats();

  // Theme Toggle
  themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('lotto_theme', state.theme);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    if (state.theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  }

  // Sound Toggle
  soundToggle.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    const icon = soundToggle.querySelector('i');
    if (state.soundEnabled) {
      icon.className = 'fa-solid fa-volume-high';
      showToast('🔊 사운드가 켜졌습니다.');
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
      showToast('🔇 사운드가 꺼졌습니다.');
    }
  });

  // Game Count Selection
  segButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      segButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.gameCount = parseInt(btn.dataset.count);
      playPopSound(500);
    });
  });

  // Filter Checkboxes
  oddEvenFilterInput.addEventListener('change', (e) => state.oddEvenFilter = e.target.checked);
  sumFilterInput.addEventListener('change', (e) => state.sumFilter = e.target.checked);

  // Floating Balls inside Machine
  function renderInnerMachineBalls() {
    innerBalls.innerHTML = '';
    const sampleColors = ['b-yellow', 'b-blue', 'b-red', 'b-purple', 'b-green'];
    for (let i = 0; i < 18; i++) {
      const ball = document.createElement('div');
      ball.className = `mini-ball lotto-ball ${sampleColors[i % 5]}`;
      ball.style.top = `${Math.random() * 70 + 10}%`;
      ball.style.left = `${Math.random() * 70 + 10}%`;
      ball.style.animationDelay = `${Math.random() * 2}s`;
      innerBalls.appendChild(ball);
    }
  }

  // Random Single Game Generator Algorithm
  function generateSingleGame() {
    const pool = [];
    for (let i = 1; i <= 45; i++) {
      if (!state.excludeNumbers.has(i)) {
        pool.push(i);
      }
    }

    const maxAttempts = 1000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const selected = new Set(state.includeNumbers);
      const tempPool = pool.filter(n => !selected.has(n));
      
      // Shuffle pool
      for (let i = tempPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tempPool[i], tempPool[j]] = [tempPool[j], tempPool[i]];
      }

      while (selected.size < 6 && tempPool.length > 0) {
        selected.add(tempPool.pop());
      }

      if (selected.size === 6) {
        const arr = Array.from(selected).sort((a, b) => a - b);
        
        // Check Odd/Even ratio
        if (state.oddEvenFilter) {
          const oddCount = arr.filter(n => n % 2 !== 0).length;
          if (oddCount < 2 || oddCount > 4) continue;
        }

        // Check Sum range
        if (state.sumFilter) {
          const sum = arr.reduce((acc, curr) => acc + curr, 0);
          if (sum < 100 || sum > 175) continue;
        }

        return arr;
      }
    }

    // Fallback if filter constraints are too strict
    const fallback = Array.from(state.includeNumbers);
    while (fallback.length < 6) {
      const r = Math.floor(Math.random() * 45) + 1;
      if (!state.excludeNumbers.has(r) && !fallback.includes(r)) {
        fallback.push(r);
      }
    }
    return fallback.sort((a, b) => a - b);
  }

  // Main Generator Trigger
  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true;
    playPopSound(600);

    // Extraction Animation
    activeExtractBall.innerHTML = '';
    const animCount = 6;
    for (let i = 0; i < animCount; i++) {
      const randNum = Math.floor(Math.random() * 45) + 1;
      const colorClass = getBallColorClass(randNum);
      activeExtractBall.innerHTML = `<div class="lotto-ball ${colorClass}">${randNum}</div>`;
      playPopSound(300 + i * 50);
      await new Promise(r => setTimeout(r, 80));
    }
    activeExtractBall.innerHTML = '';

    // Generate sets
    const games = [];
    const labels = ['A', 'B', 'C', 'D', 'E'];
    for (let i = 0; i < state.gameCount; i++) {
      games.push({
        label: `게임 ${labels[i]}`,
        numbers: generateSingleGame()
      });
    }

    state.currentGames = games;
    renderResults(games);

    // Add to history
    state.history.unshift({
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      games: games
    });
    if (state.history.length > 20) state.history.pop();
    localStorage.setItem('lotto_history', JSON.stringify(state.history));
    
    renderHistory();
    updateStats();
    generateBtn.disabled = false;
  });

  // Render Result Cards
  function renderResults(games) {
    resultsContainer.innerHTML = '';
    resultActions.style.display = 'flex';

    games.forEach((g, idx) => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.style.animationDelay = `${idx * 0.1}s`;

      const oddCount = g.numbers.filter(n => n % 2 !== 0).length;
      const evenCount = 6 - oddCount;
      const sum = g.numbers.reduce((a, b) => a + b, 0);

      const ballsHTML = g.numbers.map(num => `
        <div class="lotto-ball ${getBallColorClass(num)}">${num}</div>
      `).join('');

      card.innerHTML = `
        <div class="game-label">${g.label}</div>
        <div class="ball-row">${ballsHTML}</div>
        <div class="game-info">
          <span>홀:짝 ${oddCount}:${evenCount}</span>
          <span>총합 ${sum}</span>
        </div>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Copy Results to Clipboard
  copyAllBtn.addEventListener('click', () => {
    if (!state.currentGames.length) return;
    const text = state.currentGames.map(g => `${g.label}: ${g.numbers.join(', ')}`).join('\n');
    navigator.clipboard.writeText(`[로또 6/45 행운 번호]\n${text}`);
    showToast('📋 번호가 클립보드에 복사되었습니다!');
    playPopSound(800);
  });

  // Save Favorite Set
  saveFavoriteBtn.addEventListener('click', () => {
    if (!state.currentGames.length) return;
    state.favorites.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR'),
      games: state.currentGames
    });
    localStorage.setItem('lotto_favorites', JSON.stringify(state.favorites));
    renderFavorites();
    showToast('⭐ 즐겨찾기 보관함에 저장되었습니다.');
    playPopSound(900);
  });

  // Modal & Number Picker Logic
  openNumberPicker.addEventListener('click', () => {
    pickerModal.classList.add('open');
    renderPickerGrid();
  });

  closeModal.addEventListener('click', () => pickerModal.classList.remove('open'));
  savePickerBtn.addEventListener('click', () => {
    pickerModal.classList.remove('open');
    updateFilterBadge();
    showToast('✅ 필터 옵션이 적용되었습니다.');
  });

  resetPickerBtn.addEventListener('click', () => {
    state.includeNumbers.clear();
    state.excludeNumbers.clear();
    renderPickerGrid();
    updateFilterBadge();
  });

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.pickerMode = btn.dataset.mode;
    });
  });

  function renderPickerGrid() {
    pickerGrid.innerHTML = '';
    for (let i = 1; i <= 45; i++) {
      const b = document.createElement('button');
      b.className = 'picker-ball';
      b.textContent = i;

      if (state.includeNumbers.has(i)) b.classList.add('selected-include');
      if (state.excludeNumbers.has(i)) b.classList.add('selected-exclude');

      b.addEventListener('click', () => {
        if (state.pickerMode === 'include') {
          if (state.includeNumbers.has(i)) {
            state.includeNumbers.delete(i);
          } else {
            if (state.includeNumbers.size >= 5) {
              showToast('⚠️ 포함 번호는 최대 5개까지 지정 가능합니다.');
              return;
            }
            state.excludeNumbers.delete(i);
            state.includeNumbers.add(i);
          }
        } else {
          if (state.excludeNumbers.has(i)) {
            state.excludeNumbers.delete(i);
          } else {
            if (state.excludeNumbers.size >= 15) {
              showToast('⚠️ 제외 번호는 최대 15개까지 지정 가능합니다.');
              return;
            }
            state.includeNumbers.delete(i);
            state.excludeNumbers.add(i);
          }
        }
        playPopSound(400 + i * 10);
        renderPickerGrid();
      });
      pickerGrid.appendChild(b);
    }
    renderSummaryTags();
  }

  function renderSummaryTags() {
    includeTags.innerHTML = state.includeNumbers.size > 0 
      ? Array.from(state.includeNumbers).map(n => `<span class="badge b-yellow">${n}</span>`).join('') 
      : '<span class="none">없음</span>';

    excludeTags.innerHTML = state.excludeNumbers.size > 0 
      ? Array.from(state.excludeNumbers).map(n => `<span class="badge b-red">${n}</span>`).join('') 
      : '<span class="none">없음</span>';
  }

  function updateFilterBadge() {
    const total = state.includeNumbers.size + state.excludeNumbers.size;
    filterBadge.textContent = total;
  }

  // Tabs Switch Logic
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // Render History List
  function renderHistory() {
    if (!state.history.length) {
      historyList.innerHTML = '<p class="text-muted">최근 생성된 번호 내역이 없습니다.</p>';
      return;
    }
    historyList.innerHTML = state.history.slice(0, 5).map(item => `
      <div class="history-item" style="padding: 10px; border-bottom: 1px dashed var(--card-border);">
        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">⏱ ${item.timestamp}</div>
        ${item.games.map(g => `<span style="font-weight:700; margin-right:10px;">${g.label}: ${g.numbers.join(', ')}</span>`).join('<br>')}
      </div>
    `).join('');
  }

  // Render Favorites List
  function renderFavorites() {
    if (!state.favorites.length) {
      favoritesList.innerHTML = '<p class="text-muted">저장된 즐겨찾기 번호가 없습니다.</p>';
      return;
    }
    favoritesList.innerHTML = state.favorites.map(item => `
      <div class="favorite-item" style="padding: 10px; border-bottom: 1px dashed var(--card-border); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:0.8rem; color:var(--text-muted);">📅 ${item.date}</div>
          ${item.games.map(g => `<div><strong>${g.label}:</strong> ${g.numbers.join(', ')}</div>`).join('')}
        </div>
        <button onclick="deleteFavorite(${item.id})" class="btn btn-sm btn-outline" style="color:#e53935;">삭제</button>
      </div>
    `).join('');
  }

  window.deleteFavorite = function(id) {
    state.favorites = state.favorites.filter(f => f.id !== id);
    localStorage.setItem('lotto_favorites', JSON.stringify(state.favorites));
    renderFavorites();
    showToast('🗑️ 즐겨찾기가 삭제되었습니다.');
  };

  // Update Color Range Stats
  function updateStats() {
    const counts = [0, 0, 0, 0, 0];
    let totalBalls = 0;

    state.history.forEach(item => {
      item.games.forEach(g => {
        g.numbers.forEach(num => {
          totalBalls++;
          if (num <= 10) counts[0]++;
          else if (num <= 20) counts[1]++;
          else if (num <= 30) counts[2]++;
          else if (num <= 40) counts[3]++;
          else counts[4]++;
        });
      });
    });

    for (let i = 0; i < 5; i++) {
      const percentage = totalBalls > 0 ? (counts[i] / totalBalls) * 100 : 0;
      document.getElementById(`bar${i+1}`).style.width = `${percentage}%`;
      document.getElementById(`count${i+1}`).textContent = `${counts[i]}회 (${percentage.toFixed(1)}%)`;
    }
  }

  // Toast Function
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});
