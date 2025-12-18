import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global IntersectionObserver Mock
const IntersectionObserverMock = vi.fn();
IntersectionObserverMock.prototype.disconnect = vi.fn();
IntersectionObserverMock.prototype.observe = vi.fn();
IntersectionObserverMock.prototype.takeRecords = vi.fn();
IntersectionObserverMock.prototype.unobserve = vi.fn();

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
