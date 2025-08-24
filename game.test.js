const {
    PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, WINNING_SCORE, PLAYER_X, AI_X,
    getState, setState,
    triggerShake, Particle, createParticles, playSound,
    update, resetBall, resetGame,
    init,
    _private
} = require('./game.js');

// Mock the canvas provided in game.js
const mockCanvas = {
    width: 800,
    height: 500,
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      fillText: jest.fn(),
      setLineDash: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn()
    })),
    addEventListener: jest.fn(),
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      width: 800,
      height: 500
    }))
  };
_private.canvas = mockCanvas;


beforeEach(() => {
  jest.clearAllMocks();
  init(mockCanvas);
  if (global.restoreMathRandom) {
    global.restoreMathRandom();
  }
});

describe('Game Constants', () => {
  test('should have correct paddle dimensions', () => {
    expect(PADDLE_WIDTH).toBe(15);
    expect(PADDLE_HEIGHT).toBe(100);
  });

  test('should have correct ball radius', () => {
    expect(BALL_RADIUS).toBe(12);
  });

  test('should have correct winning score', () => {
    expect(WINNING_SCORE).toBe(5);
  });

  test('should have correct paddle positions', () => {
    expect(PLAYER_X).toBe(20);
    expect(AI_X).toBe(mockCanvas.width - PADDLE_WIDTH - 20);
  });
});

describe('Game State Initialization', () => {
  test('should initialize player and AI paddles at center', () => {
    const { playerY, aiY } = getState();
    expect(playerY).toBe(mockCanvas.height / 2 - PADDLE_HEIGHT / 2);
    expect(aiY).toBe(mockCanvas.height / 2 - PADDLE_HEIGHT / 2);
  });

  test('should initialize ball at center', () => {
    const { ballX, ballY } = getState();
    expect(ballX).toBe(mockCanvas.width / 2);
    expect(ballY).toBe(mockCanvas.height / 2);
  });

  test('should initialize scores to zero', () => {
    const { playerScore, aiScore } = getState();
    expect(playerScore).toBe(0);
    expect(aiScore).toBe(0);
  });

  test('should initialize game as not over', () => {
    expect(getState().gameOver).toBe(false);
  });

  test('should initialize particles array as empty', () => {
    expect(getState().particles).toEqual([]);
  });

  test('should initialize shake duration to zero', () => {
    expect(getState().shakeDuration).toBe(0);
  });
});

describe('Screen Shake Functionality', () => {
  test('should set shake duration and intensity', () => {
    triggerShake(10, 8);
    const { shakeDuration, shakeIntensity } = getState();
    expect(shakeDuration).toBe(10);
    expect(shakeIntensity).toBe(8);
  });

  test('should handle zero duration shake', () => {
    triggerShake(0, 5);
    const { shakeDuration, shakeIntensity } = getState();
    expect(shakeDuration).toBe(0);
    expect(shakeIntensity).toBe(5);
  });

  test('should handle negative values gracefully', () => {
    triggerShake(-5, -3);
    const { shakeDuration, shakeIntensity } = getState();
    expect(shakeDuration).toBe(-5);
    expect(shakeIntensity).toBe(-3);
  });
});

describe('Particle System', () => {
  describe('Particle Class', () => {
    test('should create particle with correct initial properties', () => {
      global.mockMathRandom(0.5);
      const particle = new Particle(100, 200, '#ff0000');
      
      expect(particle.x).toBe(100);
      expect(particle.y).toBe(200);
      expect(particle.color).toBe('#ff0000');
      expect(particle.life).toBe(1);
      expect(particle.size).toBeGreaterThanOrEqual(2);
      expect(particle.size).toBeLessThanOrEqual(6);
    });

    test('should update particle position and life', () => {
      global.mockMathRandom(0.7);
      const particle = new Particle(100, 200, '#ff0000');
      const initialX = particle.x;
      const initialY = particle.y;
      const initialLife = particle.life;
      
      particle.update();
      
      expect(particle.x).not.toBe(initialX);
      expect(particle.y).not.toBe(initialY);
      expect(particle.life).toBeLessThan(initialLife);
    });

    test('should decrease life by 0.05 each update', () => {
      const particle = new Particle(0, 0, '#000000');
      const initialLife = particle.life;
      
      particle.update();
      
      expect(particle.life).toBe(initialLife - 0.05);
    });
  });

  describe('createParticles Function', () => {
    beforeEach(() => {
        setState({ particles: [] });
    });

    test('should create 15 particles at specified position', () => {
      createParticles(300, 250, '#00ff00');
      const { particles } = getState();
      expect(particles.length).toBe(15);
      particles.forEach(particle => {
        expect(particle.x).toBe(300);
        expect(particle.y).toBe(250);
        expect(particle.color).toBe('#00ff00');
      });
    });

    test('should add particles to existing array', () => {
      setState({ particles: [new Particle(0, 0, '#000000')] });
      createParticles(100, 100, '#ffffff');
      const { particles } = getState();
      expect(particles.length).toBe(16); // 1 existing + 15 new
    });
  });
});

