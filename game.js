// 五子棋游戏逻辑 - 增强版

const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const PADDING = 20;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const currentPlayerEl = document.getElementById('current-player');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');
const backBtn = document.getElementById('back-btn');
const timerBlackEl = document.getElementById('timer-black');
const timerWhiteEl = document.getElementById('timer-white');

// 模式选择界面
const modeSelectEl = document.getElementById('mode-select');
const gameUiEl = document.getElementById('game-ui');
const pvpBtn = document.getElementById('pvp-btn');
const pveBtn = document.getElementById('pve-btn');
const difficultySelectEl = document.getElementById('difficulty-select');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const backModeBtn = document.getElementById('back-mode-btn');

// 游戏结束弹窗
const gameOverModal = document.getElementById('game-over-modal');
const resultIcon = document.getElementById('result-icon');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const playAgainBtn = document.getElementById('play-again-btn');
const menuBtn = document.getElementById('menu-btn');

// 调整 canvas 大小
canvas.width = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;
canvas.height = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;

// 游戏状态
let board = [];
let currentPlayer = 1; // 1: 黑棋 (玩家), 2: 白棋 (玩家/AI)
let gameOver = false;
let lastMove = null;
let gameMode = 'pvp'; // 'pvp' 或 'pve'
let aiLevel = 'medium'; // 'easy', 'medium', 'hard'
let isAiThinking = false;

// 计时器
let timerBlack = 600; // 10 分钟 (秒)
let timerWhite = 600;
let timerInterval = null;
const BASE_TIME = 600; // 基础时间 10 分钟

// 初始化棋盘
function initBoard() {
    board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = 0;
        }
    }
}

// 绘制棋盘
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景
    ctx.fillStyle = '#dcb35c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(PADDING, PADDING + i * CELL_SIZE);
        ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, PADDING + i * CELL_SIZE);
        ctx.stroke();

        // 竖线
        ctx.beginPath();
        ctx.moveTo(PADDING + i * CELL_SIZE, PADDING);
        ctx.lineTo(PADDING + i * CELL_SIZE, PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
        ctx.stroke();
    }

    // 绘制天元和星位
    const stars = [
        [3, 3], [3, 11], [11, 3], [11, 11], [7, 7]
    ];

    ctx.fillStyle = '#8b4513';
    for (const [x, y] of stars) {
        ctx.beginPath();
        ctx.arc(PADDING + x * CELL_SIZE, PADDING + y * CELL_SIZE, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制棋子
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== 0) {
                drawPiece(i, j, board[i][j]);
            }
        }
    }

    // 标记最后一步
    if (lastMove) {
        const { x, y } = lastMove;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // 绘制十字标记
        const cx = PADDING + x * CELL_SIZE;
        const cy = PADDING + y * CELL_SIZE;
        ctx.moveTo(cx - 8, cy);
        ctx.lineTo(cx + 8, cy);
        ctx.moveTo(cx, cy - 8);
        ctx.lineTo(cx, cy + 8);
        ctx.stroke();
    }
}

// 绘制棋子
function drawPiece(x, y, player) {
    const centerX = PADDING + x * CELL_SIZE;
    const centerY = PADDING + y * CELL_SIZE;
    const radius = CELL_SIZE / 2 - 4;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    // 创建渐变效果
    const gradient = ctx.createRadialGradient(
        centerX - 5, centerY - 5, 0,
        centerX, centerY, radius
    );

    if (player === 1) {
        // 黑棋
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#000');
    } else {
        // 白棋
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
    }

    ctx.fillStyle = gradient;
    ctx.fill();

    // 棋子边框
    ctx.strokeStyle = player === 1 ? '#000' : '#ccc';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// 检查是否获胜
function checkWin(x, y, player) {
    const directions = [
        [[1, 0], [-1, 0]],   // 水平
        [[0, 1], [0, -1]],   // 垂直
        [[1, 1], [-1, -1]], // 对角线
        [[1, -1], [-1, 1]]  // 反对角线
    ];

    for (const [dir1, dir2] of directions) {
        let count = 1;

        // 向一个方向数
        let nx = x + dir1[0];
        let ny = y + dir1[1];
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) {
            count++;
            nx += dir1[0];
            ny += dir1[1];
        }

        // 向另一个方向数
        nx = x + dir2[0];
        ny = y + dir2[1];
        while (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[nx][ny] === player) {
            count++;
            nx += dir2[0];
            ny += dir2[1];
        }

        if (count >= 5) {
            return true;
        }
    }

    return false;
}

