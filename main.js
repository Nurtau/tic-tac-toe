class Table {
  #size;
  #container;
  #table;
  #cellNodes;
  #labelNode;
  #currentPlayer;
  #firstPlayerTurnMessage = "First player's turn";
  #secondPlayerTurnMessage = "Second player's turn";

  constructor(n, container) {
    this.#size = n;
    this.#container = container;
  }

  create() {
    this.#cellNodes = new Map();
    const table = document.createElement("div");
    table.classList.add("table");

    const dimension = `${this.#size * 100}px`;
    table.style.width = dimension;
    table.style.height = dimension;

    for (let row = 0; row < this.#size; row++) {
      for (let col = 0; col < this.#size; col++) {
        const cell = this._createCell(row, col);
        table.appendChild(cell);
      }
    }

    this.#currentPlayer = 1;
    const labelNode = document.createElement("div");
    labelNode.classList.add("label-message");
    labelNode.innerText = this.#firstPlayerTurnMessage;

    this.destroy();
    this.#container.appendChild(labelNode);
    this.#container.appendChild(table);
    this.#labelNode = labelNode;
    this.#table = table;
  }

  destroy() {
    if (this.#labelNode) {
      this.#labelNode.remove();
    }

    if (this.#table) {
      this.#table.remove();
    }
  }

  changePlayer() {
    if (!this.#labelNode) return;
    this.#currentPlayer = this.#currentPlayer === 1 ? 2 : 1;
    if (this.#currentPlayer === 1) {
      this.#labelNode.innerText = this.#firstPlayerTurnMessage;
    } else {
      this.#labelNode.innerText = this.#secondPlayerTurnMessage;
    }
  }

  showWinnerMessage() {
    if (!this.#labelNode) return;
    const winner = this.#currentPlayer === 1 ? "first" : "second";
    this.#labelNode.innerText = `Winner is ${winner} player`;
    this.#labelNode.style.color = "blue";
  }

  getNode() {
    return this.#table;
  }

  getSize() {
    return this.#size;
  }

  getCellNodes() {
    return this.#cellNodes;
  }

  _createCell(row, col) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.style.top = `${row * 100}px`;
    cell.style.left = `${col * 100}px`;
    cell.setAttribute("row", `${row}`);
    cell.setAttribute("column", `${col}`);
    this.#cellNodes.set(`${row}_${col}`, cell);
    return cell;
  }
}

class Game {
  #table;
  #character;
  #cells;
  #size;

  constructor(table) {
    this.#table = table;
    this.#character = "X";
    this.#size = table.getSize();
  }

  start() {
    this.#table.create();

    // initializing 2d array of empty strings
    this.#cells = [...Array(this.#size)].map((_) => Array(this.#size).fill(""));

    const tableNode = this.#table.getNode();
    tableNode.addEventListener("click", this._onTableClick);
  }

  restart = () => {
    this.#table.destroy();
    this.#table.create();
    this.start();
  };

  _onTableClick = (event) => {
    const node = event.target;
    if (node.classList[0] === "cell") {
      const row = Number(node.getAttribute("row"));
      const col = Number(node.getAttribute("column"));
      if (this.#cells[row][col] === "") {
        node.innerText = this.#character;
        this.#cells[row][col] = this.#character;
        const winnerLine = this._isThereWinner(row, col);

        if (winnerLine === "none") {
          this._changePlayer();
        } else {
          this._stop();
          this._showWinnerLine(row, col, winnerLine);
          this.#table.showWinnerMessage();
        }
      }
    }
  };

  _stop() {
    const tableNode = this.#table.getNode();
    tableNode.removeEventListener("click", this._onTableClick);
  }

  _changePlayer() {
    this.#character = this.#character === "X" ? "0" : "X";
    this.#table.changePlayer();
  }

  _isThereWinner(row, col) {
    let sameCharacter = 0;
    for (let i = 0; i < this.#size; i++) {
      if (this.#cells[row][i] === this.#character) {
        sameCharacter++;
      }
    }

    if (sameCharacter === this.#size) {
      return "horizonal";
    }

    sameCharacter = 0;
    for (let i = 0; i < this.#size; i++) {
      if (this.#cells[i][col] === this.#character) {
        sameCharacter++;
      }
    }

    if (sameCharacter === this.#size) {
      return "vertical";
    }

    if (row === col) {
      sameCharacter = 0;
      for (let i = 0; i < this.#size; i++) {
        if (this.#cells[i][i] === this.#character) {
          sameCharacter++;
        }
      }

      if (sameCharacter === this.#size) {
        return "first-diagonal";
      }
    }

    if (row + col === this.#size - 1) {
      sameCharacter = 0;
      for (let i = 0, j = this.#size - 1; i < this.#size; i++, j--) {
        if (this.#cells[i][j] === this.#character) {
          sameCharacter++;
        }
      }

      if (sameCharacter === this.#size) {
        return "second-diagonal";
      }
    }
    return "none";
  }

  _showWinnerLine(row, col, line) {
    const cellNodes = this.#table.getCellNodes();

    for (let i = 0; i < this.#size; i++) {
      for (let j = 0; j < this.#size; j++) {
        const node = cellNodes.get(`${i}_${j}`);
        node.style.opacity = "0.5";
      }
    }

    const colorizeCellNode = (node) => {
      node.style.color = "red";
      node.style.fontWeight = "700";
      node.style.opacity = "1";
    };

    switch (line) {
      case "horizonal":
        for (let i = 0; i < this.#size; i++) {
          const node = cellNodes.get(`${row}_${i}`);
          colorizeCellNode(node);
        }
        break;
      case "vertical":
        for (let i = 0; i < this.#size; i++) {
          const node = cellNodes.get(`${i}_${col}`);
          colorizeCellNode(node);
        }
        break;
      case "first-diagonal":
        for (let i = 0; i < this.#size; i++) {
          const node = cellNodes.get(`${i}_${i}`);
          colorizeCellNode(node);
        }
        break;
      case "second-diagonal":
        for (let i = 0, j = this.#size - 1; i < this.#size; i++, j--) {
          const node = cellNodes.get(`${i}_${j}`);
          colorizeCellNode(node);
        }
        break;
    }
  }
}

function main() {
  const root = document.querySelector("#root");
  const table = new Table(3, root);
  const game = new Game(table);

  const restartButton = document.querySelector("#restart");
  restartButton.addEventListener("click", game.restart);

  game.start();
}

main();
