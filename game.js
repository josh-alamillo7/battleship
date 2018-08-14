const playerGrid = document.getElementById('playerGrid');
const opponentGrid = document.getElementById('opponentGrid');
const rowDict = {
  0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
};
const shipsPlacedToInfoMap = [{ name: 'carrier', spots: 5 }, { name: 'battleship', spots: 4 }, { name: 'submarine', spots: 3 },
  { name: 'destroyer', spots: 3 }, { name: 'patrol boat', spots: 2 }];
let newPlayerRow;
let newPlayerColumn;
let newOpponentRow;
let newOpponentColumn;

// ******************************game functions***************************

const createGridView = (height, width) => {

  // for each row, create a table row and add it to each grid.

  // inside loop: for each column, create a td and add it to the row. Make it display the grid position. Classify it as a square corresponding to that player.
  // initialize its color to white and make its id identify its position and which player it belongs to.
  for (let row = 0; row < height; row += 1) {
    newPlayerRow = document.createElement('tr');
    newOpponentRow = document.createElement('tr');
    playerGrid.appendChild(newPlayerRow);
    opponentGrid.appendChild(newOpponentRow);
    for (let col = 0; col < width; col += 1) {
      newPlayerColumn = document.createElement('td');
      newOpponentColumn = document.createElement('td');
      newPlayerRow.appendChild(newPlayerColumn);
      newOpponentRow.appendChild(newOpponentColumn);
      newPlayerColumn.innerHTML += rowDict[row] + col;
      newOpponentColumn.innerHTML += rowDict[row] + col;
      newPlayerColumn.className = 'playerSquare';
      newPlayerColumn.style.backgroundColor = 'white';
      newOpponentColumn.className = 'opponentSquare';
      newOpponentColumn.style.backgroundColor = 'white';
      newPlayerColumn.id = `P${row},${col}`;
      newOpponentColumn.id = `O${row},${col}`;
    }
  }
};

const initializePlayerTracker = (height, width) => {
  // This will allow the player to keep track of the status of the opponent squares.
  // These will all be initialized to null.

  const output = {};

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      output[[row, col]] = null;
    }
  }

  return output;
};

const initializeShipPositions = (positions) => {
  // positions is an Array. Return an object containing each position for that ship initialized to "true", which will become the tracker for each player's
  // ship positions.

  const output = {};

  positions.forEach((position) => {
    output[position] = true;
  });

  return output;
};

const getRandomNumberBelow = max => Math.floor(Math.random(0, 1) * max);

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = getRandomNumberBelow(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const toggleButton = (button) => {

  if (button.style.display === 'none') {
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
};

const checkForCorrectConfiguration = (positions) => {

  // positions is an array of positions. Each position is an array with two elements.

  // it's impossible for the same position to be selected twice. Sort by row, ascending. If the row is the same, sort by column.
  positions.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0] - b[0];
    }
    return a[1] - b[1];
  });

  let pointer = 0;

  // in the if: check if the first two positions are in the same row. If they are, initialize a pointer to the first position and check if the
  // next position in the array is in the same row and one column higher. If any of them are not, return false.
  // Repeat this process until we reach the second to last position. If we haven't returned false, return true.

  // else if: check if the first two positions are in the same column. If they are, initialize a pointer to the first position and check
  // if the next position in the array is in the same column and one row higher. If any of them are not, return false.
  // Repeat this process until we reach the second to last position. If we haven't returned false, return true.



  if (positions[0][0] === positions[1][0]) {
    while (pointer < positions.length - 1) {
      if (positions[pointer][1] + 1 !== positions[pointer + 1][1]
        || positions[pointer + 1][0] !== positions[pointer][0]) {
        return false;
      }
      pointer += 1;
    }
    return true;
  } else if (positions[0][1] === positions[1][1]) {
    while (pointer < positions.length - 1) {
      if (positions[pointer][0] + 1 !== positions[pointer + 1][0]
        || positions[pointer + 1][1] !== positions[pointer][1]) {
        return false;
      }
      pointer += 1;
    }
    return true;
  }

  //if the first two positions weren't in the same row *or* column, return false.

  return false;
};

