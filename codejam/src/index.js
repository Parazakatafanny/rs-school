const body = document.querySelector("body");
let soundIsOn = true;
const sound = new Audio("src/meaw.mp3");

const container = document.createElement("div");
const buttonsContainer = document.createElement("div");
const infoContainer = document.createElement("div");

const movesBlock = document.createElement("div");
movesBlock.classList.add("moves");
const movesLabel = document.createElement("div");
movesLabel.classList.add("label");
const movesValue = document.createElement("div");
movesValue.classList.add("value");
movesValue.innerHTML = "0";

movesLabel.innerHTML = "MOVES:";

movesBlock.appendChild(movesLabel);
movesBlock.appendChild(movesValue);

const timerBlock = document.createElement("div");
timerBlock.classList.add("timer");
const timerLabel = document.createElement("div");
timerLabel.classList.add("label");
const timerValue = document.createElement("div");
timerValue.classList.add("value");

timerLabel.innerHTML = "TIMER:";
timerValue.innerHTML = "00:00";

timerBlock.appendChild(timerLabel);
timerBlock.appendChild(timerValue);
infoContainer.appendChild(timerBlock);

let timerId = null;
let seconds = +(localStorage.getItem("seconds") || 0);
renderTimer();

const leaderBoard = JSON.parse(localStorage.getItem("leaderBoard")) || {};

function renderTimer() {
  let dhours = Math.floor(seconds / 3600);
  let dminutes = Math.floor(seconds / 60) - dhours * 60;
  let dseconds = seconds - dminutes * 60;

  timerValue.innerHTML = `${zeroFill(dminutes)}:${zeroFill(dseconds)}`;

  if (dhours !== 0) {
    timerValue.innerHTML = `${zeroFill(dhours)}:${zeroFill(
      dminutes
    )}:${zeroFill(dseconds)}`;
  }
}

function startTimer() {
  timerId = setInterval(() => {
    if (!isStarted) {
      return;
    }

    seconds += 1;
    renderTimer();
  }, 1000);
}

function zeroFill(time) {
  let _time = time + "";
  if (_time.length < 2) {
    return "0" + time;
  }
  return _time;
}

function clearTimer() {
  seconds = 0;
  renderTimer();
}

function stopTimer() {
  clearInterval(timerId);
}

infoContainer.appendChild(movesBlock);

infoContainer.classList.add("info-container");
buttonsContainer.classList.add("buttons-container");
container.classList.add("container");

body.appendChild(container);
container.appendChild(buttonsContainer);
container.appendChild(infoContainer);

const startButton = document.createElement("button");
startButton.innerHTML = "Start";
buttonsContainer.appendChild(startButton);

const stopButton = document.createElement("button");
stopButton.innerHTML = "Stop";
buttonsContainer.appendChild(stopButton);

const saveButton = document.createElement("button");
saveButton.innerHTML = "Save";
buttonsContainer.appendChild(saveButton);

const soundOff = document.createElement("img");
soundOff.classList.add("soundOff");
soundOff.src = "src/on.png";
soundOff.alt = "sound is on";

const soundOff2 = document.createElement("img");
soundOff2.classList.add("soundOff2");
soundOff2.src = "src/off.png";
soundOff2.alt = "sound is off";

buttonsContainer.appendChild(soundOff);
buttonsContainer.appendChild(soundOff2);

let isStarted = false;

class Cell {
  constructor({ size, value, x, y }) {
    this.size = size;
    this.grabbable = false;

    this.x = x;
    this.y = y;

    this.value = value;

    this.htmlElem = document.createElement("div");
    this.htmlElem.classList.add("cell");

    this.render();
  }

  render() {
    this.htmlElem.style.width = `${this.size}px`;
    this.htmlElem.style.height = `${this.size}px`;

    this.htmlElem.innerHTML = this.value;

    this.htmlElem.style.top = `${this.y}px`;
    this.htmlElem.style.left = `${this.x}px`;

    if (this.grabbable) {
      this.htmlElem.style.cursor = "grab";
    } else {
      this.htmlElem.style.cursor = "inherit";
    }
  }

