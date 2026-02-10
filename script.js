let aiGameCount = 1;
let likesCount = 0;
let activeCard = null;
let observer;
const likedGames = new Set();

function displayDateTime() {
  const now = new Date();
  const utc = `${now.toISOString().replace('T', ' ').substring(0, 19)} UTC`;
  const dateTimeEl = document.getElementById('dateTimeDisplay');
  if (dateTimeEl) {
    dateTimeEl.innerText = utc;
  }
}

function updateLikeUI() {
  const likesCountEl = document.getElementById('likesCount');
  const heartButton = document.getElementById('heartButton');
  if (likesCountEl) {
    likesCountEl.innerText = String(likesCount);
  }

  if (heartButton && activeCard) {
    const gameName = activeCard.dataset.game || '';
    const liked = likedGames.has(gameName);
    heartButton.classList.toggle('liked', liked);
    heartButton.innerText = liked ? '♥' : '♡';
  }
}

function trackVisibleGame(entries) {
  const activeGameEl = document.getElementById('activeGame');
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      activeCard = entry.target;
      if (activeGameEl) {
        activeGameEl.innerText = entry.target.dataset.game || 'Unknown Game';
      }
      updateLikeUI();
    }
  });
}

function setupTapDodge(miniGame) {
  let score = 0;
  let timer;
  const startBtn = miniGame.querySelector('.play-btn');
  const targetBtn = miniGame.querySelector('.target-btn');
  const status = miniGame.querySelector('.game-status');
  const scoreEl = miniGame.querySelector('.score');

  function endRound(hit) {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (targetBtn) {
      targetBtn.hidden = true;
    }

    if (status) {
      status.innerText = hit ? 'Nice dodge! Tap Start for next meteor.' : 'Impact! Too slow — try again.';
    }
  }

  if (startBtn && targetBtn && status && scoreEl) {
    startBtn.addEventListener('click', () => {
      status.innerText = 'Meteor incoming... tap it!';
      targetBtn.hidden = false;
      targetBtn.style.left = `${10 + Math.random() * 70}%`;
      timer = window.setTimeout(() => endRound(false), 1100);
    });

    targetBtn.addEventListener('click', () => {
      score += 1;
      scoreEl.innerText = String(score);
      endRound(true);
    });
  }
}

function setupMemoryRune(miniGame) {
  let sequence = [];
  let userIndex = 0;
  let score = 0;
  const startBtn = miniGame.querySelector('.play-btn');
  const runes = Array.from(miniGame.querySelectorAll('.rune'));
  const runeGrid = miniGame.querySelector('.rune-grid');
  const status = miniGame.querySelector('.game-status');
  const scoreEl = miniGame.querySelector('.score');

  function nextRound() {
    sequence.push(Math.floor(Math.random() * 3));
    userIndex = 0;
    if (status) {
      status.innerText = `Sequence: ${sequence.map((idx) => runes[idx]?.innerText || '').join(' ')}`;
    }
    window.setTimeout(() => {
      if (status) {
        status.innerText = 'Now repeat it by tapping runes.';
      }
    }, 900);
  }

  if (startBtn && runeGrid && status && scoreEl) {
    startBtn.addEventListener('click', () => {
      sequence = [];
      score = 0;
      scoreEl.innerText = '0';
      runeGrid.hidden = false;
      status.innerText = 'Watch the sequence...';
      nextRound();
    });

    runes.forEach((rune, index) => {
      rune.addEventListener('click', () => {
        if (!sequence.length) {
          return;
        }

        if (index === sequence[userIndex]) {
          userIndex += 1;
          if (userIndex === sequence.length) {
            score += 1;
            scoreEl.innerText = String(score);
            status.innerText = 'Correct! Next round...';
            window.setTimeout(nextRound, 700);
          }
        } else {
          status.innerText = 'Wrong rune. Tap Start to retry.';
          sequence = [];
        }
      });
    });
  }
}

