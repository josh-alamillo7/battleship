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

  return output
}

const initializeShipPositions = (positions) => {
  let output = []

  positions.forEach((position) => {
    output.push({position: position,
      hit: false});
  })

  return output
}

const toggleShipPlacementButton = () => {
  const shipPlacementButton = document.getElementById('shipPlacementButton');

  if (shipPlacementButton.style.display === 'none') {
    shipPlacementButton.style.display = 'block'
  } else {
    shipPlacementButton.style.display = 'none'
  }
}

const checkForCorrectConfiguration = (positions) => {
  positions.sort((a,b) => {
    if (a[0] !== b[0]) {
      return a[0] - b[0]
    } else {
      return a[1] - b[1]
    }
  })

  let pointer = 0;

  if (positions[0][0] === positions[1][0]) {
    while (pointer < positions.length - 1) {
      if (positions[pointer][1] + 1 !== positions[pointer + 1][1] || positions[pointer + 1][0] !== positions[pointer][0]) {
        return false
      }
      pointer++      
    }
    return true
  } else if (positions[0][1] === positions[1][1]) {
    while (pointer < positions.length - 1) {
      if (positions[pointer][0] + 1 !== positions[pointer + 1][0] || positions[pointer + 1][1] !== positions[pointer][1]) {
        return false
      }
      pointer++
    }
    return true
  }

  return false
}

const shipPlacementButtonClickHandler = (game) => {
  let positionsMap = game.spotsSelected.map(position => {
    position = position.split(',')
    position[0] = Number(position[0]);
    position[1] = Number(position[1]);
    return position
  })
  let numberShipsPlaced = game.getNumberShipsPlaced();

  if (!checkForCorrectConfiguration(positionsMap)) {
    game.setDisplayMessage(`Incorrect configuration. The ${shipsPlacedToInfoMap[numberShipsPlaced].name} needs 
      ${shipsPlacedToInfoMap[numberShipsPlaced].spots} spots on the same row or column. Please try again!`)
  } else {
    game.spotsSelected.forEach(spot => {
      document.getElementById('P' + spot).style.backgroundColor = 'grey';
    })
    game.addNewShip(game.spotsSelected, 'player', shipsPlacedToInfoMap[numberShipsPlaced].name)
    game.resetSpotsSelected()
    if (game.getNumberShipsPlaced() === 5) {
      game.state = 'computerChoose'
      game.setDisplayMessage('Computer will now choose their ships')
    } else {
      game.setDisplayMessage(`Choose your ${shipsPlacedToInfoMap[numberShipsPlaced + 1].name} placement (Pick ${shipsPlacedToInfoMap[numberShipsPlaced + 1].spots})`)
      console.log(game)
    } 
  }
  toggleShipPlacementButton()
}

class Ship {
  constructor(coordinates, name) {
    this.positions = initializeShipPositions(coordinates);
    this.name = name
  }

  checkIfShipIsSunk() {
    for (let position = 0; position < this.positions.length; position++) {
      if (!position.hit) {
        return false
      }
    }
    return true
  }

  positionHit(position) {
    this.positions[position].hit = true;
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

  addNewShip(coordinates, player, name) {
    const newShip = new Ship(coordinates, name)
    if (player === 'player') {
      this.playerShips.push(newShip)
    } else {
      this.opponentShips.push(newShip)
    } 
  }

  getNumberSpotsSelected() {
    return this.spotsSelected.length;
  }

  getNumberShipsPlaced() {
    return this.playerShips.length;
  }

  setDisplayMessage(message) {
    let displayInfo = document.getElementById('displayInfo')
    displayInfo.innerHTML = message;
  }

  resetSpotsSelected() {
    this.spotsSelected = []
  }
}

createGridView(10, 10)
const game = new Game(10, 10)

const playerSquares = document.getElementsByClassName('playerSquare')
const shipPlacementButton = document.getElementById('shipPlacementButton')

//player square click logic
for (let i = 0; i < game.height * game.width; i++) {
  let square = playerSquares[i];
  square.addEventListener('click', function() {
    if (game.state === 'playerChoose') {
      let numberSpotsChosen = game.getNumberSpotsSelected();
      let shipIndex = game.getNumberShipsPlaced();
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
          return spot !== square.id.slice(1)
        })
        if (shipPlacementButton.style.display = 'block') {
          toggleShipPlacementButton()
        }
      }
    }
  })
}
//computer square click logic

shipPlacementButton.addEventListener('click', function() {
  shipPlacementButtonClickHandler(game)})

//opponent square click logic

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