const constructComputerShips = (game) => {

  const shipSizes = [5, 4, 3, 3, 2];
  const directionArray = ['horizontal', 'vertical'];
  const filledCache = {};
  let found;
  let randomCoordinates;
  let potentialCoordinates;
  let randomRow;
  let randomColumn;

  // for each of the five ships needed, first choose whether it will be vertical or horizontal.

  // if horizontal: do the following while you haven't found an available position for the current ship size:
    //choose a random row.
    //choose a random column between 0 and the grid width - ship size.
    //assign these coordinates to an array.
    //initialize a potential coordinates array;
      //check each position starting at the initial coordinates and traversing right to check if it is in filled cache.
      //if any of them are in filled cache(meaning a ship already has that position), do not add the ship and go back to the start of the while loop.
      //if none of them are in filled cache, add the ship to the opponent grid.
      //Add all the coordinates to filled cache to be used by future ships.

  shipSizes.forEach((size, index) => {
    const randomDirection = directionArray[getRandomNumberBelow(2)];
    const shipInfo = shipsPlacedToInfoMap[index];
    found = false;

    if (randomDirection === 'horizontal') {
      while (!found) {
        randomRow = getRandomNumberBelow(game.width);
        randomColumn = getRandomNumberBelow(game.height - size);
        randomCoordinates = [randomRow, randomColumn];
        potentialCoordinates = [];
        for (let idx = 0; idx < size; idx += 1) {
          if (!filledCache[[randomRow, randomColumn + idx]]) {
            potentialCoordinates.push([randomRow, randomColumn + idx]);
          }
        }
        if (potentialCoordinates.length === size) {
          game.addNewShip(potentialCoordinates, 'opponent', shipInfo.name);
          potentialCoordinates.forEach((coordinates) => {
            filledCache[coordinates] = true;
          });
          found = true;
        }
      }
    } else {
      while (!found) {
        randomRow = getRandomNumberBelow(game.width - size);
        randomColumn = getRandomNumberBelow(game.height);
        randomCoordinates = [randomRow, randomColumn];
        potentialCoordinates = [];
        for (let idx = 0; idx < size; idx += 1) {
          if (!filledCache[[randomRow + idx, randomColumn]]) {
            potentialCoordinates.push([randomRow + idx, randomColumn]);
          }
        }
        if (potentialCoordinates.length === size) {
          game.addNewShip(potentialCoordinates, 'opponent', shipInfo.name);
          potentialCoordinates.forEach((coordinates) => {
            filledCache[coordinates] = true;
          });
          found = true;
        }
      }
    }
  });
};

const changeSquareColorOnOpponentAttack = (coordinates, result) => {
  //changes player square color to either blue or orange after the opponent attacks.

  const square = document.getElementById(`P${coordinates.join(',')}`);

  if (result === 'miss') {
    square.style.backgroundColor = 'mediumAquaMarine';
  } else if (result === 'hit') {
    square.style.backgroundColor = 'orange';
  }
};

const turnAllSunkShipsRed = (shipPositions, attackingPlayer) => {

  // this function is triggered when a player's ship is sunk. Takes in coordinates and an attacking player and changes
  // each coordinate's corresponding square to a red color.

  let firstCharId;
  let sunkSquare;
  if (attackingPlayer === 'player') {
    firstCharId = 'O';
  } else {
    firstCharId = 'P';
  }

  shipPositions.forEach((position) => {
    sunkSquare = document.getElementById(`${firstCharId}${position}`);
    sunkSquare.style.backgroundColor = 'red';
  });
};

const setDisplayMessage = (message) => {
  const displayInfo = document.getElementById('displayInfo');
  displayInfo.innerHTML = message;
};

