const board = document.getElementById("board");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const clearBtn = document.getElementById("clearBtn");
const backBtn = document.getElementById("backBtn");
const turnInfo = document.getElementById("turnInfo");
const playerForm = document.getElementById("playerForm");
const gameInfo = document.getElementById("gameInfo");
const boardCard = document.getElementById("boardCard");
const recordsCard = document.getElementById("recordsCard"); // NEW
const recordsList = document.getElementById("records");
const modeCard = document.getElementById("modeCard");
const friendMode = document.getElementById("friendMode");
const aiMode = document.getElementById("aiMode");
const formBackBtn = document.getElementById("formBackBtn");
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");

let players = [];
let currentPlayer = 0;
let gameState = Array(9).fill("");
let gameActive = false;
let isAI = false;

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

friendMode.onclick = () => {
  isAI = false;
  modeCard.classList.add("d-none");
  playerForm.classList.remove("d-none");
};

aiMode.onclick = () => {
  isAI = true;
  modeCard.classList.add("d-none");
  playerForm.classList.remove("d-none");
  player2.value = "AI Bot";
  player2.disabled = true;
};

formBackBtn.onclick = () => location.reload();


function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.dataset.index = i;
    cell.className = "board-cell";
    cell.onclick = handleClick;
    board.appendChild(cell);
  }
}


function handleClick(e) {
  const i = e.target.dataset.index;
  if (!gameActive || gameState[i]) return;

  gameState[i] = currentPlayer === 0 ? "X" : "O";
  e.target.innerHTML = `<span>${gameState[i]}</span>`;

  e.target.style.color = currentPlayer === 0 ? "#facc15" : "#22d3ee";

  if (checkWin()) {
    highlightWin();
    endGame(`${players[currentPlayer]} Wins!`);
    firework();
    return;
  }

  if (!gameState.includes("")) {
    endGame("Draw!");
    return;
  }

  currentPlayer = 1 - currentPlayer;
  updateTurn();

  if (isAI && currentPlayer === 1) {
    setTimeout(() => aiMove(), 300);
  }
}


function updateTurn() {
  turnInfo.textContent = `${players[currentPlayer]}'s Turn`;
  turnInfo.style.color = currentPlayer === 0 ? "#facc15" : "#22d3ee";
}


startBtn.onclick = () => {
  players = [player1.value || "Player 1", player2.value || "Player 2"];
  gameActive = true;
  currentPlayer = 0;
  gameState.fill("");
  playerForm.classList.add("d-none");
  gameInfo.classList.remove("d-none");
  boardCard.classList.remove("d-none");
  recordsCard.classList.remove("d-none"); // SHOW Game Records only now
  createBoard();
  updateTurn();
};

resetBtn.onclick = startBtn.onclick;
clearBtn.onclick = () => {
  gameState.fill("");
  createBoard();
  updateTurn();
};
backBtn.onclick = () => location.reload();


function checkWin() {
  return wins.some((w) =>
    w.every((i) => gameState[i] && gameState[i] === gameState[w[0]])
  );
}

function highlightWin() {
  for (const w of wins) {
    if (
      w.every((i) => gameState[i] === gameState[w[0]] && gameState[i] !== "")
    ) {
      w.forEach((i) => board.children[i].classList.add("highlight"));
    }
  }
}

function endGame(msg) {
  setTimeout(() => alert(msg), 100);
  const li = document.createElement("li");
  li.textContent = msg;
  recordsList.appendChild(li);
  gameActive = false;
}

function aiMove() {
  const bestMove = minimax(gameState, 1).index;
  document.querySelector(`[data-index="${bestMove}"]`).click();
}

function minimax(newBoard, player) {
  const availSpots = newBoard
    .map((v, i) => (v === "" ? i : null))
    .filter((v) => v !== null);
  if (checkWinStatic(newBoard, "X")) return { score: -10 };
  if (checkWinStatic(newBoard, "O")) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  let moves = [];
  for (let i of availSpots) {
    let move = {};
    move.index = i;
    newBoard[i] = player === 1 ? "O" : "X";
    let result = minimax(newBoard, player === 1 ? 0 : 1);
    move.score = result.score;
    newBoard[i] = "";
    moves.push(move);
  }

  let bestMove;
  if (player === 1) {
    let bestScore = -Infinity;
    for (let m of moves) {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
    return bestMove;
  } else {
    let bestScore = Infinity;
    for (let m of moves) {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = m;
      }
    }
    return bestMove;
  }
}


function checkWinStatic(boardArr, symbol) {
  return wins.some((w) => w.every((i) => boardArr[i] === symbol));
}


const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

function firework() {
  let p = [];
  for (let i = 0; i < 120; i++) {
    p.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      a: 1,
      c: `hsl(${Math.random() * 360},100%,60%)`,
    });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    p.forEach((x) => {
      x.x += x.vx;
      x.y += x.vy;
      x.a -= 0.01;
      ctx.globalAlpha = x.a;
      ctx.fillStyle = x.c;
      ctx.beginPath();
      ctx.arc(x.x, x.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    if (p[0].a > 0) requestAnimationFrame(animate);
  }
  animate();
}