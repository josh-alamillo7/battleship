

const playerGrid = document.getElementById('playerGrid');
const opponentGrid = document.getElementById('opponentGrid');
let newPlayerRow, newPlayerColumn, newOpponentRow, newOpponentColumn;
let rowDict = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J'}

//creating the grids

for (let row = 0; row < 10; row++) {
  newPlayerRow = document.createElement('tr')
  newOpponentRow = document.createElement('tr')
  playerGrid.appendChild(newPlayerRow)
  opponentGrid.appendChild(newOpponentRow)
  for (let col = 0; col < 10; col++) {
    newPlayerColumn = document.createElement('td')
    newOpponentColumn = document.createElement('td')
    newPlayerRow.appendChild(newPlayerColumn)
    newOpponentRow.appendChild(newOpponentColumn)
    newPlayerColumn.innerHTML += rowDict[row] + col
    newOpponentColumn.innerHTML += rowDict[row] + col
    newPlayerColumn.className = "playerSquare";
    newOpponentColumn.className = "opponentSquare";
    newPlayerColumn.id = "P" + row + ',' + col
    newOpponentColumn.id = "O" + row + ',' + col
  }
}



