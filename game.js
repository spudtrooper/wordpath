class Game {
  constructor(board, letters) {
    this._board = board;
    this._letters = letters;
    const g = this;
    $(document).keydown(function (e) {
      console.log('e.keyCode', e.keyCode);
      if (e.shiftKey || e.alKey || e.ctrlKey || e.metaKey) {
        console.log('ignoring modifier key');
        return;
      }
      if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 91) {
        const c = board.handleDelete();
        if (!c || !c.match(/[a-z0-9]/i)) {
          return;
        }
        letters.addLetter(c);
        g.render();
        return;
      }
      const c = String.fromCharCode(e.keyCode);
      if (!c.match(/[a-z0-9]/i)) {
        return;
      }
      if (letters.hasLetter(c)) {
        if (board.hasSelection()) {
          let selected = board.getSelection();
          if (selected.getLetter() != _EMPTY_LETTER && selected.getLetter() == c) {
            console.log('same letter');
            return;
          }
          letters.removeLetter(c);
          let sel = board.handleKeyDown(c);
          if (sel && sel != _EMPTY_LETTER) {
            letters.addLetter(sel);
          }
        }
        g.render();
      } else {
        alert('Invalid letter: ' + c);
      }
    });
  }

  render() {
    this._board.render(this, $('#board').empty());
    this._letters.render($('#letters').empty());
    if (this.hasSolution()) {
      setTimeout(() => alert('YOU WON!!!!'), 200);
    }
  }

  showSolution() {
    this._board.showSolution();
    this.render();
  }

  hasSolution() {
    return this._letters.hasSolution() && this._board.hasSolution();
  }

  clearSelected() { this._board.clearSelected(); }
}

class Letters {
  constructor(letters) {
    this._letters = letters.map(c => c.toUpperCase());
  }

  render(el) {
    this._letters.forEach(letter => {
      let l = $('<div>').addClass('letter').text(letter);
      el.append(l);
    });
  }

  hasLetter(c) { return this._letters.indexOf(c) >= 0; }

  hasSolution() { return this._letters.length === 0; }

  removeLetter(c) {
    const i = this._letters.indexOf(c);
    if (i >= 0) {
      this._letters.splice(i, 1);
    }
  }

  addLetter(c) { this._letters.push(c); }
}

const _EMPTY_LETTER = '*';

class BoardItem {
  constructor() {
    this._letter = _EMPTY_LETTER;
    this._selected = false;
  }
  render(el) {
    el.addClass('board-item');
    if (this._letter !== _EMPTY_LETTER) {
      el.text(this._letter);
    }
    if (this._selected) {
      el.addClass('selected');
    }
  }

  setLetter(letter) { this._letter = letter; }
  getLetter() { return this._letter; }

  setSelected(selected) { this._selected = selected; }
  getSelected() { return this._selected; }

  canBeSelected() { return true; }
}

class LetterBoardItem extends BoardItem {
  constructor() {
    super();
  }

  render(el) {
    super.render(el);
    if (this._letter !== _EMPTY_LETTER) {
      el.addClass('has-letter');
    }
  }
}

class StartBoardItem extends BoardItem {
  render(el) {
    el.addClass('start-board-item');
    super.render(el);
  }
}

class ObstacleBoardItem extends BoardItem {
  render(el) {
    el.addClass('obstacle-board-item');
    super.render(el);
  }
  canBeSelected() { return false; }
}

class DestinationBoardItem extends BoardItem {
  render(el) {
    el.addClass('destination-board-item');
    super.render(el);
  }
}

class Board {
  constructor() {
    this._showSolution = false;
    this._selected = null;

    const s = () => new StartBoardItem();
    const e = () => new LetterBoardItem();
    const o = () => new ObstacleBoardItem();
    const d = () => new DestinationBoardItem();
    this._solution = [
      ['B', 'A', 'S', 'T', 'E', '*', '*'],
      ['*', '*', '*', '*', 'L', '*', '*'],
      ['*', '*', '*', '*', 'A', '*', '*'],
      ['*', '*', '*', '*', 'S', '*', '*'],
      ['*', '*', '*', '*', 'T', '*', '*'],
      ['*', '*', '*', '*', 'I', '*', '*'],
      ['*', '*', '*', '*', 'C', 'A', 'T'],
    ];
    this._grid = [
      [s(), e(), e(), e(), e(), e(), e()],
      [e(), e(), e(), e(), e(), o(), e()],
      [e(), e(), e(), e(), e(), e(), e()],
      [e(), e(), e(), o(), e(), e(), e()],
      [e(), e(), e(), e(), e(), e(), o()],
      [e(), o(), e(), e(), e(), e(), e()],
      [e(), e(), e(), e(), e(), e(), d()],
    ];
  }

  hasSelection() {
    return !!this.getSelection();
  }

  getSelection() {
    let res = null;
    this._grid.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item.getSelected()) {
          res = item;
        }
      });
    });
    return res;
  }

  clearSelected() {
    this._grid.forEach(row => {
      row.forEach(item => {
        item.setSelected(false);
      });
    })
  }

  handleKeyDown(c) {
    console.log('handleKeyDown', c);
    let res = null;
    this._grid.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item.getSelected()) {
          if (item.getLetter() != _EMPTY_LETTER) {
            res = item.getLetter();
          }
          item.setLetter(c);
        }
      });
    });
    return res;
  }

  handleDelete() {
    console.log('handleDelete');
    let res = null;
    this._grid.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item.getSelected()) {
          res = item.getLetter();
          item.setLetter(_EMPTY_LETTER);
        }
      });
    });
    return res;
  }

  hasSolution() {
    let res = true;
    const solution = this._solution;
    this._grid.forEach((row, i) => {
      row.forEach((item, j) => {
        let sol = solution[i][j];
        if (item.getLetter() != _EMPTY_LETTER) {
          if (item.getLetter() != sol) {
            res = false;
          }
        }
      });
    });
    return res;
  }

  letters() {
    let res = [];
    this._solution.forEach(row => {
      row.forEach(letter => {
        if (letter != _EMPTY_LETTER) {
          res.push(letter);
        }
      });
    })
    return res;
  }

  showSolution() {
    this._showSolution = true;
  }

  render(g, el) {
    let tab = $('<table>').addClass('board-table');
    el.append(tab);
    let b = this;
    this._grid.forEach((row, i) => {
      row.forEach((item, j) => {
        if (b._selected) {
          if (b._selected.row === i && b._selected.col === j) {
            const wasSelected = item.getSelected();
            g.clearSelected();
            item.setSelected(!wasSelected);
          }
        }
      });
    });
    this._grid.forEach((row, i) => {
      let tr = $('<tr>');
      tab.append(tr);
      row.forEach((item, j) => {
        let td = $('<td>');
        tr.append(td);
        if (item.canBeSelected()) {
          $(td).click(() => {
            b._selected = { row: i, col: j };
            g.render();
          });
        }
        if (this._showSolution) {
          const l = this._solution[i][j];
          if (l != _EMPTY_LETTER) {
            item.setLetter(l);
          }
        }
        item.render(td);
      });
    });
  }
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function loadGame() {
  console.log('loadGame');
  const b = new Board();
  const letters = b.letters();
  letters.sort();
  const game = new Game(b, new Letters(letters));
  game.render();
}

function main() {
  loadGame();
}