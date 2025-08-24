// Mock Canvas API
const mockCanvas = {
  width: 800,
  height: 500,
  getContext: jest.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    font: '',
    textAlign: '',
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

// Mock document.getElementById
global.document.getElementById = jest.fn((id) => {
  if (id === 'pong') {
    return mockCanvas;
  }
  return null;
});

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  currentTime: 0,
  play: jest.fn(),
  pause: jest.fn(),
  load: jest.fn()
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16); // ~60fps
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock Math.random for predictable tests
const originalRandom = Math.random;
global.mockMathRandom = (value) => {
  Math.random = jest.fn(() => value);
};
global.restoreMathRandom = () => { Math.random = originalRandom; };
