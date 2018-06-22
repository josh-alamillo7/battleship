const playerGrid = document.getElementById('playerGrid');
const opponentGrid = document.getElementById('opponentGrid');
const rowDict = {0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J'};
const shipsPlacedToInfoMap = [{name: 'carrier', spots: 5}, {name: 'battleship', spots: 4}, {name: 'submarine', spots: 3},
{name: 'destroyer', spots: 3}, {name: 'patrol boat', spots: 2}];
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
      newOpponentColumn.style.backgroundColor = "white";
      newPlayerColumn.id = "P" + row + ',' + col
      newOpponentColumn.id = "O" + row + ',' + col
    }
  }
}

const initializePlayerTracker = (height, width) => {
  let output = {};
  let coordinatesAsString;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      output[[row, col]] = null
    }
  }

  return output
}

const initializeShipPositions = (positions) => {
  let output = {}

  positions.forEach((position) => {
    output[position] = true
  })

  return output
}

const toggleButton = (button) => {

  if (button.style.display === 'none') {
    button.style.display = 'block'
  } else {
    button.style.display = 'none'
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

const constructComputerShips = (game) => {
  const shipSizes = [5, 4, 3, 3, 2]
  const directionArray = ['horizontal', 'vertical']
  const filledCache = {};
  let shipInfo, found, randomDirection, potentialCoordinates, randomRow, randomColumn, filled;

  shipSizes.forEach((size, index) => {
    let randomDirection = directionArray[getRandomNumberBelow(2)]
    let shipInfo = shipsPlacedToInfoMap[index]
    let found = false

    if (randomDirection === 'horizontal') {
      while (!found) {
        randomRow = getRandomNumberBelow(game.width);
        randomColumn = getRandomNumberBelow(game.height - size);
        randomCoordinates = [randomRow, randomColumn];
        potentialCoordinates = [];
        for (let idx = 0; idx < size; idx++) {
          if (!filledCache[[randomRow, randomColumn + idx]]) {
            potentialCoordinates.push([randomRow, randomColumn + idx])
          }
        }
        if (potentialCoordinates.length === size) {
          game.addNewShip(potentialCoordinates, 'opponent', shipInfo.name)
          potentialCoordinates.forEach(coordinates => {
            filledCache[coordinates] = true
          })
          found = true;
        }
      }
    } else {
      while (!found) {
        randomRow = getRandomNumberBelow(game.width - size);
        randomColumn = getRandomNumberBelow(game.height)
        randomCoordinates = [randomRow, randomColumn];
        potentialCoordinates = [];
        for (let idx = 0 ; idx < size; idx++) {
          if (!filledCache[[randomRow + idx, randomColumn]]) {
            potentialCoordinates.push([randomRow + idx, randomColumn])
          }
        }
        if (potentialCoordinates.length === size) {
          game.addNewShip(potentialCoordinates, 'opponent', shipInfo.name)
          potentialCoordinates.forEach(coordinates => {
            filledCache[coordinates] = true
          })
          found = true;
        }
      }
    }
  })
  console.log(filledCache)
  console.log(game)

}

const changeSquareColorOnOpponentAttack = (coordinates, result) => {
  square = document.getElementById('P' + coordinates.join(','))

  if (result === 'miss') {
    square.style.backgroundColor = 'mediumAquaMarine';
  } else if (result === 'hit') {
    square.style.backgroundColor = 'orange';
  }
}

const turnAllSunkShipsRed = (shipPositions, attackingPlayer) => {
  let firstCharId, sunkSquare;
  if (attackingPlayer === 'player') {
    firstCharId = 'O'
  } else {
    firstCharId = 'P'
  }

  shipPositions.forEach(position => {
    sunkSquare = document.getElementById(`${firstCharId}${position}`)
    sunkSquare.style.backgroundColor = 'red'
  })
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = getRandomNumberBelow(i + 1);
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array;
  }

const shipPlacementButtonClickHandler = (game, button) => {
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
      constructComputerShips(game)
      game.state = 'playerTurn'
      game.setDisplayMessage('Choose an enemy square to attack')
    } else {
      game.setDisplayMessage(`Choose your ${shipsPlacedToInfoMap[numberShipsPlaced + 1].name} placement (Pick ${shipsPlacedToInfoMap[numberShipsPlaced + 1].spots})`)
    } 
  }
  toggleButton(button)
}

