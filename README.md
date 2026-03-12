# 五子棋 (Gomoku)

经典的五子棋游戏，使用 HTML5 Canvas 和 JavaScript 实现。

## 在线游玩

[点击这里](https://wking.github.io/gomoku-game/) 直接在浏览器中游玩。

## 游戏规则

1. 黑棋先行，双方轮流落子
2. 先将五个同色棋子连成一线（横、竖、斜均可）者获胜
3. 点击棋盘交叉点落子
4. 棋盘大小为 15×15

## 功能特点

- 简洁美观的界面
- 棋子渐变效果
- 最后落子位置标记
- 胜负判定
- 支持重新开始

## 本地运行

直接打开 `index.html` 文件即可在浏览器中运行：

```bash
# 方法 1: 直接打开
open index.html

# 方法 2: 使用本地服务器
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

## 技术栈

- HTML5 Canvas
- CSS3 (渐变、动画)
- 原生 JavaScript (ES6+)

## 许可证

MIT License