function setupPowerBalance(miniGame) {
  let score = 0;
  let markerPos = 0;
  let direction = 1;
  let raf;
  const startBtn = miniGame.querySelector('.play-btn');
  const stopBtn = miniGame.querySelector('.stop-btn');
  const meter = miniGame.querySelector('.meter');
  const marker = miniGame.querySelector('.meter-marker');
  const status = miniGame.querySelector('.game-status');
  const scoreEl = miniGame.querySelector('.score');

  function animate() {
    markerPos += direction * 1.8;
    if (markerPos >= 94 || markerPos <= 0) {
      direction *= -1;
    }
    if (marker) {
      marker.style.left = `${markerPos}%`;
    }
    raf = requestAnimationFrame(animate);
  }

  if (startBtn && stopBtn && meter && marker && status && scoreEl) {
    startBtn.addEventListener('click', () => {
      meter.hidden = false;
      stopBtn.hidden = false;
      status.innerText = 'Stop in the green zone!';
      cancelAnimationFrame(raf);
      markerPos = 0;
      direction = 1;
      animate();
    });

    stopBtn.addEventListener('click', () => {
      cancelAnimationFrame(raf);
      const inZone = markerPos >= 42 && markerPos <= 60;
      if (inZone) {
        score += 1;
        scoreEl.innerText = String(score);
        status.innerText = 'Perfect balance!';
      } else {
        status.innerText = 'Grid unstable. Try again!';
      }
    });
  }
}

function setupLaneShift(miniGame) {
  let score = 0;
  let expected = 'left';
  const startBtn = miniGame.querySelector('.play-btn');
  const controls = miniGame.querySelector('.lane-controls');
  const laneBtns = Array.from(miniGame.querySelectorAll('.lane'));
  const status = miniGame.querySelector('.game-status');
  const scoreEl = miniGame.querySelector('.score');

  function setPrompt() {
    expected = Math.random() > 0.5 ? 'left' : 'right';
    if (status) {
      status.innerText = `Traffic incoming: switch ${expected.toUpperCase()}!`;
    }
  }

  if (startBtn && controls && status && scoreEl) {
    startBtn.addEventListener('click', () => {
      controls.hidden = false;
      score = 0;
      scoreEl.innerText = '0';
      setPrompt();
    });

    laneBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.lane === expected) {
          score += 1;
          scoreEl.innerText = String(score);
          status.innerText = 'Clean pass!';
          window.setTimeout(setPrompt, 500);
        } else {
          status.innerText = 'Crash! Wrong lane. Keep trying.';
        }
      });
    });
  }
}

function setupMiniGame(card) {
  const miniGame = card.querySelector('.mini-game');
  if (!miniGame) {
    return;
  }

  const type = miniGame.dataset.type;
  if (type === 'tap-dodge') {
    setupTapDodge(miniGame);
  } else if (type === 'memory-rune') {
    setupMemoryRune(miniGame);
  } else if (type === 'power-balance') {
    setupPowerBalance(miniGame);
  } else if (type === 'lane-shift') {
    setupLaneShift(miniGame);
  }
}

function attachCardBehavior(card) {
  if (observer) {
    observer.observe(card);
  }
  setupMiniGame(card);
}

function createAIGameCard() {
  const gameFeed = document.getElementById('gameFeed');
  if (!gameFeed) {
    return;
  }

  const themeName = window.prompt('AI game title?', `Dream Forge ${aiGameCount}`);
  if (!themeName) {
    return;
  }

  const card = document.createElement('article');
  card.className = 'game-card';
  card.dataset.game = themeName;
  card.style.background = 'var(--card-ai)';
  card.innerHTML = `
    <div class="game-head">
      <p class="genre">AI Arcade</p>
      <h2>${themeName}</h2>
      <p>Procedural tap challenge generated by AI.</p>
    </div>
    <section class="mini-game" data-type="tap-dodge">
      <p class="game-status">Tap Start then hit meteor before impact.</p>
      <button class="play-btn" type="button">Start</button>
      <button class="target-btn" type="button" hidden>☄️</button>
      <p>Score: <span class="score">0</span></p>
    </section>
  `;

  gameFeed.prepend(card);
  attachCardBehavior(card);
  aiGameCount += 1;
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.addEventListener('DOMContentLoaded', () => {
  displayDateTime();
  setInterval(displayDateTime, 1000);

  const gameFeed = document.getElementById('gameFeed');
  const cards = document.querySelectorAll('.game-card');
  observer = new IntersectionObserver(trackVisibleGame, {
    root: gameFeed,
    threshold: 0.62
  });

  cards.forEach((card) => attachCardBehavior(card));

  const aiCreateButton = document.getElementById('aiCreateButton');
  if (aiCreateButton) {
    aiCreateButton.addEventListener('click', createAIGameCard);
  }

  const heartButton = document.getElementById('heartButton');
  if (heartButton) {
    heartButton.addEventListener('click', () => {
      if (!activeCard) {
        return;
      }
      const gameName = activeCard.dataset.game || '';
      if (!gameName) {
        return;
      }

      if (likedGames.has(gameName)) {
        likedGames.delete(gameName);
        likesCount = Math.max(0, likesCount - 1);
      } else {
        likedGames.add(gameName);
        likesCount += 1;
      }
      updateLikeUI();
    });
  }
});
