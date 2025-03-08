const GameBoard = (function () {
  let board = ['', '', '', '', '', '', '', '', ''];

  function getBoard() {
    return [...board];
  }

  function updateBoard(index, marker) {
    if (index >= 0 && index < 9 && board[index] === '') {
      board[index] = marker;
      return true;
    }

    return false;
  }

  function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
  }

  return { getBoard, updateBoard, resetBoard };
})();

const Player = (name, marker) => {
  return { name, marker };
};

const GameController = (function () {
  let player1;
  let player2;
  let currentPlayer;
  let gameOver = false;
  let player1Wins = 0;
  let player2Wins = 0;
  let draws = 0;
  let winningCells = [];

  function initializePlayers(player1Name, player2Name) {
    player1 = Player(player1Name || 'Player X', 'X');
    player2 = Player(player2Name || 'Player O', 'O');
    currentPlayer = player1;

    document.getElementById('player-1-name').textContent = player1.name;
    document.getElementById('player-2-name').textContent = player2.name;

    updateScoreboard();
    updateActivePlayer();
  }

  function updateScoreboard() {
    document.getElementById('player-1-wins').textContent = player1Wins;
    document.getElementById('player-2-wins').textContent = player2Wins;
    document.getElementById('draws').textContent = draws;
  }

  function updateActivePlayer() {
    document.getElementById('player-2-score').classList.remove('active');
    document.getElementById('player-1-score').classList.remove('active');

    if (currentPlayer === player1)
      document.getElementById('player-1-score').classList.add('active');
    if (currentPlayer === player2)
      document.getElementById('player-2-score').classList.add('active');
  }

  function switchTurn() {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    updateActivePlayer();
  }

  function checkWinner() {
    const board = GameBoard.getBoard();
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combo of winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        winningCells = combo;
        return board[a];
      }
    }

    if (!board.includes('')) {
      return 'draw';
    }

    return null;
  }

  function playTurn(index) {
    if (gameOver || GameBoard.getBoard()[index] !== '') return;

    GameBoard.updateBoard(index, currentPlayer.marker);

    const cells = document.querySelectorAll('.cell');
    cells[index].classList.add(currentPlayer.marker.toLowerCase());

    const winner = checkWinner();
    if (winner) {
      gameOver = true;

      if (winner === 'X') {
        player1Wins++;
        showAlert(`${player1.name} wins!`);
      } else if (winner === 'O') {
        player2Wins++;
        showAlert(`${player2.name} wins!`);
      } else {
        draws++;
        showAlert("It's a draw!");
      }

      updateScoreboard();

      setTimeout(() => {
        resetGame();
      }, 1000);
      return;
    }

    switchTurn();
  }

  function resetGame() {
    GameBoard.resetBoard();
    gameOver = false;
    currentPlayer = player1;
    winningCells = [];
    updateActivePlayer();
    renderBoard();
  }

  function resetScores() {
    player1Wins = 0;
    player2Wins = 0;
    draws = 0;
    updateScoreboard();
  }

  function getCurrentPlayer() {
    return currentPlayer;
  }

  function isGameOver() {
    return gameOver;
  }

  return {
    initializePlayers,
    playTurn,
    getCurrentPlayer,
    resetGame,
    resetScores,
    isGameOver,
  };
})();

function renderBoard() {
  const boardContainer = document.getElementById('gameboard');
  boardContainer.innerHTML = '';

  GameBoard.getBoard().forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');

    if (cell) {
      cellElement.textContent = cell;
      cellElement.classList.add(cell.toLowerCase());
    }

    cellElement.addEventListener('click', () => handleMove(index));
    boardContainer.appendChild(cellElement);
  });
}

function handleMove(index) {
  GameController.playTurn(index);
  renderBoard();
}

function showPlayersPopup() {
  document.getElementById('popupOverlay').style.display = 'flex';
}

function hidePlayersPopup() {
  document.getElementById('popupOverlay').style.display = 'none';
}

function showAlert(textContent) {
  document.getElementById('alert').textContent = textContent;
  document.getElementById('alert').classList.add('active');

  setTimeout(() => {
    document.getElementById('alert').classList.remove('active');
  }, 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  showPlayersPopup();

  document.querySelector('.close-popup').addEventListener('click', () => {
    hidePlayersPopup();
    if (!GameController.getCurrentPlayer()) {
      GameController.initializePlayers('Player X', 'Player O');
      GameController.resetGame();
      showAlert('Game started with Player X and Player O!');
    }
  });

  document
    .getElementById('add-players-form')
    .addEventListener('submit', (e) => {
      e.preventDefault();

      const player1Name =
        document.getElementById('player-x').value.trim() || 'Player X';
      const player2Name =
        document.getElementById('player-o').value.trim() || 'Player O';

      GameController.initializePlayers(player1Name, player2Name);
      GameController.resetScores();
      GameController.resetGame();
      hidePlayersPopup();
      showAlert(`Welcome ${player1Name} & ${player2Name}! Game started!`);
      document.getElementById('add-players-form').reset();
    });

  document.getElementById('btn-reset-game').addEventListener('click', () => {
    GameController.resetGame();
    showAlert(`Game reseted!`);
  });

  document.getElementById('btn-new-players').addEventListener('click', () => {
    showPlayersPopup();
  });

  renderBoard();
});
