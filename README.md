# Simple Pong Game

This is a simple implementation of the classic Pong game using HTML5 Canvas and JavaScript.

## How to Play

1.  **Open `index.html` in a web browser.**
2.  Move your mouse up and down to control the left paddle.
3.  The objective is to hit the ball with your paddle and score points against the AI opponent.
4.  The first to score 5 points wins!

## Files

*   `index.html`: The main HTML file.
*   `styles.css`: Contains the styling for the game.
*   `game.js`: Contains the game logic.
*   `game.test.js`: Unit tests for the game logic.
*   `package.json`: Project dependencies and scripts.
*   `test-setup.js`: Test environment setup and mocks.
*   `LICENSE`: The license file.

## Testing

This project includes comprehensive unit tests for the game logic.

### Running Tests

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

### Test Coverage

The tests cover:
- Game state initialization
- Ball physics and movement
- Paddle collision detection
- Wall collision detection
- AI movement logic
- Scoring system
- Game reset functionality
- Particle system
- Screen shake effects
- Mouse controls
- Sound system integration

### Test Structure

The test suite is organized into the following categories:
- **Game Constants**: Validates game configuration values
- **Game State Initialization**: Ensures proper initial state
- **Screen Shake Functionality**: Tests visual effects
- **Particle System**: Tests particle creation and behavior
- **Sound System**: Tests audio integration
- **Ball Reset Functionality**: Tests ball repositioning logic
- **Game Reset Functionality**: Tests full game state reset
- **Game Update Logic**: Tests core game mechanics including:
  - Ball movement
  - Wall collisions
  - Paddle collisions
  - AI movement
  - Scoring system
- **Mouse Controls**: Tests user input handling

The tests focus on behavioral testing rather than implementation details, ensuring the game logic works correctly while allowing for internal refactoring.