const getRandomNumberBelow = (max) => {
  return Math.floor(Math.random(0, 1) * max)
}

const doComputerTurn = (game) => {
  let spotToAttack, centerSpot, attackDirection;
  let computer = game.computer
  
  if (computer.hitSpots.length > 0) {
    shuffleArray(computer.hitSpots);

    for (let i = 0; i < computer.hitSpots.length; i++) {
      centerSpot = computer.hitSpots[i];
      spotToAttack = game.computer.chooseAttackSpotFromCenter(centerSpot)
      if (spotToAttack === null) {
        computer.tracker[spotToAttack] = 'tried'
      } else {
        spotToAttack = spotToAttack.map(coordinate => {
          return coordinate.toString()
        })
        break
      }
    }
    //want to do spottoattack on each spot
  } else {
    spotToAttack = game.computer.chooseRandomUnattackedSpot()
  }

  outputMessage = `Computer attacked ${rowDict[spotToAttack[0]]}${spotToAttack[1]}...`
  
  if (game.checkIfHit(spotToAttack, 'opponent')) {
    outputMessage += ` and hit.`
    if (!game.hitShip.checkIfShipIsSunk()) {
      changeSquareColorOnOpponentAttack(spotToAttack, 'hit');
      computer.tracker[spotToAttack] = 'hit';
      outputMessage += ` Your turn!`;
      computer.updateHitSpots()
    } else {
      turnAllSunkShipsRed(game.hitShip.getAllPositions(), 'opponent')
      game.hitShip.getAllPositions().forEach(position => {
        computer.tracker[position] = 'sunk';
      })
      outputMessage += ` Your ${game.hitShip.name} has been sunk.`
      game.remainingPlayerShips--
      if (game.checkIfGameOver()) {
        outputMessage += ` Game over. Computer wins!`
        game.state = 'gameOver'
      } else {
        outputMessage += ` Your turn!`
        computer.updateHitSpots()
      }
    }
  } else { 
    computer.tracker[spotToAttack] = 'miss'
    changeSquareColorOnOpponentAttack(spotToAttack, 'miss')

    outputMessage += ` and missed. Your turn!`
  }

  setTimeout(function() {
    game.setDisplayMessage(outputMessage)
    game.state = 'playerTurn'
  }, 500)

}

class Ship {
  constructor(coordinates, name) {
    this.positions = initializeShipPositions(coordinates);
    this.name = name
  }

  checkIfShipIsSunk() {
    let currPosition;
    const allPositions = Object.keys(this.positions)
    for (let position = 0; position < allPositions.length; position++) {
      currPosition = allPositions[position]
      if (this.positions[currPosition]) {
        return false
      }
    }
    return true
  }

  getAllPositions() {
    return Object.keys(this.positions)
  }

  positionHit(position) {
    this.positions[position] = false;
  }
}

