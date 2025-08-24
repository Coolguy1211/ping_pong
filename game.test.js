/**
 * Unit tests for game.js - Pong Game
 * Tests focus on game logic, state management, and core functionality
 */

// Import the game file by requiring it
// Since game.js uses global variables and DOM, we need to set up the environment first
beforeEach(() => {
  // Reset global variables before each test
  jest.clearAllMocks();
  
  // Reset Math.random to default
  if (global.restoreMathRandom) {
    global.restoreMathRandom();
  }
});

// Load the game script
require('./game.js');

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
    expect(AI_X).toBe(canvas.width - PADDLE_WIDTH - 20);
  });
});

describe('Game State Initialization', () => {
  test('should initialize player and AI paddles at center', () => {
    expect(playerY).toBe(canvas.height / 2 - PADDLE_HEIGHT / 2);
    expect(aiY).toBe(canvas.height / 2 - PADDLE_HEIGHT / 2);
  });

  test('should initialize ball at center', () => {
    expect(ballX).toBe(canvas.width / 2);
    expect(ballY).toBe(canvas.height / 2);
  });

  test('should initialize scores to zero', () => {
    expect(playerScore).toBe(0);
    expect(aiScore).toBe(0);
  });

  test('should initialize game as not over', () => {
    expect(gameOver).toBe(false);
  });

  test('should initialize particles array as empty', () => {
    expect(particles).toEqual([]);
  });

  test('should initialize shake duration to zero', () => {
    expect(shakeDuration).toBe(0);
  });

  test('should initialize shake intensity', () => {
    expect(shakeIntensity).toBe(5);
  });

  test('should initialize ball speed with random direction', () => {
    expect(Math.abs(ballSpeedX)).toBe(5);
    expect(ballSpeedY).toBeGreaterThanOrEqual(-2);
    expect(ballSpeedY).toBeLessThanOrEqual(2);
  });
});

