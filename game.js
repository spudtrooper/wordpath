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

function mobileCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function main() {
  if (mobileCheck()) {
    alert('use a laptop, not a phone');
    return;
  }
  loadGame();
}