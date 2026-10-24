import { describe, expect, it } from 'vitest';

import { decide, signInHref } from './gate';
import { roleFromClaims } from './role';

describe('who gets into the Studio', () => {
  it('lets in a signed-in owner or editor', () => {
    expect(decide({ pathname: '/studio', signedIn: true, role: 'owner' })).toBe('allow');
    expect(decide({ pathname: '/studio/albums/alb_000001', signedIn: true, role: 'editor' })).toBe(
      'allow',
    );
  });

  it('refuses a signed-out visitor and a signed-in account with no role alike', () => {
    expect(decide({ pathname: '/studio', signedIn: false, role: null })).toBe('forbid');
    expect(decide({ pathname: '/studio', signedIn: true, role: null })).toBe('forbid');
  });

  it('always leaves the sign-in screen reachable', () => {
    expect(decide({ pathname: '/studio/sign-in', signedIn: false, role: null })).toBe('sign-in');
    expect(decide({ pathname: '/studio/sign-in/factor-one', signedIn: false, role: null })).toBe(
      'sign-in',
    );
  });

  it('never serves the 403 screen as a page of its own', () => {
    expect(decide({ pathname: '/studio/forbidden', signedIn: true, role: 'owner' })).toBe('forbid');
  });
});

describe('the way back after signing in', () => {
  it('returns to the Studio page that was asked for', () => {
    expect(signInHref('/studio/albums/alb_000019?x=1')).toBe(
      '/studio/sign-in?redirect_url=%2Fstudio%2Falbums%2Falb_000019%3Fx%3D1',
    );
  });

  it('falls back to the dashboard for anything outside the Studio', () => {
    expect(signInHref('https://elsewhere.example')).toBe('/studio/sign-in?redirect_url=%2Fstudio');
    expect(signInHref('/studio/forbidden')).toBe('/studio/sign-in?redirect_url=%2Fstudio');
    expect(signInHref(undefined)).toBe('/studio/sign-in?redirect_url=%2Fstudio');
  });
});

describe('reading the role from the session claims', () => {
  it('reads owner and editor from public_metadata', () => {
    expect(roleFromClaims({ public_metadata: { role: 'owner' } })).toBe('owner');
    expect(roleFromClaims({ public_metadata: { role: 'editor' } })).toBe('editor');
  });

  it('finds no role in claims without one, an unknown one, or no claims', () => {
    expect(roleFromClaims({ sub: 'user_1' })).toBeNull();
    expect(roleFromClaims({ public_metadata: { role: 'admin' } })).toBeNull();
    expect(roleFromClaims({ public_metadata: 'owner' })).toBeNull();
    expect(roleFromClaims(null)).toBeNull();
  });
});