describe('Screen Shake Functionality', () => {
  test('should set shake duration and intensity', () => {
    triggerShake(10, 8);
    expect(shakeDuration).toBe(10);
    expect(shakeIntensity).toBe(8);
  });

  test('should handle zero duration shake', () => {
    triggerShake(0, 5);
    expect(shakeDuration).toBe(0);
    expect(shakeIntensity).toBe(5);
  });

  test('should handle negative values gracefully', () => {
    triggerShake(-5, -3);
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

    test('should create particle with random size and speed', () => {
      global.mockMathRandom(0.25);
      const particle = new Particle(0, 0, '#000000');
      
      expect(particle.size).toBe(3); // 0.25 * 4 + 2 = 3
      expect(particle.speedX).toBe(-1); // 0.25 * 4 - 2 = -1
      expect(particle.speedY).toBe(-1); // 0.25 * 4 - 2 = -1
    });

    test('should update particle position and life', () => {
      global.mockMathRandom(0.5);
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

    test('should draw particle with correct properties', () => {
      const particle = new Particle(50, 75, '#00ff00');
      particle.size = 3;
      particle.life = 0.8;
      
      particle.draw();
      
      expect(ctx.globalAlpha).toBe(1); // Should be reset to 1 after drawing
      expect(ctx.fillStyle).toBe('#00ff00');
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalledWith(50, 75, 3, 0, Math.PI * 2);
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('createParticles Function', () => {
    beforeEach(() => {
      particles.length = 0; // Clear particles array
    });

    test('should create 15 particles at specified position', () => {
      createParticles(300, 250, '#00ff00');
      
      expect(particles.length).toBe(15);
      particles.forEach(particle => {
        expect(particle.x).toBe(300);
        expect(particle.y).toBe(250);
        expect(particle.color).toBe('#00ff00');
      });
    });

    test('should add particles to existing array', () => {
      particles.push(new Particle(0, 0, '#000000'));
      createParticles(100, 100, '#ffffff');
      
      expect(particles.length).toBe(16); // 1 existing + 15 new
    });
  });
});

describe('Sound System', () => {
  test('should create audio objects for sound effects', () => {
    expect(hitSound).toBeDefined();
    expect(scoreSound).toBeDefined();
    expect(wallSound).toBeDefined();
  });

  test('should reset currentTime and play sound', () => {
    const mockSound = { currentTime: 5, play: jest.fn() };
    
    playSound(mockSound);
    
    expect(mockSound.currentTime).toBe(0);
    expect(mockSound.play).toHaveBeenCalled();
  });

  test('should handle sound play errors gracefully', () => {
    const mockSound = { 
      currentTime: 5, 
      play: jest.fn().mockRejectedValue(new Error('Play failed'))
    };
    
    expect(() => playSound(mockSound)).not.toThrow();
    expect(mockSound.currentTime).toBe(0);
    expect(mockSound.play).toHaveBeenCalled();
  });
});

describe('Ball Reset Functionality', () => {
  test('should reset ball to center position', () => {
    // Move ball away from center
    ballX = 100;
    ballY = 100;
    
    resetBall();
    
    expect(ballX).toBe(canvas.width / 2);
    expect(ballY).toBe(canvas.height / 2);
  });

  test('should set random ball speed direction', () => {
    global.mockMathRandom(0.3); // Less than 0.5, should go left
    resetBall();
    expect(ballSpeedX).toBe(-5);
    
    global.mockMathRandom(0.7); // Greater than 0.5, should go right
    resetBall();
    expect(ballSpeedX).toBe(5);
  });

  test('should trigger screen shake when ball resets', () => {
    const initialShakeDuration = shakeDuration;
    resetBall();
    expect(shakeDuration).toBeGreaterThan(initialShakeDuration);
  });

  test('should play score sound when ball resets', () => {
    const playSpy = jest.spyOn(scoreSound, 'play');
    resetBall();
    expect(scoreSound.currentTime).toBe(0);
    expect(playSpy).toHaveBeenCalled();
  });
});

describe('Game Reset Functionality', () => {
  test('should reset all game state to initial values', () => {
    // Set game to a non-initial state
    playerScore = 3;
    aiScore = 2;
    gameOver = true;
    ballX = 100;
    ballY = 100;
    
    resetGame();
    
    expect(playerScore).toBe(0);
    expect(aiScore).toBe(0);
    expect(gameOver).toBe(false);
    expect(ballX).toBe(canvas.width / 2);
    expect(ballY).toBe(canvas.height / 2);
  });
});

describe('Game Update Logic', () => {
  beforeEach(() => {
    // Reset game state
    resetGame();
    particles.length = 0;
  });

  describe('Ball Movement', () => {
    test('should move ball according to speed', () => {
      const initialX = ballX;
      const initialY = ballY;
      ballSpeedX = 3;
      ballSpeedY = 2;
      
      update();
      
      expect(ballX).toBe(initialX + 3);
      expect(ballY).toBe(initialY + 2);
    });
  });

  describe('Wall Collision', () => {
    test('should bounce ball off top wall', () => {
      ballY = BALL_RADIUS - 1; // Position ball above top wall
      ballSpeedY = -5; // Moving upward
      
      update();
      
      expect(ballY).toBe(BALL_RADIUS);
      expect(ballSpeedY).toBe(5); // Should reverse direction
    });

    test('should bounce ball off bottom wall', () => {
      ballY = canvas.height - BALL_RADIUS + 1; // Position ball below bottom wall
      ballSpeedY = 5; // Moving downward
      
      update();
      
      expect(ballY).toBe(canvas.height - BALL_RADIUS);
      expect(ballSpeedY).toBe(-5); // Should reverse direction
    });

    test('should play wall sound on top collision', () => {
      ballY = BALL_RADIUS - 1;
      ballSpeedY = -5;
      const playSpy = jest.spyOn(wallSound, 'play');
      
      update();
      
      expect(wallSound.currentTime).toBe(0);
      expect(playSpy).toHaveBeenCalled();
    });

    test('should play wall sound on bottom collision', () => {
      ballY = canvas.height - BALL_RADIUS + 1;
      ballSpeedY = 5;
      const playSpy = jest.spyOn(wallSound, 'play');
      
      update();
      
      expect(wallSound.currentTime).toBe(0);
      expect(playSpy).toHaveBeenCalled();
    });
  });

  describe('Paddle Collision', () => {
    test('should bounce ball off player paddle', () => {
      ballX = PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1;
      ballY = playerY + PADDLE_HEIGHT / 2;
      ballSpeedX = -5; // Moving toward player paddle
      
      update();
      
      expect(ballX).toBe(PLAYER_X + PADDLE_WIDTH + BALL_RADIUS);
      expect(ballSpeedX).toBe(5); // Should reverse direction
    });

    test('should bounce ball off AI paddle', () => {
      ballX = AI_X + BALL_RADIUS - 1;
      ballY = aiY + PADDLE_HEIGHT / 2;
      ballSpeedX = 5; // Moving toward AI paddle
      
      update();
      
      expect(ballX).toBe(AI_X - BALL_RADIUS);
      expect(ballSpeedX).toBe(-5); // Should reverse direction
    });

    test('should modify ball Y speed based on paddle hit position - player paddle', () => {
      ballX = PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1;
      ballY = playerY + PADDLE_HEIGHT * 0.75; // Hit lower part of paddle
      ballSpeedX = -5;
      ballSpeedY = 0;
      
      update();
      
      expect(ballSpeedY).toBeGreaterThan(0); // Should angle downward
    });

    test('should modify ball Y speed based on paddle hit position - AI paddle', () => {
      ballX = AI_X + BALL_RADIUS - 1;
      ballY = aiY + PADDLE_HEIGHT * 0.25; // Hit upper part of paddle
      ballSpeedX = 5;
      ballSpeedY = 0;
      
      update();
      
      expect(ballSpeedY).toBeLessThan(0); // Should angle upward
    });

    test('should create particles on player paddle collision', () => {
      ballX = PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1;
      ballY = playerY + PADDLE_HEIGHT / 2;
      ballSpeedX = -5;
      particles.length = 0;
      
      update();
      
      expect(particles.length).toBe(15);
      expect(particles[0].color).toBe('#0f0');
    });

    test('should create particles on AI paddle collision', () => {
      ballX = AI_X + BALL_RADIUS - 1;
      ballY = aiY + PADDLE_HEIGHT / 2;
      ballSpeedX = 5;
      particles.length = 0;
      
      update();
      
      expect(particles.length).toBe(15);
      expect(particles[0].color).toBe('#f00');
    });

    test('should play hit sound on player paddle collision', () => {
      ballX = PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1;
      ballY = playerY + PADDLE_HEIGHT / 2;
      ballSpeedX = -5;
      const playSpy = jest.spyOn(hitSound, 'play');
      
      update();
      
      expect(hitSound.currentTime).toBe(0);
      expect(playSpy).toHaveBeenCalled();
    });

    test('should play hit sound on AI paddle collision', () => {
      ballX = AI_X + BALL_RADIUS - 1;
      ballY = aiY + PADDLE_HEIGHT / 2;
      ballSpeedX = 5;
      const playSpy = jest.spyOn(hitSound, 'play');
      
      update();
      
      expect(hitSound.currentTime).toBe(0);
      expect(playSpy).toHaveBeenCalled();
    });

    test('should not collide with player paddle when ball is outside paddle height', () => {
      ballX = PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1;
      ballY = playerY - 10; // Above paddle
      ballSpeedX = -5;
      const initialSpeedX = ballSpeedX;
      
      update();
      
      expect(ballSpeedX).toBe(initialSpeedX); // Should not reverse
    });

    test('should not collide with AI paddle when ball is outside paddle height', () => {
      ballX = AI_X + BALL_RADIUS - 1;
      ballY = aiY - 10; // Above paddle
      ballSpeedX = 5;
      const initialSpeedX = ballSpeedX;
      
      update();
      
      expect(ballSpeedX).toBe(initialSpeedX); // Should not reverse
    });

    test('should not collide with player paddle when ball is below paddle', () => {
      ballX = PLAYER_X + PADDLE_WIDTH - BALL_RADIUS + 1;
      ballY = playerY + PADDLE_HEIGHT + 10; // Below paddle
      ballSpeedX = -5;
      const initialSpeedX = ballSpeedX;
      
      update();
      
      expect(ballSpeedX).toBe(initialSpeedX); // Should not reverse
    });

    test('should not collide with AI paddle when ball is below paddle', () => {
      ballX = AI_X + BALL_RADIUS - 1;
      ballY = aiY + PADDLE_HEIGHT + 10; // Below paddle
      ballSpeedX = 5;
      const initialSpeedX = ballSpeedX;
      
      update();
      
      expect(ballSpeedX).toBe(initialSpeedX); // Should not reverse
    });
  });

  describe('AI Movement', () => {
    test('should move AI paddle down when ball is below', () => {
      aiY = 100;
      ballY = aiY + PADDLE_HEIGHT / 2 + 30; // Ball below AI center
      const initialAiY = aiY;
      
      update();
      
      expect(aiY).toBeGreaterThan(initialAiY);
      expect(aiY).toBe(initialAiY + 6);
    });

    test('should move AI paddle up when ball is above', () => {
      aiY = 200;
      ballY = aiY + PADDLE_HEIGHT / 2 - 30; // Ball above AI center
      const initialAiY = aiY;
      
      update();
      
      expect(aiY).toBeLessThan(initialAiY);
      expect(aiY).toBe(initialAiY - 6);
    });

    test('should not move AI paddle when ball is near center', () => {
      aiY = 200;
      ballY = aiY + PADDLE_HEIGHT / 2; // Ball at AI center
      const initialAiY = aiY;
      
      update();
      
      expect(aiY).toBe(initialAiY);
    });

    test('should not move AI paddle when ball is within deadzone above center', () => {
      aiY = 200;
      ballY = aiY + PADDLE_HEIGHT / 2 - 10; // Ball within 20px deadzone
      const initialAiY = aiY;
      
      update();
      
      expect(aiY).toBe(initialAiY);
    });

    test('should not move AI paddle when ball is within deadzone below center', () => {
      aiY = 200;
      ballY = aiY + PADDLE_HEIGHT / 2 + 10; // Ball within 20px deadzone
      const initialAiY = aiY;
      
      update();
      
      expect(aiY).toBe(initialAiY);
    });

    test('should keep AI paddle within canvas bounds', () => {
      aiY = -10; // Above canvas
      ballY = 0; // Ball at top
      
      update();
      
      expect(aiY).toBeGreaterThanOrEqual(0);
    });

    test('should keep AI paddle within bottom canvas bounds', () => {
      aiY = canvas.height; // Below canvas
      ballY = canvas.height; // Ball at bottom
      
      update();
      
      expect(aiY).toBeLessThanOrEqual(canvas.height - PADDLE_HEIGHT);
    });
  });

  describe('Scoring System', () => {
    test('should increase AI score when ball goes off left side', () => {
      ballX = -BALL_RADIUS - 1;
      const initialAiScore = aiScore;
      
      update();
      
      expect(aiScore).toBe(initialAiScore + 1);
    });

    test('should increase player score when ball goes off right side', () => {
      ballX = canvas.width + BALL_RADIUS + 1;
      const initialPlayerScore = playerScore;
      
      update();
      
      expect(playerScore).toBe(initialPlayerScore + 1);
    });

    test('should end game when player reaches winning score', () => {
      playerScore = WINNING_SCORE - 1;
      ballX = canvas.width + BALL_RADIUS + 1;
      
      update();
      
      expect(playerScore).toBe(WINNING_SCORE);
      expect(gameOver).toBe(true);
    });

    test('should end game when AI reaches winning score', () => {
      aiScore = WINNING_SCORE - 1;
      ballX = -BALL_RADIUS - 1;
      
      update();
      
      expect(aiScore).toBe(WINNING_SCORE);
      expect(gameOver).toBe(true);
    });

    test('should reset ball when scoring but game not over', () => {
      playerScore = 2;
      ballX = canvas.width + BALL_RADIUS + 1;
      
      update();
      
      expect(ballX).toBe(canvas.width / 2);
      expect(ballY).toBe(canvas.height / 2);
      expect(gameOver).toBe(false);
    });

    test('should reset ball when AI scores but game not over', () => {
      aiScore = 2;
      ballX = -BALL_RADIUS - 1;
      
      update();
      
      expect(ballX).toBe(canvas.width / 2);
      expect(ballY).toBe(canvas.height / 2);
      expect(gameOver).toBe(false);
    });
  });
});

describe('Mouse Controls', () => {
  test('should update player paddle position on mouse move', () => {
    const mockEvent = {
      clientY: 250
    };
    
    // Simulate mouse move event
    const mouseMoveHandler = canvas.addEventListener.mock.calls
      .find(call => call[0] === 'mousemove')[1];
    
    mouseMoveHandler(mockEvent);
    
    expect(playerY).toBe(250 - PADDLE_HEIGHT / 2);
  });

  test('should constrain player paddle within canvas bounds', () => {
    const mockEvent = {
      clientY: -100 // Above canvas
    };
    
    const mouseMoveHandler = canvas.addEventListener.mock.calls
      .find(call => call[0] === 'mousemove')[1];
    
    mouseMoveHandler(mockEvent);
    
    expect(playerY).toBe(0);
  });

  test('should constrain player paddle within bottom canvas bounds', () => {
    const mockEvent = {
      clientY: canvas.height + 100 // Below canvas
    };
    
    const mouseMoveHandler = canvas.addEventListener.mock.calls
      .find(call => call[0] === 'mousemove')[1];
    
    mouseMoveHandler(mockEvent);
    
    expect(playerY).toBe(canvas.height - PADDLE_HEIGHT);
  });

  test('should reset game on click when game is over', () => {
    gameOver = true;
    playerScore = 5;
    aiScore = 3;
    
    const clickHandler = canvas.addEventListener.mock.calls
      .find(call => call[0] === 'click')[1];
    
    clickHandler();
    
    expect(gameOver).toBe(false);
    expect(playerScore).toBe(0);
    expect(aiScore).toBe(0);
  });

  test('should not reset game on click when game is not over', () => {
    gameOver = false;
    playerScore = 2;
    aiScore = 1;
    
    const clickHandler = canvas.addEventListener.mock.calls
      .find(call => call[0] === 'click')[1];
    
    clickHandler();
    
    expect(gameOver).toBe(false);
    expect(playerScore).toBe(2);
    expect(aiScore).toBe(1);
  });
});

describe('Draw Function', () => {
  beforeEach(() => {
    // Reset canvas context mocks
    jest.clearAllMocks();
    particles.length = 0;
    shakeDuration = 0;
    gameOver = false;
  });

  test('should draw background with trail effect', () => {
    draw();
    
    expect(ctx.fillStyle).toBe('rgba(17, 17, 17, 0.3)');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
  });

  test('should draw middle line with dashed style', () => {
    draw();
    
    expect(ctx.strokeStyle).toBe('#555');
    expect(ctx.setLineDash).toHaveBeenCalledWith([10, 10]);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(canvas.width/2, 0);
    expect(ctx.lineTo).toHaveBeenCalledWith(canvas.width/2, canvas.height);
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.setLineDash).toHaveBeenCalledWith([]);
  });

  test('should draw player paddle in green', () => {
    draw();
    
    expect(ctx.fillStyle).toBe('#0f0');
    expect(ctx.fillRect).toHaveBeenCalledWith(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
  });

  test('should draw AI paddle in red', () => {
    draw();
    
    expect(ctx.fillStyle).toBe('#f00');
    expect(ctx.fillRect).toHaveBeenCalledWith(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
  });

  test('should draw ball in white', () => {
    draw();
    
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalledWith(ballX, ballY, BALL_RADIUS, 0, Math.PI*2);
    expect(ctx.fillStyle).toBe('#fff');
    expect(ctx.fill).toHaveBeenCalled();
  });

  test('should draw scores', () => {
    playerScore = 3;
    aiScore = 2;
    
    draw();
    
    expect(ctx.font).toBe('36px Arial');
    expect(ctx.fillStyle).toBe('#fff');
    expect(ctx.fillText).toHaveBeenCalledWith(3, canvas.width/2 - 50, 50);
    expect(ctx.fillText).toHaveBeenCalledWith(2, canvas.width/2 + 20, 50);
  });

  test('should apply screen shake when shake duration > 0', () => {
    shakeDuration = 5;
    shakeIntensity = 10;
    global.mockMathRandom(0.5);
    
    draw();
    
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
    expect(shakeDuration).toBe(4); // Should decrease by 1
  });

  test('should not apply screen shake when shake duration is 0', () => {
    shakeDuration = 0;
    
    draw();
    
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ctx.restore).not.toHaveBeenCalled();
  });

  test('should draw and update particles', () => {
    const particle1 = new Particle(100, 100, '#ff0000');
    const particle2 = new Particle(200, 200, '#00ff00');
    particles.push(particle1, particle2);
    
    const updateSpy1 = jest.spyOn(particle1, 'update');
    const drawSpy1 = jest.spyOn(particle1, 'draw');
    const updateSpy2 = jest.spyOn(particle2, 'update');
    const drawSpy2 = jest.spyOn(particle2, 'draw');
    
    draw();
    
    expect(updateSpy1).toHaveBeenCalled();
    expect(drawSpy1).toHaveBeenCalled();
    expect(updateSpy2).toHaveBeenCalled();
    expect(drawSpy2).toHaveBeenCalled();
  });

  test('should remove dead particles', () => {
    const aliveParticle = new Particle(100, 100, '#ff0000');
    const deadParticle = new Particle(200, 200, '#00ff00');
    deadParticle.life = 0; // Dead particle
    
    particles.push(aliveParticle, deadParticle);
    
    draw();
    
    expect(particles.length).toBe(1);
    expect(particles[0]).toBe(aliveParticle);
  });

  test('should draw game over screen when game is over', () => {
    gameOver = true;
    playerScore = 5;
    
    draw();
    
    expect(ctx.fillStyle).toBe('rgba(0, 0, 0, 0.7)');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
    expect(ctx.font).toBe('60px Arial');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.fillText).toHaveBeenCalledWith('You Win!', canvas.width / 2, canvas.height / 2 - 40);
    expect(ctx.font).toBe('24px Arial');
    expect(ctx.fillText).toHaveBeenCalledWith('Click to Restart', canvas.width / 2, canvas.height / 2 + 20);
  });

  test('should show "Game Over" message when AI wins', () => {
    gameOver = true;
    playerScore = 2;
    aiScore = 5;
    
    draw();
    
    expect(ctx.fillText).toHaveBeenCalledWith('Game Over', canvas.width / 2, canvas.height / 2 - 40);
  });

  test('should show "You Win!" message when player wins', () => {
    gameOver = true;
    playerScore = 5;
    aiScore = 2;
    
    draw();
    
    expect(ctx.fillText).toHaveBeenCalledWith('You Win!', canvas.width / 2, canvas.height / 2 - 40);
  });
});

describe('Game Loop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call update when game is not over', () => {
    gameOver = false;
    const originalUpdate = global.update;
    global.update = jest.fn();
    
    loop();
    
    expect(global.update).toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledWith(loop);
    
    global.update = originalUpdate;
  });

  test('should not call update when game is over', () => {
    gameOver = true;
    const originalUpdate = global.update;
    global.update = jest.fn();
    
    loop();
    
    expect(global.update).not.toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledWith(loop);
    
    global.update = originalUpdate;
  });

  test('should always call draw and requestAnimationFrame', () => {
    const originalDraw = global.draw;
    global.draw = jest.fn();
    
    loop();
    
    expect(global.draw).toHaveBeenCalled();
    expect(requestAnimationFrame).toHaveBeenCalledWith(loop);
    
    global.draw = originalDraw;
  });
});

describe('Edge Cases and Error Handling', () => {
  test('should handle extreme ball speeds', () => {
    ballSpeedX = 1000;
    ballSpeedY = 1000;
    
    expect(() => update()).not.toThrow();
  });

  test('should handle negative ball speeds', () => {
    ballSpeedX = -1000;
    ballSpeedY = -1000;
    
    expect(() => update()).not.toThrow();
  });

  test('should handle ball at exact boundary positions', () => {
    ballY = BALL_RADIUS;
    ballSpeedY = -1;
    
    update();
    
    expect(ballY).toBe(BALL_RADIUS);
    expect(ballSpeedY).toBe(1);
  });

  test('should handle paddle at canvas boundaries', () => {
    playerY = 0;
    aiY = canvas.height - PADDLE_HEIGHT;
    
    expect(() => update()).not.toThrow();
  });

  test('should handle multiple particle updates', () => {
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(i, i, '#ffffff'));
    }
    
    expect(() => draw()).not.toThrow();
  });

  test('should handle particles with zero life', () => {
    const particle = new Particle(0, 0, '#000000');
    particle.life = 0;
    particles.push(particle);
    
    draw();
    
    expect(particles.length).toBe(0);
  });

  test('should handle particles with negative life', () => {
    const particle = new Particle(0, 0, '#000000');
    particle.life = -0.1;
    particles.push(particle);
    
    draw();
    
    expect(particles.length).toBe(0);
  });
});