// 检查平局
function checkDraw() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 0) {
                return false;
            }
        }
    }
    return true;
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新计时器显示
function updateTimerDisplay() {
    timerBlackEl.textContent = formatTime(timerBlack);
    timerWhiteEl.textContent = formatTime(timerWhite);

    // 警告颜色
    if (currentPlayer === 1) {
        timerBlackEl.classList.toggle('warning', timerBlack <= 60 && timerBlack > 30);
        timerBlackEl.classList.toggle('danger', timerBlack <= 30);
        timerWhiteEl.classList.remove('warning', 'danger');
    } else {
        timerWhiteEl.classList.toggle('warning', timerWhite <= 60 && timerWhite > 30);
        timerWhiteEl.classList.toggle('danger', timerWhite <= 30);
        timerBlackEl.classList.remove('warning', 'danger');
    }
}

// 启动计时器
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameOver) return;

        if (currentPlayer === 1) {
            timerBlack--;
            if (timerBlack <= 0) {
                endGame(2, 'timeout');
                return;
            }
        } else {
            timerWhite--;
            if (timerWhite <= 0) {
                endGame(1, 'timeout');
                return;
            }
        }
        updateTimerDisplay();
    }, 1000);
}

// 重置计时器
function resetTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerBlack = BASE_TIME;
    timerWhite = BASE_TIME;
    updateTimerDisplay();
}

// 处理点击
function handleClick(e) {
    if (gameOver || isAiThinking) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算最近的交叉点
    const col = Math.round((x - PADDING) / CELL_SIZE);
    const row = Math.round((y - PADDING) / CELL_SIZE);

    // 检查是否在有效范围内
    if (col < 0 || col >= BOARD_SIZE || row < 0 || row >= BOARD_SIZE) {
        return;
    }

    // 检查该位置是否已有棋子
    if (board[row][col] !== 0) {
        return;
    }

    // 落子
    makeMove(row, col);
}

// 执行落子
function makeMove(row, col) {
    board[row][col] = currentPlayer;
    lastMove = { x: col, y: row };
    drawBoard();

    // 检查胜利
    if (checkWin(col, row, currentPlayer)) {
        gameOver = true;
        const winner = currentPlayer === 1 ? '黑棋' : '白棋';
        endGame(currentPlayer, 'win');
        return;
    }

    // 检查平局
    if (checkDraw()) {
        gameOver = true;
        endGame(0, 'draw');
        return;
    }

    // 切换玩家
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateCurrentPlayerDisplay();

    // 如果是 AI 回合
    if (gameMode === 'pve' && currentPlayer === 2 && !gameOver) {
        isAiThinking = true;
        setTimeout(() => {
            aiMove();
            isAiThinking = false;
        }, 500);
    }
}

// 更新当前玩家显示
function updateCurrentPlayerDisplay() {
    const playerText = currentPlayer === 1 ? '黑棋' : '白棋';
    if (gameMode === 'pve') {
        currentPlayerEl.textContent = `当前：${playerText}${currentPlayer === 2 ? '(电脑)' : ''}`;
    } else {
        currentPlayerEl.textContent = `当前：${playerText}`;
    }
}

// AI 落子
function aiMove() {
    if (gameOver) return;

    let move;
    switch (aiLevel) {
        case 'easy':
            move = getEasyMove();
            break;
        case 'medium':
            move = getMediumMove();
            break;
        case 'hard':
            move = getHardMove();
            break;
        default:
            move = getMediumMove();
    }

    if (move) {
        makeMove(move.row, move.col);
    }
}

