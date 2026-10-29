/**
 * Tactile Haptics Engine for Mobile Web (iOS Safari, iOS Chrome, Android Chrome)
 *
 * Implements high-frequency tactile ratcheting feedback:
 * 1. iOS: Native Taptic Engine excitation via dual alternating <input type="checkbox" switch> bridges.
 *    (Rendered in active DOM tree with opacity: 0.001 - never display: none, so WebKit Taptic Engine fires).
 * 2. Android: High-precision vibration motor pulses via navigator.vibrate (20ms minor, 34ms major detent).
 */

let switchInputA: HTMLInputElement | null = null;
let switchLabelA: HTMLLabelElement | null = null;
let switchInputB: HTMLInputElement | null = null;
let switchLabelB: HTMLLabelElement | null = null;
let initialized = false;
let toggle = false;
let lastTickTime = 0;

export function initTactileHaptics() {
  if (typeof document === 'undefined' || initialized) return;

  try {
    const container = document.createElement('div');
    container.id = 'cinema-tactile-haptics-bridge';
    container.setAttribute('aria-hidden', 'true');
    Object.assign(container.style, {
      position: 'fixed',
      top: '-100px',
      left: '-100px',
      width: '2px',
      height: '2px',
      opacity: '0.001',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: '-9999',
    });

    // Bridge A
    const inputA = document.createElement('input');
    inputA.type = 'checkbox';
    inputA.id = 'tactile-switch-a';
    inputA.setAttribute('switch', '');
    inputA.tabIndex = -1;
    inputA.setAttribute('aria-hidden', 'true');
    Object.assign(inputA.style, { width: '1px', height: '1px', opacity: '0.001' });

    const labelA = document.createElement('label');
    labelA.htmlFor = 'tactile-switch-a';
    labelA.setAttribute('aria-hidden', 'true');
    Object.assign(labelA.style, { width: '1px', height: '1px', opacity: '0.001' });
    labelA.appendChild(inputA);
    container.appendChild(labelA);

    // Bridge B (Alternating bridge to eliminate WebKit microtask de-duplication during rapid drag)
    const inputB = document.createElement('input');
    inputB.type = 'checkbox';
    inputB.id = 'tactile-switch-b';
    inputB.setAttribute('switch', '');
    inputB.tabIndex = -1;
    inputB.setAttribute('aria-hidden', 'true');
    Object.assign(inputB.style, { width: '1px', height: '1px', opacity: '0.001' });

    const labelB = document.createElement('label');
    labelB.htmlFor = 'tactile-switch-b';
    labelB.setAttribute('aria-hidden', 'true');
    Object.assign(labelB.style, { width: '1px', height: '1px', opacity: '0.001' });
    labelB.appendChild(inputB);
    container.appendChild(labelB);

    document.body.appendChild(container);

    switchInputA = inputA;
    switchLabelA = labelA;
    switchInputB = inputB;
    switchLabelB = labelB;
    initialized = true;
  } catch {}
}

/**
 * Continuous tactile tick while finger is actively moving on timeline / dial.
 * Mimics the iOS Clock alarm time-picker wheel haptic ratcheting.
 */
export function triggerTactileTick(isMajor = false) {
  if (typeof window === 'undefined') return;
  if (!initialized) initTactileHaptics();

  const now = performance.now();
  // Spacing threshold of 26ms ensures crisp physical clicks without damping the hardware motor
  if (now - lastTickTime < 26) return;
  lastTickTime = now;

  // 1. iOS Taptic Engine Trigger
  try {
    const targetLabel = toggle ? switchLabelB : switchLabelA;
    const targetInput = toggle ? switchInputB : switchInputA;
    toggle = !toggle;

    if (targetLabel) {
      targetLabel.click();
    } else if (targetInput) {
      targetInput.click();
    }
  } catch {}

  // 2. Android Vibration API (22ms minor tick, 34ms major date tick)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(isMajor ? 34 : 22);
    } catch {}
  }
}

/**
 * Solid tactile detent snap when user releases finger or locks into a specific date.
 */
export function triggerTactileSnap() {
  if (typeof window === 'undefined') return;
  if (!initialized) initTactileHaptics();

  lastTickTime = performance.now();

  // 1. iOS Taptic Engine
  try {
    if (switchLabelA) switchLabelA.click();
  } catch {}

  // 2. Android Vibration API (two rapid micro-pulses for a luxury mechanical lock feel)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([24, 28, 36]);
    } catch {}
  }
}