  cleanup() {
    this.htmlElem.remove();
  }
}

class Board {
  constructor(size = 4) {
    this.size = size;
    this.cells = [];
    this.movesCount = 0;
    this.isDragging = false;

    this.lastRender = new Date();

    this.committedMoves = [];

    this.listeners = {};
    this.allowedEvents = new Set(["onMove", "onWin"]);

    const board = document.createElement("div");
    board.classList.add("board");

    this.htmlElem = board;
    container.appendChild(board);

    this.loaded = false;

    window.addEventListener("mousemove", (e) => {
      this.handleDragMove(e);
    });
    window.addEventListener("mouseup", (e) => {
      if (!this.isDragging) {
        return;
      }

      const [x, y] = this.startDragPosition;
      const xOffset = Math.abs(x - e.screenX);
      const yOffset = Math.abs(y - e.screenY);

      if (xOffset < 6 && yOffset < 6) {
        this.isDragging = false;
        this.handleClick(this.draggingCell);
      } else {
        this.handleDragStop();
      }
    });
  }

  loadState() {
    const size = localStorage.getItem("size");
    if (!size) {
      return;
    }

    this.loaded = true;
    this.changeSize(+size);
    this.movesCount = localStorage.getItem("movesCount");

    const cells = JSON.parse(localStorage.getItem("cells"));
    const boardWidth = this.htmlElem.clientWidth;
    const cellSize = boardWidth / this.size;

    let x_count = 0;
    let y_count = 0;

    cells.forEach((value) => {
      if (x_count === this.size) {
        y_count += 1;
        x_count = 0;
      }

      if (value === null) {
        this.cells.push(value);
        x_count++;
        return;
      }

      const x = x_count * cellSize;
      const y = y_count * cellSize;

      const cell = new Cell({
        x: x,
        y: y,
        value,
        size: cellSize
      });
      this.htmlElem.appendChild(cell.htmlElem);
      this._attachEventListeners(cell);
      this.cells.push(cell);

      x_count += 1;
    });

    this._notify("onMove");
  }

  isWon() {
    let prev = this.cells[0];
    if (!prev) {
      return false;
    }

    for (let i = 1; i < this.cells.length - 1; i++) {
      if (!this.cells[i]) {
        return false;
      }

      if (this.cells[i].value - prev.value !== 1) {
        return false;
      }

      prev = this.cells[i];
    }

    return true;
  }

  changeSize(newSize) {
    this.cleanup();
    this.size = newSize;
  }

  cleanup() {
    this.cells.forEach((c) => c?.cleanup());
    this.cells = [];
  }

  canMoveUP(i) {
    const t = i - this.size;
    return t >= 0 && this.cells[t] === null;
  }

  canMoveLEFT(i) {
    const row = Math.floor(i / this.size);

    const min = row * this.size;
    const t = i - 1;

    if (t < min) {
      return false;
    }

    return this.cells[t] === null;
  }

  canMoveRIGHT(i) {
    const row = Math.floor(i / this.size);

    const min = row * this.size;
    const max = min + this.size - 1;

    const t = i + 1;
    if (t > max) {
      return false;
    }

    return this.cells[t] === null;
  }

  canMoveDOWN(i) {
    const t = i + this.size;
    return t < this.size ** 2 && this.cells[t] === null;
  }

  canMoveANY(i) {
    return (
      this.canMoveUP(i) ||
      this.canMoveDOWN(i) ||
      this.canMoveLEFT(i) ||
      this.canMoveRIGHT(i)
    );
  }