// 获取所有空位
function getEmptySpots() {
    const spots = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 0) {
                spots.push({ row: i, col: j });
            }
        }
    }
    return spots;
}

// 获取有邻居的空位（提高 AI 效率）
function getNearbyEmptySpots() {
    const spots = [];
    const hasNeighbor = (row, col) => {
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                if (i === 0 && j === 0) continue;
                const nr = row + i;
                const nc = col + j;
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (board[nr][nc] !== 0) return true;
                }
            }
        }
        return false;
    };

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === 0 && hasNeighbor(i, j)) {
                spots.push({ row: i, col: j });
            }
        }
    }

    // 如果没有邻居，返回中心位置
    if (spots.length === 0 && board[7][7] === 0) {
        return [{ row: 7, col: 7 }];
    }

    return spots;
}

// 简单难度：随机落子
function getEasyMove() {
    const spots = getNearbyEmptySpots();
    if (spots.length === 0) return { row: 7, col: 7 };
    return spots[Math.floor(Math.random() * spots.length)];
}

// 中等难度：基础攻防
function getMediumMove() {
    const spots = getNearbyEmptySpots();
    if (spots.length === 0) return { row: 7, col: 7 };

    // 1. 检查是否有必胜位置
    for (const spot of spots) {
        board[spot.row][spot.col] = 2;
        if (checkWin(spot.col, spot.row, 2)) {
            board[spot.row][spot.col] = 0;
            return spot;
        }
        board[spot.row][spot.col] = 0;
    }

    // 2. 检查是否需要堵截玩家
    for (const spot of spots) {
        board[spot.row][spot.col] = 1;
        if (checkWin(spot.col, spot.row, 1)) {
            board[spot.row][spot.col] = 0;
            return spot;
        }
        board[spot.row][spot.col] = 0;
    }

    // 3. 随机选择
    return spots[Math.floor(Math.random() * spots.length)];
}

// 困难难度：评分系统
function getHardMove() {
    const spots = getNearbyEmptySpots();
    if (spots.length === 0) return { row: 7, col: 7 };

    let bestMove = null;
    let bestScore = -Infinity;

    for (const spot of spots) {
        // 评估 AI 在此落子的分数
        const attackScore = evaluatePosition(spot.row, spot.col, 2);
        // 评估玩家在此落子的分数（用于堵截）
        const defenseScore = evaluatePosition(spot.row, spot.col, 1);

        // 进攻分数 * 1.2 + 防守分数
        const score = attackScore * 1.2 + defenseScore;

        if (score > bestScore) {
            bestScore = score;
            bestMove = spot;
        }
    }

    return bestMove || spots[0];
}

// 评估某个位置的分数
function evaluatePosition(row, col, player) {
    let score = 0;
    const directions = [
        [1, 0],   // 水平
        [0, 1],   // 垂直
        [1, 1],   // 对角线
        [1, -1]   // 反对角线
    ];

    board[row][col] = player;

    for (const [dx, dy] of directions) {
        const result = evaluateDirection(row, col, dx, dy, player);
        score += result;
    }

    board[row][col] = 0;
    return score;
}

// 评估一个方向的分数
function evaluateDirection(row, col, dx, dy, player) {
    let count = 1;
    let openEnds = 0;

    // 正方向
    let i = 1;
    while (true) {
        const nr = row + dy * i;
        const nc = col + dx * i;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (board[nr][nc] === player) {
            count++;
        } else if (board[nr][nc] === 0) {
            openEnds++;
            break;
        } else {
            break;
        }
        i++;
    }

    // 反方向
    i = 1;
    while (true) {
        const nr = row - dy * i;
        const nc = col - dx * i;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (board[nr][nc] === player) {
            count++;
        } else if (board[nr][nc] === 0) {
            openEnds++;
            break;
        } else {
            break;
        }
        i++;
    }

    // 评分
    if (count >= 5) return 100000;
    if (count === 4) {
        if (openEnds === 2) return 10000;
        if (openEnds === 1) return 1000;
    }
    if (count === 3) {
        if (openEnds === 2) return 1000;
        if (openEnds === 1) return 100;
    }
    if (count === 2) {
        if (openEnds === 2) return 100;
        if (openEnds === 1) return 10;
    }
    if (count === 1 && openEnds === 2) return 10;

    return 1;
}