describe('Sound System', () => {
  test('should reset currentTime and play sound', () => {
    const mockSound = { currentTime: 5, play: jest.fn() };
    playSound(mockSound);
    expect(mockSound.currentTime).toBe(0);
    expect(mockSound.play).toHaveBeenCalled();
  });
});

describe('Ball Reset Functionality', () => {
  test('should reset ball to center position', () => {
    setState({ ballX: 100, ballY: 100 });
    resetBall();
    const { ballX, ballY } = getState();
    expect(ballX).toBe(mockCanvas.width / 2);
    expect(ballY).toBe(mockCanvas.height / 2);
  });

  test('should set random ball speed direction', () => {
    global.mockMathRandom(0.3); // Less than 0.5, should go right
    resetBall();
    expect(getState().ballSpeedX).toBe(5);
    
    global.mockMathRandom(0.7); // Greater than 0.5, should go left
    resetBall();
    expect(getState().ballSpeedX).toBe(-5);
  });

  test('should trigger screen shake when ball resets', () => {
    setState({ shakeDuration: 0 });
    resetBall();
    expect(getState().shakeDuration).toBeGreaterThan(0);
  });
});

describe('Game Reset Functionality', () => {
  test('should reset all game state to initial values', () => {
    setState({
        playerScore: 3,
        aiScore: 2,
        gameOver: true,
        ballX: 100,
        ballY: 100,
    });
    
    resetGame();
    
    const { playerScore, aiScore, gameOver, ballX, ballY } = getState();
    expect(playerScore).toBe(0);
    expect(aiScore).toBe(0);
    expect(gameOver).toBe(false);
    expect(ballX).toBe(mockCanvas.width / 2);
    expect(ballY).toBe(mockCanvas.height / 2);
  });
});