  move(cellI, emptyI, isShuffle = false) {
    const emptyRow = Math.floor(emptyI / this.size);

    const x = this.cells[cellI].size * (emptyI - emptyRow * this.size);
    const y = this.cells[cellI].size * emptyRow;

    this.cells[cellI].x = x;
    this.cells[cellI].y = y;

    this.cells[cellI].render();

    [this.cells[cellI], this.cells[emptyI]] = [
      this.cells[emptyI],
      this.cells[cellI]
    ];

    this.committedMoves.push([cellI, emptyI]);

    if (!isShuffle && this.isWon()) {
      this._notify("onWin");
    }

    if (!isShuffle) {
      this.movesCount++;
      this._notify("onMove");
    }
  }

  _solve() {
    let moves = this.committedMoves.reverse();
    let i = 0;

    const lin = (m) => {
      if (m.length < 2) {
        return m;
      }

      let swapped = false;
      const newMoves = [m[0]];

      for (let j = 1; j < m.length; j++) {
        const [target, start] = m[j];
        const [oldStart, oldTarget] = m[j - 1];

        if (target === oldTarget && start === oldStart) {
          swapped = true;
        } else {
          newMoves.push(m[j]);
        }
      }

      if (swapped) {
        return lin(newMoves);
      } else {
        return newMoves;
      }
    };

    moves = lin(moves);
    console.log(moves.length);

    const interval = setInterval(() => {
      if (i >= moves.length) {
        clearInterval(interval);
        return;
      }

      const [target, start] = moves[i];
      const targetRow = Math.floor(target / this.size);

      const x = this.cells[start].size * (target - targetRow * this.size);
      const y = this.cells[start].size * targetRow;

      this.cells[start].x = x;
      this.cells[start].y = y;

      this.cells[start].render();

      [this.cells[start], this.cells[target]] = [
        this.cells[target],
        this.cells[start]
      ];
      i++;
    }, 100);

    this.committedMoves = [];
  }

  _notify(evenName) {
    this.listeners[evenName]?.forEach((func) => func());
  }

  addEventListener(eventName, func) {
    if (!this.allowedEvents.has(eventName)) {
      throw new Error("Board has no such event!");
    }

    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(func);
  }

  shuffle() {
    let emptyI = this.cells.indexOf(null);

    // TODO: Make it configurable
    const shuffleRate = this.size ** 4;

    for (let k = 0; k < shuffleRate; k++) {
      const moves = this.cells.reduce((acc, _v, i) => {
        if (this.canMoveANY(i)) {
          acc.push(i);
        }
        return acc;
      }, []);
      const i = Math.floor(Math.random() * moves.length);
      this.move(moves[i], emptyI, true);
      emptyI = moves[i];
    }
  }

  handleClick(cell) {
    if (!isStarted) {
      return;
    }

    let i = this.cells.indexOf(cell);
    if (!this.canMoveANY(i)) {
      return;
    }

    let empty = this.cells.indexOf(null);
    this.move(i, empty);
  }

  handleDragStart(e, cell) {
    let i = this.cells.indexOf(cell);

    if (!this.canMoveANY(i)) {
      return;
    }

    const dragRegion = {
      maxY: cell.y,
      maxX: cell.x,
      minY: cell.y,
      minX: cell.x
    };

    if (this.canMoveUP(i)) {
      dragRegion["minY"] = cell.y - cell.size;
    }

    if (this.canMoveDOWN(i)) {
      dragRegion["maxY"] = cell.y + cell.size;
    }

    if (this.canMoveLEFT(i)) {
      dragRegion["minX"] = cell.x - cell.size;
    }

    if (this.canMoveRIGHT(i)) {
      dragRegion["maxX"] = cell.x + cell.size;
    }

    this.isDragging = true;
    this.draggingCell = cell;
    this.currentDragRegion = dragRegion;
    this.startDragPosition = [e.screenX, e.screenY];
    this.lastDragPosition = [e.screenX, e.screenY];
  }

