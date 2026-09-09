import { describe, it, expect } from 'vitest';

import authReducer, { AuthActionType, initialAuthState } from './authReducer';

describe('authReducer Unit Tests', () => {
  it('should handle LOGIN_SUCCESS', () => {
    const user = { _id: 'u1', email: 'test@example.com' };
    const nextState = authReducer(initialAuthState, {
      type: AuthActionType.LOGIN_SUCCESS,
      payload: user,
      isFirstTimeUser: true
    });

    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(user);
    expect(nextState.loading).toBe(false);
    expect(nextState.isFirstTimeUser).toBe(true);
  });

  it('should handle LOGIN_FAILURE', () => {
    const nextState = authReducer(initialAuthState, {
      type: AuthActionType.LOGIN_FAILURE,
      payload: 'Invalid credentials'
    });

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
    expect(nextState.error).toBe('Invalid credentials');
  });

  it('should handle LOGOUT', () => {
    const loggedInState = {
      ...initialAuthState,
      isAuthenticated: true,
      user: { _id: 'u1' }
    };

    const nextState = authReducer(loggedInState, {
      type: AuthActionType.LOGOUT
    });

    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.user).toBeNull();
  });
});
