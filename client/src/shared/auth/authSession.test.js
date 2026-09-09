import { describe, it, expect, beforeEach } from 'vitest';

import {
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  getFirstTimeUserFlag,
  setFirstTimeUserFlag,
  getNewlyRegisteredUser,
  setNewlyRegisteredUser
} from './authSession';

describe('authSession Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve auth token and user session', () => {
    expect(getAuthToken()).toBeNull();
    setAuthSession('test-jwt-token', { firstName: 'Alex' });
    expect(getAuthToken()).toBe('test-jwt-token');

    clearAuthSession();
    expect(getAuthToken()).toBeNull();
  });

  it('should track and clear first time user flags', () => {
    expect(getFirstTimeUserFlag()).toBe(false);
    setFirstTimeUserFlag(true);
    expect(getFirstTimeUserFlag()).toBe(true);

    setFirstTimeUserFlag(false);
    expect(getFirstTimeUserFlag()).toBe(false);
  });

  it('should store and read newly registered user email', () => {
    setNewlyRegisteredUser('alex@example.com');
    expect(getNewlyRegisteredUser()).toBe('alex@example.com');
  });
});
