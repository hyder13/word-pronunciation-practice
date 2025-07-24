import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Speech API globally for tests
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  speaking: false,
  pending: false,
  paused: false
};

const mockSpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null
}));

// Mock SpeechSynthesisEvent and SpeechSynthesisErrorEvent
class MockSpeechSynthesisEvent extends Event {
  constructor(type: string, eventInitDict?: any) {
    super(type, eventInitDict);
  }
}

class MockSpeechSynthesisErrorEvent extends Event {
  error: string;
  constructor(type: string, eventInitDict?: { error?: string }) {
    super(type, eventInitDict);
    this.error = eventInitDict?.error || 'unknown';
  }
}

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  configurable: true,
  value: mockSpeechSynthesis
});

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  writable: true,
  configurable: true,
  value: mockSpeechSynthesisUtterance
});

Object.defineProperty(window, 'SpeechSynthesisEvent', {
  writable: true,
  configurable: true,
  value: MockSpeechSynthesisEvent
});

Object.defineProperty(window, 'SpeechSynthesisErrorEvent', {
  writable: true,
  configurable: true,
  value: MockSpeechSynthesisErrorEvent
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockSpeechSynthesis.speaking = false;
  mockSpeechSynthesis.pending = false;
  mockSpeechSynthesis.paused = false;
});