// 游戏结束
function endGame(winner, reason) {
    clearInterval(timerInterval);
    gameOver = true;

    let title = '';
    let message = '';
    let icon = '';
    let titleClass = '';

    if (reason === 'timeout') {
        if (winner === 1) {
            title = '黑方获胜!';
            message = '白方超时';
            icon = '⏰';
        } else {
            title = '白方获胜!';
            message = '黑方超时';
            icon = '⏰';
        }
        titleClass = winner === 1 ? 'win' : 'lose';
    } else if (winner === 0) {
        title = '平局!';
        message = '棋盘已满，势均力敌';
        icon = '🤝';
        titleClass = 'draw';
    } else if (gameMode === 'pve') {
        if (winner === 1) {
            title = '你赢了!';
            message = '恭喜你击败了电脑!';
            icon = '🏆';
            titleClass = 'win';
        } else {
            title = '电脑获胜!';
            message = '再接再厉，下次一定能赢!';
            icon = '💻';
            titleClass = 'lose';
        }
    } else {
        if (winner === 1) {
            title = '黑方获胜!';
            message = '恭喜黑棋赢得比赛!';
            icon = '🎉';
            titleClass = 'win';
        } else {
            title = '白方获胜!';
            message = '恭喜白棋赢得比赛!';
            icon = '🎊';
            titleClass = 'lose';
        }
    }

    resultIcon.textContent = icon;
    resultTitle.textContent = title;
    resultTitle.className = `result-title ${titleClass}`;
    resultMessage.textContent = message;

    setTimeout(() => {
        gameOverModal.classList.add('show');
    }, 300);
}

// 重新开始游戏
function restartGame() {
    initBoard();
    currentPlayer = 1;
    gameOver = false;
    lastMove = null;
    isAiThinking = false;
    resetTimer();
    currentPlayerEl.textContent = '当前：黑棋';
    messageEl.textContent = '';
    gameOverModal.classList.remove('show');
    drawBoard();
    startTimer();
}

// 返回主菜单
function showMainMenu() {
    gameOver = true;
    clearInterval(timerInterval);
    gameOverModal.classList.remove('show');
    gameUiEl.style.display = 'none';
    modeSelectEl.style.display = 'block';
    difficultySelectEl.style.display = 'none';
}

// 事件监听
canvas.addEventListener('click', handleClick);
restartBtn.addEventListener('click', restartGame);
backBtn.addEventListener('click', showMainMenu);

// 模式选择
pvpBtn.addEventListener('click', () => {
    gameMode = 'pvp';
    modeSelectEl.style.display = 'none';
    gameUiEl.style.display = 'flex';
    updateCurrentPlayerDisplay();
    restartGame();
});

pveBtn.addEventListener('click', () => {
    difficultySelectEl.style.display = 'block';
});

easyBtn.addEventListener('click', () => {
    aiLevel = 'easy';
    startPveGame();
});

mediumBtn.addEventListener('click', () => {
    aiLevel = 'medium';
    startPveGame();
});

hardBtn.addEventListener('click', () => {
    aiLevel = 'hard';
    startPveGame();
});

backModeBtn.addEventListener('click', () => {
    difficultySelectEl.style.display = 'none';
});

// 开始人机对战
function startPveGame() {
    gameMode = 'pve';
    modeSelectEl.style.display = 'none';
    gameUiEl.style.display = 'flex';
    difficultySelectEl.style.display = 'none';
    updateCurrentPlayerDisplay();
    restartGame();
}

// 弹窗按钮
playAgainBtn.addEventListener('click', restartGame);
menuBtn.addEventListener('click', showMainMenu);

// 添加扫描线效果
function addScanlines() {
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    document.body.appendChild(scanlines);
}
addScanlines();

// 初始化游戏
initBoard();
drawBoard();