const doComputerTurn = (game) => {

  let spotToAttack;
  let centerSpot;
  let computer = game.computer;

  //the computer first checks if there are any spots it has hit that correspond to a ship that is not yet sunk.

  if (computer.hitSpots.length > 0) {

    //if there is a non-sunk hit spot, it shuffles all hit spots.
    shuffleArray(computer.hitSpots);

    for (let i = 0; i < computer.hitSpots.length; i += 1) {
      //for each hit spot in the array:
      centerSpot = computer.hitSpots[i];
      //assign it to be the center spot.
      spotToAttack = game.computer.chooseAttackSpotFromCenter(centerSpot);
      //choose a random direction from that center spot and assign it to "spot to attack"
      if (spotToAttack !== null) {
        spotToAttack = spotToAttack.map(coordinate => coordinate.toString());
        break;
      }
    }
  } else {
    //if there are no spots that are hit and not sunk, the computer will just choose a random unattacked spot.
    spotToAttack = game.computer.chooseRandomUnattackedSpot();
  }

  let outputMessage = `Computer attacked ${rowDict[spotToAttack[0]]}${spotToAttack[1]}...`;

  // now that the computer has chosen an attack to spot, the game checks if the attack is a hit.
    // if it's a hit, check if the ship is sunk.
      // if the ship is not sunk, make the square orange. Have the computer add the new hit spot to its tracker.
      // if the ship is sunk:
        // Turn all the player ship's positions red
        // update the computer tracker to know all these shipts are sunk.
        // have the player lose the ship.
        // check if the game is over.
          // if the game is over, change the game's state to game over.
        // if the game is not over, remove al lthe sunk ships from computer's sunk ships.

    // no matter how long the computer takes, do a set timeout for half a second so the player has time to see the message, then change the state 
    // to player turn.


  if (game.checkIfHit(spotToAttack, 'opponent')) {
    outputMessage += ' and hit.';
    if (!game.hitShip.checkIfShipIsSunk()) {
      changeSquareColorOnOpponentAttack(spotToAttack, 'hit');
      computer.updateSquareStatus(spotToAttack, 'hit');
      outputMessage += ' Your turn!';
      computer.updateHitSpots();
    } else {
      turnAllSunkShipsRed(game.hitShip.getAllPositions(), 'opponent');
      game.hitShip.getAllPositions().forEach((position) => {
        computer.updateSquareStatus(position, 'sunk')
      });
      outputMessage += ` Your ${game.hitShip.name} has been sunk.`;
      game.playerLoseShip('player');
      if (game.checkIfGameOver()) {
        outputMessage += ' Game over. Computer wins!';
        setDisplayMessage(outputMessage);
        game.changeGameState('gameOver');
      } else {
        outputMessage += ' Your turn!';
        computer.updateHitSpots();
      }
    }
  } else {
    computer.updateSquareStatus(spotToAttack, 'miss');
    changeSquareColorOnOpponentAttack(spotToAttack, 'miss');

    outputMessage += ' and missed. Your turn!';
  }

  if (game.state !== 'gameOver') {
    setTimeout(() => {
      setDisplayMessage(outputMessage);
      game.changeGameState('playerTurn');
    }, 500);
  }
};

const shipPlacementButtonClickHandler = (game, button) => {

  //take in a game and do something based on the ships currently placed.

  //positionsMap converts the game's "spots selected" property into an array appropriate for the function to use.
  const positionsMap = game.spotsSelected.map((position) => {
    const splitPosition = position.split(',');
    splitPosition[0] = Number(splitPosition[0]);
    splitPosition[1] = Number(splitPosition[1]);
    return splitPosition;
  });
  const numberShipsPlaced = game.getNumberShipsPlaced();

  //we take this positions map and check for correct configuration. If it's not correct, the game displays that to the user and does nothing.

  //if the configuration is correct:
    // we turn all the spots gray on the player's grid.
    // we add the ship to the player's collections of ships
    // we reset the spots selected
    // if the number of ships placed after this is 5, we move on to constructing the computer's ships and make it the player's turn.
    // otherwise, we tell the player to choose their next ship.
  //whether or not the ship was placed, the button disappears after it's clicked.

  if (!checkForCorrectConfiguration(positionsMap)) {
    setDisplayMessage(`Incorrect configuration. The ${shipsPlacedToInfoMap[numberShipsPlaced].name} needs 
      ${shipsPlacedToInfoMap[numberShipsPlaced].spots} spots on the same row or column. Please try again!`);
  } else {
    game.spotsSelected.forEach((spot) => {
      document.getElementById(`P${spot}`).style.backgroundColor = 'grey';
    });
    game.addNewShip(game.spotsSelected, 'player', shipsPlacedToInfoMap[numberShipsPlaced].name);
    game.resetSpotsSelected();
    if (game.getNumberShipsPlaced() === 5) {
      constructComputerShips(game);
      game.changeGameState('playerTurn');
      setDisplayMessage('Choose an enemy square to attack');
    } else {
      setDisplayMessage(`Choose your ${shipsPlacedToInfoMap[numberShipsPlaced + 1].name} placement (Pick ${shipsPlacedToInfoMap[numberShipsPlaced + 1].spots})`);
    }
  }
  toggleButton(button);
};

