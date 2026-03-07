(function () {
  const CELL_SIZE = 24;
  const GRID_W = 20;
  const GRID_H = 20;
  const TICK_MS = 120;
  const MAX_LEN = GRID_W * GRID_H;

  const DIRS = {
    up: { x: 0, y: -1, id: "up" },
    down: { x: 0, y: 1, id: "down" },
    left: { x: -1, y: 0, id: "left" },
    right: { x: 1, y: 0, id: "right" },
  };

  function isOpposite(a, b) {
    return a.x + b.x === 0 && a.y + b.y === 0;
  }

  function makeRng(seed) {
    let state = seed >>> 0;
    return function next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state;
    };
  }

  function keyOf(p) {
    return `${p.x},${p.y}`;
  }

  function createInitialState(seed) {
    const centerY = Math.floor(GRID_H / 2);
    const centerX = Math.floor(GRID_W / 2);
    const snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];

    const state = {
      snake,
      dir: DIRS.right,
      nextDir: DIRS.right,
      food: { x: 0, y: 0 },
      score: 0,
      isGameOver: false,
      isPaused: false,
      rng: makeRng(seed),
    };

    spawnFood(state);
    return state;
  }

  function spawnFood(state) {
    const occupied = new Set(state.snake.map(keyOf));
    const free = [];

    for (let y = 0; y < GRID_H; y += 1) {
      for (let x = 0; x < GRID_W; x += 1) {
        const p = { x, y };
        if (!occupied.has(keyOf(p))) {
          free.push(p);
        }
      }
    }

    if (free.length === 0) {
      state.isGameOver = true;
      return;
    }

    const idx = state.rng() % free.length;
    state.food = free[idx];
  }

  function setDirection(state, next) {
    if (state.isGameOver) return;
    if (state.snake.length > 1 && isOpposite(next, state.dir)) return;
    if (state.snake.length > 1 && isOpposite(next, state.nextDir)) return;
    state.nextDir = next;
  }

  function step(state) {
    if (state.isGameOver || state.isPaused) return;

    state.dir = state.nextDir;
    const head = state.snake[0];
    const newHead = { x: head.x + state.dir.x, y: head.y + state.dir.y };

    if (newHead.x < 0 || newHead.x >= GRID_W || newHead.y < 0 || newHead.y >= GRID_H) {
      state.isGameOver = true;
      return;
    }

    const willEat = newHead.x === state.food.x && newHead.y === state.food.y;
    const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

    for (let i = 0; i < bodyToCheck.length; i += 1) {
      if (bodyToCheck[i].x === newHead.x && bodyToCheck[i].y === newHead.y) {
        state.isGameOver = true;
        return;
      }
    }

    state.snake.unshift(newHead);

    if (willEat) {
      state.score += 1;
      if (state.snake.length < MAX_LEN) {
        spawnFood(state);
      } else {
        state.isGameOver = true;
      }
    } else {
      state.snake.pop();
    }
  }

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const statusEl = document.getElementById("status");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const controlButtons = Array.from(document.querySelectorAll(".ctrl"));

  canvas.width = GRID_W * CELL_SIZE;
  canvas.height = GRID_H * CELL_SIZE;

  let state = createInitialState(1337);
  let last = performance.now();
  let acc = 0;

  function restart() {
    state = createInitialState(1337);
    pauseBtn.textContent = "Pause";
  }

  function setStatusText() {
    if (state.isGameOver) {
      statusEl.textContent = "Game Over";
    } else if (state.isPaused) {
      statusEl.textContent = "Paused";
    } else {
      statusEl.textContent = "Running";
    }
  }

  function drawGrid() {
    ctx.fillStyle = "#faf8f1";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#ddd6c5";
    ctx.lineWidth = 1;
    for (let x = 0; x <= GRID_W; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE + 0.5, 0);
      ctx.lineTo(x * CELL_SIZE + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE + 0.5);
      ctx.lineTo(canvas.width, y * CELL_SIZE + 0.5);
      ctx.stroke();
    }
  }

  function drawCell(point, color) {
    const pad = 2;
    ctx.fillStyle = color;
    ctx.fillRect(point.x * CELL_SIZE + pad, point.y * CELL_SIZE + pad, CELL_SIZE - pad * 2, CELL_SIZE - pad * 2);
  }

  function render() {
    drawGrid();

    drawCell(state.food, "#b83b3b");

    for (let i = state.snake.length - 1; i >= 1; i -= 1) {
      drawCell(state.snake[i], "#2f6f3e");
    }
    drawCell(state.snake[0], "#1f4d2a");

    scoreEl.textContent = String(state.score);
    setStatusText();
  }

  function loop(now) {
    const dt = now - last;
    last = now;
    acc += dt;

    while (acc >= TICK_MS) {
      step(state);
      acc -= TICK_MS;
    }

    render();
    requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "p", "r"].includes(key)) {
      e.preventDefault();
    }

    if (key === "arrowup" || key === "w") setDirection(state, DIRS.up);
    if (key === "arrowdown" || key === "s") setDirection(state, DIRS.down);
    if (key === "arrowleft" || key === "a") setDirection(state, DIRS.left);
    if (key === "arrowright" || key === "d") setDirection(state, DIRS.right);
    if (key === "p" && !state.isGameOver) {
      state.isPaused = !state.isPaused;
      pauseBtn.textContent = state.isPaused ? "Resume" : "Pause";
    }
    if (key === "r") restart();
  });

  pauseBtn.addEventListener("click", () => {
    if (state.isGameOver) return;
    state.isPaused = !state.isPaused;
    pauseBtn.textContent = state.isPaused ? "Resume" : "Pause";
  });

  restartBtn.addEventListener("click", restart);

  controlButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.dir;
      if (DIRS[dir]) setDirection(state, DIRS[dir]);
    });
  });

  render();
  requestAnimationFrame(loop);
})();