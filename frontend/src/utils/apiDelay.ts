import { API_DELAY } from "../constants/api.constants";

/**
 * Simulates real-world network latency by returning a promise
 * that resolves after a random duration between DELAY_MIN and DELAY_MAX.
 */
export function simulateNetworkDelay(): Promise<void> {
  const delay = Math.floor(Math.random() * (API_DELAY.MAX - API_DELAY.MIN + 1)) + API_DELAY.MIN;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