describe('Game Update Logic', () => {
  describe('Ball Movement', () => {
    test('should move ball according to speed', () => {
      const { ballX: initialX, ballY: initialY } = getState();
      setState({ ballSpeedX: 3, ballSpeedY: 2 });
      
      update();
      
      const { ballX, ballY } = getState();
      expect(ballX).toBe(initialX + 3);
      expect(ballY).toBe(initialY + 2);
    });
  });

  describe('Wall Collision', () => {
    test('should bounce ball off top wall', () => {
      setState({ ballY: BALL_RADIUS - 1, ballSpeedY: -5 });
      
      update();
      
      const { ballY, ballSpeedY } = getState();
      expect(ballY).toBe(BALL_RADIUS);
      expect(ballSpeedY).toBe(5);
    });

    test('should bounce ball off bottom wall', () => {
      setState({ ballY: mockCanvas.height - BALL_RADIUS + 1, ballSpeedY: 5 });
      
      update();
      
      const { ballY, ballSpeedY } = getState();
      expect(ballY).toBe(mockCanvas.height - BALL_RADIUS);
      expect(ballSpeedY).toBe(-5);
    });
  });

  describe('Paddle Collision', () => {
    test('should bounce ball off player paddle', () => {
        const { playerY } = getState();
        setState({
            ballX: PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1,
            ballY: playerY + PADDLE_HEIGHT / 2,
            ballSpeedX: -5
        });
      
      update();
      
      const { ballX, ballSpeedX } = getState();
      expect(ballX).toBe(PLAYER_X + PADDLE_WIDTH + BALL_RADIUS);
      expect(ballSpeedX).toBe(5);
    });

    test('should bounce ball off AI paddle', () => {
        const { aiY } = getState();
        setState({
            ballX: AI_X + BALL_RADIUS - 1,
            ballY: aiY + PADDLE_HEIGHT / 2,
            ballSpeedX: 5
        });
      
      update();
      
      const { ballX, ballSpeedX } = getState();
      expect(ballX).toBe(AI_X - BALL_RADIUS);
      expect(ballSpeedX).toBe(-5);
    });

    test('should not collide with player paddle when ball is outside paddle height', () => {
        const { playerY } = getState();
        setState({
            ballX: PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1,
            ballY: playerY - 10,
            ballSpeedX: -5
        });
      const { ballSpeedX: initialSpeedX } = getState();
      
      update();
      
      expect(getState().ballSpeedX).toBe(initialSpeedX);
    });

    test('should not collide with AI paddle when ball is outside paddle height', () => {
        const { aiY } = getState();
        setState({
            ballX: AI_X + BALL_RADIUS - 1,
            ballY: aiY - 10,
            ballSpeedX: 5
        });
      const { ballSpeedX: initialSpeedX } = getState();
      
      update();
      
      expect(getState().ballSpeedX).toBe(initialSpeedX);
    });
  });

  describe('AI Movement', () => {
    test('should move AI paddle down when ball is below', () => {
      setState({ aiY: 100, ballY: 100 + PADDLE_HEIGHT / 2 + 30 });
      const { aiY: initialAiY } = getState();
      
      update();
      
      expect(getState().aiY).toBeGreaterThan(initialAiY);
    });

    test('should move AI paddle up when ball is above', () => {
      setState({ aiY: 200, ballY: 200 + PADDLE_HEIGHT / 2 - 30 });
      const { aiY: initialAiY } = getState();
      
      update();
      
      expect(getState().aiY).toBeLessThan(initialAiY);
    });

    test('should not move AI paddle when ball is near center', () => {
      setState({ aiY: 200, ballY: 200 + PADDLE_HEIGHT / 2 });
      const { aiY: initialAiY } = getState();
      
      update();
      
      expect(getState().aiY).toBe(initialAiY);
    });

    test('should keep AI paddle within canvas bounds', () => {
      setState({ aiY: -10, ballY: 0 });
      
      update();
      
      expect(getState().aiY).toBeGreaterThanOrEqual(0);
    });

    test('should keep AI paddle within bottom canvas bounds', () => {
      setState({ aiY: mockCanvas.height, ballY: mockCanvas.height });
      
      update();
      
      expect(getState().aiY).toBeLessThanOrEqual(mockCanvas.height - PADDLE_HEIGHT);
    });
  });

  describe('Scoring System', () => {
    test('should increase AI score when ball goes off left side', () => {
      // Position ball to score, and move player paddle out of the way
      setState({ ballX: 0, ballSpeedX: -10, playerY: -200 });
      const { aiScore: initialAiScore } = getState();
      
      update();
      
      expect(getState().aiScore).toBe(initialAiScore + 1);
    });

    test('should increase player score when ball goes off right side', () => {
      // Position ball to score, and move AI paddle out of the way
      setState({ ballX: mockCanvas.width, ballSpeedX: 10, aiY: -200 });
      const { playerScore: initialPlayerScore } = getState();
      
      update();
      
      expect(getState().playerScore).toBe(initialPlayerScore + 1);
    });

    test('should end game when player reaches winning score', () => {
      setState({ playerScore: WINNING_SCORE - 1, ballX: mockCanvas.width, ballSpeedX: 10, aiY: -200 });
      
      update();
      
      expect(getState().playerScore).toBe(WINNING_SCORE);
      expect(getState().gameOver).toBe(true);
    });

    test('should end game when AI reaches winning score', () => {
      setState({ aiScore: WINNING_SCORE - 1, ballX: 0, ballSpeedX: -10, playerY: -200 });
      
      update();
      
      expect(getState().aiScore).toBe(WINNING_SCORE);
      expect(getState().gameOver).toBe(true);
    });

    test('should reset ball when scoring but game not over', () => {
      setState({ playerScore: 2, ballX: mockCanvas.width, ballSpeedX: 10, aiY: -200 });
      
      update();
      
      const { ballX, ballY, gameOver } = getState();
      expect(ballX).toBe(mockCanvas.width / 2);
      expect(ballY).toBe(mockCanvas.height / 2);
      expect(gameOver).toBe(false);
    });
  });
});

// Mouse controls are harder to test without a real DOM, but we can test the handlers
// if we can extract them. The current structure makes this difficult.
// This section is removed as we cannot test the event listeners directly this way.
