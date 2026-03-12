// 五子棋游戏逻辑

const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const PADDING = 20;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const currentPlayerEl = document.getElementById('current-player');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart-btn');

// 调整 canvas 大小
canvas.width = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;
canvas.height = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;

let board = [];
let currentPlayer = 1; // 1: 黑棋，2: 白棋
let gameOver = false;
let lastMove = null;

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
        ctx.arc(PADDING + x * CELL_SIZE, PADDING + y * CELL_SIZE, 3, 0, Math.PI * 2);
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

// 处理点击
function handleClick(e) {
    if (gameOver) return;

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
    board[row][col] = currentPlayer;
    lastMove = { x: col, y: row };
    drawBoard();

    // 检查胜利
    if (checkWin(col, row, currentPlayer)) {
        gameOver = true;
        const winner = currentPlayer === 1 ? '黑棋' : '白棋';
        messageEl.textContent = `🎉 ${winner}获胜！`;
        messageEl.className = currentPlayer === 1 ? 'win-black' : 'win-white';
        currentPlayerEl.textContent = '游戏结束';
        return;
    }

    // 检查平局
    if (checkDraw()) {
        gameOver = true;
        messageEl.textContent = '🤝 平局！';
        messageEl.className = '';
        currentPlayerEl.textContent = '游戏结束';
        return;
    }

    // 切换玩家
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentPlayerEl.textContent = `当前玩家：${currentPlayer === 1 ? '黑棋' : '白棋'}`;
}

// 重新开始
function restart() {
    initBoard();
    currentPlayer = 1;
    gameOver = false;
    lastMove = null;
    currentPlayerEl.textContent = '当前玩家：黑棋';
    messageEl.textContent = '';
    messageEl.className = '';
    drawBoard();
}

// 事件监听
canvas.addEventListener('click', handleClick);
restartBtn.addEventListener('click', restart);

// 初始化游戏
initBoard();
drawBoard();