  handleDragMove(e) {
    if (!this.isDragging) {
      return;
    }

    const [startX, startY] = this.lastDragPosition;

    const xOffset = startX - e.screenX;
    const yOffset = startY - e.screenY;

    this.lastDragPosition = [e.screenX, e.screenY];

    if (new Date() - this.lastRender > 110) {
      this.draggingCell.render();
      this.lastRender = new Date();
    }

    let newX = this.draggingCell.x - xOffset;
    let newY = this.draggingCell.y - yOffset;

    if (newX > this.currentDragRegion.maxX) {
      newX = this.currentDragRegion.maxX;
    }

    if (newX < this.currentDragRegion.minX) {
      newX = this.currentDragRegion.minX;
    }

    if (newY > this.currentDragRegion.maxY) {
      newY = this.currentDragRegion.maxY;
    }

    if (newY < this.currentDragRegion.minY) {
      newY = this.currentDragRegion.minY;
    }

    this.draggingCell.x = newX;
    this.draggingCell.y = newY;

    if (new Date() - this.lastRender > 110) {
      this.draggingCell.render();
      this.lastRender = new Date();
    }
  }

  handleDragStop() {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;

    const i = this.cells.indexOf(this.draggingCell);
    const emptyI = this.cells.indexOf(null);

    const minXOffset = Math.abs(
      this.currentDragRegion.minX - this.draggingCell.x
    );
    const maxXOffset = Math.abs(
      this.currentDragRegion.maxX - this.draggingCell.x
    );

    const minYOffset = Math.abs(
      this.currentDragRegion.minY - this.draggingCell.y
    );
    const maxYOffset = Math.abs(
      this.currentDragRegion.maxY - this.draggingCell.y
    );

    if (this.canMoveLEFT(i)) {
      if (minXOffset < maxXOffset) {
        this.move(i, emptyI);
      } else {
        this.draggingCell.x = this.currentDragRegion.maxX;
        this.draggingCell.render();
      }
    } else if (this.canMoveRIGHT(i)) {
      if (minXOffset > maxXOffset) {
        this.move(i, emptyI);
      } else {
        this.draggingCell.x = this.currentDragRegion.minX;
        this.draggingCell.render();
      }
    } else if (this.canMoveDOWN(i)) {
      if (maxYOffset < minYOffset) {
        this.move(i, emptyI);
      } else {
        this.draggingCell.y = this.currentDragRegion.minY;
        this.draggingCell.render();
      }
    } else if (this.canMoveUP(i)) {
      if (minYOffset < maxYOffset) {
        this.move(i, emptyI);
      } else {
        this.draggingCell.y = this.currentDragRegion.maxY;
        this.draggingCell.render();
      }
    }
  }

  resize() {
    const boardWidth = this.htmlElem.clientWidth;
    const cellSize = boardWidth / this.size;

    let x_count = 0;
    let y_count = 0;

    this.cells.forEach((c) => {
      if (x_count === this.size) {
        y_count += 1;
        x_count = 0;
      }

      if (!c) {
        x_count++;
        return;
      }

      c.size = cellSize;

      c.x = x_count * cellSize;
      c.y = y_count * cellSize;

      x_count += 1;

      c.render();
    });
  }

  fill() {
    const boardWidth = this.htmlElem.clientWidth;
    const cellSize = boardWidth / this.size;

    let x_count = 0;
    let y_count = 0;

    for (let i = 0; i < this.size * this.size - 1; i++) {
      if (x_count === this.size) {
        y_count += 1;
        x_count = 0;
      }

      const x = x_count * cellSize;
      const y = y_count * cellSize;

      const cell = new Cell({
        x: x,
        y: y,
        size: cellSize,
        value: i + 1
      });
      this.htmlElem.appendChild(cell.htmlElem);
      this._attachEventListeners(cell);
      this.cells.push(cell);

      x_count += 1;
    }

    this.cells.push(null);
  }

  _attachEventListeners(cell) {
    cell.htmlElem.addEventListener("mousedown", (e) => {
      this.handleDragStart(e, cell);
    });
  }
}

const board = new Board();

board.addEventListener("onMove", () => {
  movesValue.innerHTML = `${board.movesCount}`;
  if (soundIsOn) {
    sound.play();
  }
});

