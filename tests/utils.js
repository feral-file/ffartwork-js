import { vi } from "vitest";

// set URL then (re)load the library so it reads the query string
export async function loadLibWith(url) {
  vi.resetModules();
  
  // Mock window.location.search instead of using replaceState
  const urlObj = new URL(url);
  Object.defineProperty(globalThis.window, 'location', {
    value: { search: urlObj.search },
    configurable: true
  });
  
  await import("../src/index.js"); // your lib attaches window.FeralFile
  return globalThis.window.FeralFile;
}

export function mockFetchOnce(value, { ok = true, status = 200 } = {}) {
  const mockXHR = {
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
    readyState: 4,
    status,
    responseText: JSON.stringify(value),
    onreadystatechange: null,
    onerror: null
  };
  
  globalThis.XMLHttpRequest = vi.fn(() => {
    setTimeout(() => mockXHR.onreadystatechange?.(), 0);
    return mockXHR;
  });
}

export function mockFetchReject(err = new Error("network")) {
  const mockXHR = {
    open: vi.fn(),
    send: vi.fn(),
    setRequestHeader: vi.fn(),
    onreadystatechange: null,
    onerror: null
  };
  
  globalThis.XMLHttpRequest = vi.fn(() => {
    setTimeout(() => mockXHR.onerror?.(err), 0);
    return mockXHR;
  });
}