const attackOpponentButtonClickHandler = (game, attackCoordinates, square, button) => {

  // when we attack the opponent, the button disappears and the player's selected square is cleared.

  //the game checks if it's a hit.
    //if it is, it then checks if the ship is sunk.
      //if it's not sunk, it turns orange and moves on to the computer's turn after 1 second.
      //if it's sunk, we turn all sunk ships red and have the opponent lose a ship.
        //we check if the game is over. If it is, we set the state to game over, otherwise, we move on to the computer's turn.
    //if it's not a hit, we turn the square blue and move on to the opponent's turn.


  game.clearPlayerSelect();
  toggleButton(button);
  // let hit = false;
  if (game.checkIfHit(attackCoordinates, 'player')) {
    // hit = true;
    let newMessage = `HIT on ${rowDict[attackCoordinates[0]]}${attackCoordinates[1]}!`;
    if (!game.hitShip.checkIfShipIsSunk()) {
      square.style.backgroundColor = 'orange';
      newMessage += ' Computer is thinking 🤔';
      setDisplayMessage(newMessage);
      game.changeGameState('computerTurn');
      setTimeout(() => {
        doComputerTurn(game);
      }, 1000);
    } else {
      turnAllSunkShipsRed(game.hitShip.getAllPositions(), 'player');
      newMessage += ` SUNK ${game.hitShip.name.toUpperCase()}!`;
      game.playerLoseShip('opponent');
      if (game.checkIfGameOver()) {
        game.changeGameState('gameOver');
        newMessage += ' Game over. You win!';
      } else {
        newMessage += ' Computer is thinking 🤔';
        game.changeGameState('computerTurn');
        setTimeout(() => {
          doComputerTurn(game);
        }, 1000);
      }
      setDisplayMessage(newMessage);
    }
  } else {
    setDisplayMessage(`MISS on ${rowDict[attackCoordinates[0]]}${attackCoordinates[1]}. Computer is thinking 🤔`);
    square.style.backgroundColor = 'mediumAquaMarine';
    game.changeGameState('computerTurn');
    setTimeout(() => {
      doComputerTurn(game);
    }, 1000);
  }
};

//* ***************************required classes************************************

class Ship {
  constructor(coordinates, name) {
    this.positions = initializeShipPositions(coordinates);
    this.name = name;
  }

  checkIfShipIsSunk() {
    //(true means the position is hit). Checks all positions belong to that ship and checks if they're all hit.
    let currPosition;
    const allPositions = Object.keys(this.positions);
    for (let position = 0; position < allPositions.length; position += 1) {
      currPosition = allPositions[position];
      if (this.positions[currPosition]) {
        return false;
      }
    }
    return true;
  }

  getAllPositions() {
    return Object.keys(this.positions);
  }

  positionHit(position) {
    //go to the ship's positions, find the one that's hit and set it to false.
    this.positions[position] = false;
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
    //computer finds all spots that are null(meaning they haven't been attacked)
    //chooses a random spot and returns it.
    const unattackedSpots = Object.keys(this.tracker).filter(spot => this.tracker[spot] === null).map(spot => spot.split(','));
    const randomIndex = getRandomNumberBelow(unattackedSpots.length);
    return unattackedSpots[randomIndex];
  }

  chooseRandomHitSpot() {
    //computer chooses a random spot that it knows is hit but not sunk.
    if (this.hitSpots.length > 0) {
      const randomIndex = getRandomNumberBelow(this.hitSpots.length);
      return this.hitSpots[randomIndex];
    }
    return null;
  }