class Game {
  constructor(height, width) {
    this.state = 'playerChoose';
    this.width = width;
    this.height = height;
    this.computer = new Computer(height, width)
    this.playerShips = [];
    this.opponentShips = [];
    this.remainingPlayerShips = 5;
    this.remainingOpponentShips = 5;
    this.playerSelectedSquare = false;
    this.playerSelect = {coordinates: null, square: null};
    this.spotsSelected = [];
    this.hitShip = null;

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

  clearPlayerSelect() {
    this.playerSelect.coordinates = null;
    this.playerSelect.square = null;
    this.playerSelectedSquare = false;
  }

  checkIfHit(attackCoordinates, attackingPlayer) {
    let ships, currShip, currPosition;
    if (attackingPlayer === 'player') {
      ships = this.opponentShips;
    } else {
      ships = this.playerShips;
    }
    for (let j = 0; j < ships.length; j++) {
      currShip = ships[j];
      let allPositions = Object.keys(currShip.positions);
      for (let k = 0; k < allPositions.length; k++) {
        currPosition = allPositions[k].split(',');
        if (currPosition[0] === attackCoordinates[0] && currPosition[1] === attackCoordinates[1]) {
          currShip.positionHit([Number(attackCoordinates[0]), Number(attackCoordinates[1])])
          this.hitShip = currShip
          return true
        }
      }   
    }
    return false
  }

  checkIfGameOver() {
    return (!(this.remainingPlayerShips && this.remainingOpponentShips))
  }

  getNumberSpotsSelected() {
    return this.spotsSelected.length;
  }

  getNumberShipsPlaced() {
    return this.playerShips.length;
  }

  playerSelectSquare(coordinates, square) {
    this.playerSelect.square = square;
    this.playerSelect.coordinates = coordinates;
    this.playerSelectedSquare = true;
  }

  setDisplayMessage(message) {
    let displayInfo = document.getElementById('displayInfo')
    displayInfo.innerHTML = message;
  }

  resetSpotsSelected() {
    this.spotsSelected = []
  }
}

class Computer {
  constructor(height, width) {
    this.height = height;
    this.width = width;
    this.hitSpots = [];
    this.tracker = initializePlayerTracker(this.height, this.width);
  }

  chooseRandomUnattackedSpot() {
    console.log("TRACKER", this.tracker)
    const unattackedSpots = Object.keys(this.tracker).filter(spot => {
      return this.tracker[spot] === null
    }).map(spot => {
      return spot.split(',')
    })
    const randomIndex = getRandomNumberBelow(unattackedSpots.length)
    return unattackedSpots[randomIndex]
  }

  chooseRandomHitSpot() {
    if (this.hitSpots.length > 0) {
      const randomIndex = getRandomNumberBelow(this.hitSpots.length)
      return this.hitSpots[randomIndex]
    }
    return null
  }

  chooseAttackSpotFromCenter(hitSpot) {

    let row = Number(hitSpot[0]);
    let col = Number(hitSpot[1]);

    let leftOfSpot = [row, col - 1];
    let rightOfSpot = [row, col + 1];
    let belowSpot = [row + 1, col];
    let aboveSpot = [row - 1, col];

    let directions = ['left', 'right', 'below', 'above'];
    let currDirection;

    shuffleArray(directions);

    for (let i = 0; i < directions.length; i++) {
      currDirection = directions[i]
      console.log(currDirection)
      if (currDirection === 'left') {
        if (this.tracker[leftOfSpot] === null && this.tracker[rightOfSpot] === 'hit') {
          return leftOfSpot
        }
      } else if (currDirection === 'right') {
        if (this.tracker[rightOfSpot] === null && this.tracker[leftOfSpot] === 'hit') {
          return rightOfSpot
        }
      } else if (currDirection === 'below') {
        if (this.tracker[belowSpot] === null && this.tracker[aboveSpot] === 'hit') {
          return belowSpot
        }
      } else if (currDirection === 'above') {
        if (this.tracker[aboveSpot] === null && this.tracker[belowSpot] === 'hit') {
          return aboveSpot
        }
      }
    }

    for (let j = 0; j < directions.length; j++) {
      currDirection = directions[j]
      console.log(currDirection)
      if (currDirection === 'left') {
        if (this.tracker[leftOfSpot] === null) {
          return leftOfSpot
        }
      }
      if (currDirection === 'right') {
        if (this.tracker[rightOfSpot] === null) {
          return rightOfSpot
        }
      }
      if (currDirection === 'below') {
        if (this.tracker[belowSpot] === null) {
          return belowSpot
        }
      }
      if (currDirection === 'above') {
        if (this.tracker[aboveSpot] === null) {
          return aboveSpot
        }
      }
    }

    return null

    
  }