board.addEventListener("onWin", () => {
  isStarted = false;
  let minutes = zeroFill(Math.floor(seconds / 60));

  addToLeaderBoard();

  alert(
    `Hooray! You solved the puzzle in ${minutes}:${zeroFill(seconds)} and ${
      board.movesCount
    } moves!`
  );
});

board.loadState();

if (!board.loaded) {
  board.fill();
}

const sizeOptions = document.createElement("div");
sizeOptions.classList.add("size-options");

const sizes = [3, 4, 5, 6, 7, 8];

sizes.forEach((s) => {
  const sizeElem = document.createElement("div");
  sizeElem.innerHTML = `${s}x${s}`;
  sizeOptions.appendChild(sizeElem);

  sizeElem.addEventListener("click", () => {
    board.changeSize(s);
    board.fill();
    board.loaded = false;
    renderLeaderBoard();
  });
});

startButton.addEventListener("click", () => {
  stopTimer();

  if (!isStarted) {
    isStarted = true;

    if (!board.loaded) {
      board.movesCount = 0;
      clearTimer();

      board.shuffle();
      board.loaded = false;
    }

    movesValue.innerHTML = `${board.movesCount}`;
    startTimer();
  }
});

stopButton.addEventListener("click", () => {
  board.movesCount = 0;
  board.loaded = false;
  movesValue.innerHTML = `${board.movesCount}`;
  board.cleanup();
  board.fill();
  stopTimer();
  clearTimer();
  isStarted = false;
  board.isDragging = false;
});

saveButton.addEventListener("click", () => {
  localStorage.setItem("seconds", seconds);
  localStorage.setItem("size", board.size);
  localStorage.setItem("movesCount", board.movesCount);
  localStorage.setItem(
    "cells",
    JSON.stringify(board.cells.map((c) => c?.value))
  );
});

body.appendChild(sizeOptions);

window.addEventListener("resize", () => {
  board.resize();
});

soundOff.addEventListener("click", () => {
  soundOff.style.display = "none";
  soundOff2.style.display = "block";
  soundIsOn = false;
});

soundOff2.addEventListener("click", () => {
  soundOff2.style.display = "none";
  soundOff.style.display = "block";
  soundIsOn = true;
});

const scores = document.createElement("div");
scores.classList.add("scores");

const container_2 = document.createElement("div");
container_2.classList.add("container");

const titleScore = document.createElement("h1");
titleScore.classList.add("titleScore");
titleScore.innerHTML = "My Score";

const scoreContainer = document.createElement("ol");
scoreContainer.classList.add("scoreContainer");

body.appendChild(scores);
scores.appendChild(container_2);
container_2.appendChild(titleScore);
container_2.appendChild(scoreContainer);

function addToLeaderBoard() {
  let arr = leaderBoard[board.size] || [];
  arr.push([seconds, board.movesCount]);
  console.log(arr, [seconds, board.movesCount]);
  arr.sort(([a, _c], [b, _d]) => a - b);
  arr.splice(10);
  console.log(arr);
  leaderBoard[board.size] = arr;
  localStorage.setItem("leaderBoard", JSON.stringify(leaderBoard));
  renderLeaderBoard();
}

function renderLeaderBoard() {
  const items = document.querySelectorAll(".scoreItem");
  Array.from(items).forEach((i) => i.remove());

  leaderBoard[board.size]?.forEach(([seconds, movesCount]) => {
    let dhours = Math.floor(seconds / 3600);
    let dminutes = Math.floor(seconds / 60) - dhours * 60;
    let dseconds = seconds - dminutes * 60;

    const scoreItem = document.createElement("li");
    scoreItem.classList.add("scoreItem");
    scoreItem.innerHTML = `${zeroFill(dhours)}:${zeroFill(dminutes)}:${zeroFill(
      dseconds
    )}`;
    scoreContainer.appendChild(scoreItem);
  });
}

renderLeaderBoard();