  chooseAttackSpotFromCenter(hitSpot) {
    const row = Number(hitSpot[0]);
    const col = Number(hitSpot[1]);

    const leftOfSpot = [row, col - 1];
    const rightOfSpot = [row, col + 1];
    const belowSpot = [row + 1, col];
    const aboveSpot = [row - 1, col];

    const directions = ['left', 'right', 'below', 'above'];
    let currDirection;

    shuffleArray(directions);

    // given a spot that's already hit, test all four directions from that hit spot in a random order.
    // For each direction:
      // if the spot in that direction has not been hit and the spot in the opposite direction HAS, return that spot.

    //If we go through all four directions and none of them satisfy this condition...

    //choose a random direction and check if it is hit. If it's not, return that spot.

    //if there are no available spots, return null. We can't attack adjacent to this hit spot. (this should never happen)

    for (let i = 0; i < directions.length; i += 1) {
      currDirection = directions[i];
      if (currDirection === 'left') {
        if (this.tracker[leftOfSpot] === null && this.tracker[rightOfSpot] === 'hit') {
          return leftOfSpot;
        }
      } else if (currDirection === 'right') {
        if (this.tracker[rightOfSpot] === null && this.tracker[leftOfSpot] === 'hit') {
          return rightOfSpot;
        }
      } else if (currDirection === 'below') {
        if (this.tracker[belowSpot] === null && this.tracker[aboveSpot] === 'hit') {
          return belowSpot;
        }
      } else if (currDirection === 'above') {
        if (this.tracker[aboveSpot] === null && this.tracker[belowSpot] === 'hit') {
          return aboveSpot;
        }
      }
    }

    for (let j = 0; j < directions.length; j += 1) {
      currDirection = directions[j];
      if (currDirection === 'left') {
        if (this.tracker[leftOfSpot] === null) {
          return leftOfSpot;
        }
      }
      if (currDirection === 'right') {
        if (this.tracker[rightOfSpot] === null) {
          return rightOfSpot;
        }
      }
      if (currDirection === 'below') {
        if (this.tracker[belowSpot] === null) {
          return belowSpot;
        }
      }
      if (currDirection === 'above') {
        if (this.tracker[aboveSpot] === null) {
          return aboveSpot;
        }
      }
    }

    return null;
  }

  updateHitSpots() {
    //used when we change the computer's tracker. It removes all spots in hitSpots(an array) that are no longer marked as 'hit'
    this.hitSpots = Object.keys(this.tracker).filter(spot => this.tracker[spot] === 'hit').map(spot => spot.split(','));
  }

  updateSquareStatus(square, status) {
    this.tracker[square] = status;
  }
}

class Game {
  constructor(height, width) {
    this.state = 'playerChoose';
    this.width = width;
    this.height = height;
    this.computer = new Computer(height, width);
    this.playerShips = [];
    this.opponentShips = [];
    this.remainingPlayerShips = 5;
    this.remainingOpponentShips = 5;
    this.playerSelectedSquare = false;
    this.playerSelect = { coordinates: null, square: null };
    this.spotsSelected = [];
    this.hitShip = null;
  }

  addNewShip(coordinates, player, name) {
    //creates a new ship object and adds it to that player's ships.

    const newShip = new Ship(coordinates, name);
    if (player === 'player') {
      this.playerShips.push(newShip);
    } else {
      this.opponentShips.push(newShip);
    }
  }

  clearPlayerSelect() {
    //all properties that keep track of whether the player has selected a square are cleared.

    this.playerSelect.coordinates = null;
    this.playerSelect.square = null;
    this.playerSelectedSquare = false;
  }

  checkIfHit(attackCoordinates, attackingPlayer) {
    // scans the player's ships
      // for each ship, all positions are checked to see if they match the attack coordinates.
      // if it's a hit, we save the hit ship onto a property of game, then return true.
      // if it's not, we return false.

    let ships;
    let currShip;
    let currPosition;
    if (attackingPlayer === 'player') {
      ships = this.opponentShips;
    } else {
      ships = this.playerShips;
    }
    for (let j = 0; j < ships.length; j += 1) {
      currShip = ships[j];
      let allPositions = Object.keys(currShip.positions);
      for (let k = 0; k < allPositions.length; k += 1) {
        currPosition = allPositions[k].split(',');
        if (currPosition[0] === attackCoordinates[0] && currPosition[1] === attackCoordinates[1]) {
          currShip.positionHit([Number(attackCoordinates[0]), Number(attackCoordinates[1])])
          this.hitShip = currShip;
          return true;
        }
      }
    }
    return false;
  }