  updateHitSpots() {
    this.hitSpots = Object.keys(this.tracker).filter(spot => {
      return this.tracker[spot] === 'hit'
    }).map(spot => {
      return spot.split(',')
    })
  }

  updateSquareStatus(square, status) {
    this.tracker[square] = status
  }
 
}

createGridView(10, 10)
const game = new Game(10, 10)

const playerSquares = document.getElementsByClassName('playerSquare')
const computerSquares = document.getElementsByClassName('opponentSquare')
const shipPlacementButton = document.getElementById('shipPlacementButton')
const attackOpponentButton = document.getElementById('attackOpponentButton')

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
          toggleButton(shipPlacementButton)
        }
      } else if (squareColor === 'green') {
        square.style.backgroundColor = 'white';
        game.spotsSelected = game.spotsSelected.filter((spot) => {
          return spot !== square.id.slice(1)
        })
        if (shipPlacementButton.style.display = 'block') {
          toggleButton(shipPlacementButton)
        }
      }
    }
  })
}

//computer square click logic
for (let i = 0; i < game.height * game.width; i++) {
  let square = computerSquares[i];
  let currShip, currPositions;
  square.addEventListener('click', function() {
    if (square.style.backgroundColor === 'green') {
      game.playerSelectedSquare = false;
      square.style.backgroundColor = 'white';
      toggleButton(attackOpponentButton);
      return
    }
    if (game.state === 'playerTurn' && square.style.backgroundColor === 'white') {
      if (!game.playerSelectedSquare) {
        square.style.backgroundColor = 'green';
        let coordinates = square.id.slice(1).split(',')
        game.playerSelectSquare(coordinates, square)
        toggleButton(attackOpponentButton)
      }        
    }
  })
}



const attackOpponentButtonClickHandler = (game, attackCoordinates, square, button) => {
  game.clearPlayerSelect();
  toggleButton(button)
  // let hit = false;
  if (game.checkIfHit(attackCoordinates, 'player')) {
    // hit = true;
    newMessage = `HIT on ${rowDict[attackCoordinates[0]]}${attackCoordinates[1]}!`
    if (!game.hitShip.checkIfShipIsSunk()) {
      square.style.backgroundColor = 'orange';
      newMessage += ' Computer is thinking 🤔';
      game.setDisplayMessage(newMessage);
      game.state = 'computerTurn'
      setTimeout(function() {
          doComputerTurn(game)
        }, 1000)
    } else {
      turnAllSunkShipsRed(game.hitShip.getAllPositions(), 'player')
      newMessage += ` SUNK ${game.hitShip.name.toUpperCase()}!`
      game.remainingOpponentShips--
      if (game.checkIfGameOver()) {
        game.state = "gameOver"
        newMessage += "Game over. You win!"
      } else {
        newMessage += ' Computer is thinking 🤔'
        game.state = 'computerTurn'
        setTimeout(function() {
          doComputerTurn(game)
        }, 1000)        
      }
      game.setDisplayMessage(newMessage)
    }       
  }
  else {
    game.setDisplayMessage(`MISS on ${rowDict[attackCoordinates[0]]}${attackCoordinates[1]}. Computer is thinking 🤔`);
    square.style.backgroundColor = 'mediumAquaMarine';
    game.state = 'computerTurn'
    setTimeout(function() {
      doComputerTurn(game)
    }, 1000)
  }
}

shipPlacementButton.addEventListener('click', function() {
  shipPlacementButtonClickHandler(game, this)
})

attackOpponentButton.addEventListener('click', function() {
  attackOpponentButtonClickHandler(game, game.playerSelect.coordinates, game.playerSelect.square, this)
})
