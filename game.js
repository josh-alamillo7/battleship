const playerGrid = document.getElementById('playerGrid');
const opponentGrid = document.getElementById('opponentGrid');
const rowDict = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J'}
const shipsPlacedToInfoMap = [{name: 'carrier', spots: 5}, {name: 'battleship', spots: 4}, {name: 'submarine', spots: 3},
{name: 'destroyer', spots: 3}, {name: 'patrol boat', spots: 2}]
let newPlayerRow, newPlayerColumn, newOpponentRow, newOpponentColumn;



//creating the grid views

const createGridView = (height, width) => {
  for (let row = 0; row < height; row++) {
    newPlayerRow = document.createElement('tr')
    newOpponentRow = document.createElement('tr')
    playerGrid.appendChild(newPlayerRow)
    opponentGrid.appendChild(newOpponentRow)
    for (let col = 0; col < width; col++) {
      newPlayerColumn = document.createElement('td')
      newOpponentColumn = document.createElement('td')
      newPlayerRow.appendChild(newPlayerColumn)
      newOpponentRow.appendChild(newOpponentColumn)
      newPlayerColumn.innerHTML += rowDict[row] + col
      newOpponentColumn.innerHTML += rowDict[row] + col
      newPlayerColumn.className = "playerSquare";
      newPlayerColumn.style.backgroundColor = "white";
      newOpponentColumn.className = "opponentSquare";
      newPlayerColumn.id = "P" + row + ',' + col
      newOpponentColumn.id = "O" + row + ',' + col
    }
  }
}

const initializePlayerGrid = (height, width) => {
  let output = {};

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      output[[row, col]] = null
    }
  }
}

const initializeShipPositions = (positions) => {
  let output = []

  positions.forEach((position) => {
    output.push({position: position,
      hit: false});
  })
}

const toggleShipPlacementButton = () => {
  const shipPlacementButton = document.getElementById('shipPlacementButton');

  if (shipPlacementButton.style.display === 'none') {
    shipPlacementButton.style.display = 'block'
  } else {
    shipPlacementButton.style.display = 'none'
  }
}

class Ship {
  constructor(coordinates) {
    this.positions = initializeShipPositions(coordinates);
  }
}

class Game {
  constructor(height, width) {
    this.state = 'playerChoose';
    this.width = width;
    this.height = height;
    this.playerGrid = initializePlayerGrid()
    this.opponentGrid = initializePlayerGrid()
    this.playerShips = [];
    this.opponentShips = [];
    this.spotsSelected = [];

    this.setDisplayMessage('Choose your carrier placement (Pick 5)')
  }

  addNewShip(coordinates, player) {
    const newShip = new Ship(coordinates)
    if (player === 'player') {
      this.playerShips.push(newShip)
    } else {
      this.opponentShips.push(newShip)
    } 
  }

  setDisplayMessage(message) {
    let displayInfo = document.getElementById('displayInfo')
    displayInfo.innerHTML = message;
  }

}

createGridView(10, 10)
const game = new Game(10, 10)

const playerSquares = document.getElementsByClassName('playerSquare')

console.log(playerSquares)

for (let i = 0; i < game.height * game.width; i++) {
  let square = playerSquares[i];
  square.addEventListener('click', function() {
    if (game.state === 'playerChoose') {
      let numberSpotsChosen = game.spotsSelected.length;
      let shipIndex = game.playerShips.length;
      let spotsRequired = shipsPlacedToInfoMap[shipIndex].spots;
      let squareColor = square.style.backgroundColor;

      if (squareColor === 'white' && numberSpotsChosen < spotsRequired) {
        game.spotsSelected.push(square.id.slice(1))
        square.style.backgroundColor = 'green';
        if (numberSpotsChosen + 1 === spotsRequired) {
          toggleShipPlacementButton()
        }
      } else if (squareColor === 'green') {
        square.style.backgroundColor = 'white';
        game.spotsSelected = game.spotsSelected.filter((spot) => {
          console.log(spot === square.id.slice(1))
          return spot !== square.id.slice(1)
        })
        if (shipPlacementButton.style.display = 'block') {
          toggleShipPlacementButton()
        }
      }
    }
  })
}

// playerSquares.forEach(square => {
//   square.addEventListener('click', function() {
//     if (game.state === 'playerChoose') {
//       let numbershipsChosen = game.spotsSelected.length;
//       let shipsRequired = shipsPlacedToInfoMap[numbershipsChosen].spots;
//       let currentColor = square.style.backgroundColor

//       console.log(currentColor)
//     }
//   })
// })