  checkIfGameOver() {
    //if either player has no ships left, we return true.
    return (!(this.remainingPlayerShips && this.remainingOpponentShips));
  }

  changeGameState(newState) {
    this.state = newState;
  }

  getNumberSpotsSelected() {
    return this.spotsSelected.length;
  }

  getNumberShipsPlaced() {
    return this.playerShips.length;
  }

  playerLoseShip(player) {
    if (player === 'player') {
      this.remainingPlayerShips -= 1;
    } else {
      this.remainingOpponentShips -= 1;
    }
  }

  playerSelectSquare(coordinates, square) {
    this.playerSelect.square = square;
    this.playerSelect.coordinates = coordinates;
    this.playerSelectedSquare = true;
  }

  resetSpotsSelected() {
    this.spotsSelected = [];
  }
}


//* ************************define squares and buttons****************************

const playerSquares = document.getElementsByClassName('playerSquare');
const computerSquares = document.getElementsByClassName('opponentSquare');
const shipPlacementButton = document.getElementById('shipPlacementButton');
const attackOpponentButton = document.getElementById('attackOpponentButton');

//* **************************start up the game***********************************
createGridView(10, 10);
const game = new Game(10, 10);
setDisplayMessage('Choose your carrier placement (Pick 5)');

//* ****************************event listeners************************************

// player square click logic
for (let i = 0; i < game.height * game.width; i += 1) {

  //when a player clicks a square on their own grid
    //if the state is player choose:
      //if the player needs to pick more spots for their current ship ahd spot they clicked on is white,
      //add the square id to spots selected and change the BG color to green.
      //if the number of spots the player chose + 1 equals the spots for the ship required, toggle the button off.

  const square = playerSquares[i];
  square.addEventListener('click', () => {
    if (game.state === 'playerChoose') {
      let numberSpotsChosen = game.getNumberSpotsSelected();
      let shipIndex = game.getNumberShipsPlaced();
      let spotsRequired = shipsPlacedToInfoMap[shipIndex].spots;
      let squareColor = square.style.backgroundColor;

      if (squareColor === 'white' && numberSpotsChosen < spotsRequired) {
        game.spotsSelected.push(square.id.slice(1));
        square.style.backgroundColor = 'green';
        if (numberSpotsChosen + 1 === spotsRequired) {
          toggleButton(shipPlacementButton);
        }
      } else if (squareColor === 'green') {
        square.style.backgroundColor = 'white';
        game.spotsSelected = game.spotsSelected.filter(spot => spot !== square.id.slice(1));
        if (shipPlacementButton.style.display === 'block') {
          toggleButton(shipPlacementButton);
        }
      }
    }
  });
}

// computer square click logic

for (let i = 0; i < game.height * game.width; i += 1) {

  //when you click on a computer square:
    //if the square is green, effectively deselect it and detoggle the button.
    //Otherwise, if it's white and it's the player's turn, if the player has not already selected a square, select the square.
  let square = computerSquares[i];
  square.addEventListener('click', () => {
    if (square.style.backgroundColor === 'green') {
      game.playerSelectedSquare = false;
      square.style.backgroundColor = 'white';
      toggleButton(attackOpponentButton);
      return;
    }
    if (game.state === 'playerTurn' && square.style.backgroundColor === 'white') {
      if (!game.playerSelectedSquare) {
        square.style.backgroundColor = 'green';
        let coordinates = square.id.slice(1).split(',');
        game.playerSelectSquare(coordinates, square);
        toggleButton(attackOpponentButton);
      }
    }
  });
}

shipPlacementButton.addEventListener('click', () => {
  shipPlacementButtonClickHandler(game, shipPlacementButton);
});

attackOpponentButton.addEventListener('click', () => {
  attackOpponentButtonClickHandler(game, game.playerSelect.coordinates,
    game.playerSelect.square, attackOpponentButton);
});
