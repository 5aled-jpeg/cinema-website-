'use client';

// Preload transition GIFs into browser cache so they appear instantaneously
if (typeof window !== 'undefined') {
  ['/transitions/default.gif', '/transitions/gif1.gif', '/transitions/gif2.gif', '/transitions/gif3.gif'].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

export type AnimationVariant =
  | 'circle'
  | 'rectangle'
  | 'gif'
  | 'polygon'
  | 'circle-blur';

export type AnimationStart =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'bottom-up'
  | 'top-down'
  | 'left-right'
  | 'right-left';

interface Animation {
  name: string;
  css: string;
}

const getPositionCoords = (position: AnimationStart) => {
  switch (position) {
    case 'top-left':
      return { cx: '0', cy: '0' };
    case 'top-right':
      return { cx: '40', cy: '0' };
    case 'bottom-left':
      return { cx: '0', cy: '40' };
    case 'bottom-right':
      return { cx: '40', cy: '40' };
    case 'top-center':
      return { cx: '20', cy: '0' };
    case 'bottom-center':
      return { cx: '20', cy: '40' };
    case 'bottom-up':
    case 'top-down':
    case 'left-right':
    case 'right-left':
    default:
      return { cx: '20', cy: '20' };
  }
};

const generateSVG = (variant: AnimationVariant, start: AnimationStart) => {
  if (variant === 'circle-blur') {
    if (start === 'center') {
      return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="20" cy="20" r="18" fill="white" filter="url(%23blur)"/></svg>`;
    }
    const positionCoords = getPositionCoords(start);
    const { cx, cy } = positionCoords;
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="${cx}" cy="${cy}" r="18" fill="white" filter="url(%23blur)"/></svg>`;
  }

  if (start === 'center') return '';
  if (variant === 'rectangle') return '';

  const positionCoords = getPositionCoords(start);
  const { cx, cy } = positionCoords;

  if (variant === 'circle') {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
  }

  return '';
};

const getTransformOrigin = (start: AnimationStart) => {
  switch (start) {
    case 'top-left':
      return 'top left';
    case 'top-right':
      return 'top right';
    case 'bottom-left':
      return 'bottom left';
    case 'bottom-right':
      return 'bottom right';
    case 'top-center':
      return 'top center';
    case 'bottom-center':
      return 'bottom center';
    case 'bottom-up':
    case 'top-down':
    case 'left-right':
    case 'right-left':
    default:
      return 'center';
  }
};

export const createAnimation = (
  variant: AnimationVariant = 'gif',
  start: AnimationStart = 'center',
  blur = false,
  url?: string,
  customOrigin?: { x: number; y: number }
): Animation => {
  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);

  if (variant === 'gif') {
    const gif = url || '/transitions/default.gif';
    return {
      name: `${variant}-${start}`,
      css: `
      ::view-transition-group(root) {
        animation-duration: 1.6s;
        animation-timing-function: cubic-bezier(0.95, 0.05, 0.795, 0.035);
      }

      ::view-transition-new(root) {
        -webkit-mask-image: url('${gif}');
        -webkit-mask-position: center center;
        -webkit-mask-repeat: no-repeat;
        -webkit-mask-size: 0;
        mask-image: url('${gif}');
        mask-position: center center;
        mask-repeat: no-repeat;
        mask-size: 0;
        animation: scale-gif 1.6s cubic-bezier(0.95, 0.05, 0.795, 0.035);
        mix-blend-mode: normal;
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: scale-gif 1.6s cubic-bezier(0.95, 0.05, 0.795, 0.035);
        mix-blend-mode: normal;
        z-index: -1;
      }

      @keyframes scale-gif {
        0% {
          -webkit-mask-size: 0;
          mask-size: 0;
        }
        18% {
          -webkit-mask-size: 55vmax;
          mask-size: 55vmax;
        }
        70% {
          -webkit-mask-size: 55vmax;
          mask-size: 55vmax;
        }
        100% {
          -webkit-mask-size: 3500vmax;
          mask-size: 3500vmax;
        }
      }
      `,
    };
  }

  if (variant === 'rectangle') {
    const getClipPath = (direction: AnimationStart) => {
      switch (direction) {
        case 'bottom-up':
          return {
            from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'top-down':
          return {
            from: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'left-right':
          return {
            from: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'right-left':
          return {
            from: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'top-left':
          return {
            from: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'top-right':
          return {
            from: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'bottom-left':
          return {
            from: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        case 'bottom-right':
          return {
            from: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
        default:
          return {
            from: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
            to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          };
      }
    };

    const clipPath = getClipPath(start);

    return {
      name: `${variant}-${start}${blur ? '-blur' : ''}`,
      css: `
      ::view-transition-group(root) {
        animation-duration: 0.75s;
        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light-${start}${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start}${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      @keyframes reveal-dark-${start}${blur ? '-blur' : ''} {
        from {
          clip-path: ${clipPath.from};
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: ${clipPath.to};
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }

      @keyframes reveal-light-${start}${blur ? '-blur' : ''} {
        from {
          clip-path: ${clipPath.from};
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: ${clipPath.to};
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
      `,
    };
  }

  if (variant === 'circle' && start === 'center' && !customOrigin) {
    return {
      name: `${variant}-${start}${blur ? '-blur' : ''}`,
      css: `
      ::view-transition-group(root) {
        animation-duration: 0.75s;
        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }
            
      ::view-transition-new(root) {
        animation-name: reveal-light${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark${blur ? '-blur' : ''};
        ${blur ? 'filter: blur(2px);' : ''}
      }

      @keyframes reveal-dark${blur ? '-blur' : ''} {
        from {
          clip-path: circle(0% at 50% 50%);
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: circle(120% at 50% 50%);
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }

      @keyframes reveal-light${blur ? '-blur' : ''} {
        from {
          clip-path: circle(0% at 50% 50%);
          ${blur ? 'filter: blur(8px);' : ''}
        }
        ${blur ? '50% { filter: blur(4px); }' : ''}
        to {
          clip-path: circle(120% at 50% 50%);
          ${blur ? 'filter: blur(0px);' : ''}
        }
      }
      `,
    };
  }

  // Circle variants with custom click origin or corner position
  const getClipPathPosition = () => {
    if (customOrigin) {
      return `${customOrigin.x}px ${customOrigin.y}px`;
    }
    switch (start) {
      case 'top-left':
        return '48px 48px';
      case 'top-right':
        return 'calc(100% - 48px) 48px';
      case 'bottom-left':
        return '48px calc(100% - 48px)';
      case 'bottom-right':
        return 'calc(100% - 48px) calc(100% - 48px)';
      case 'top-center':
        return '50% 48px';
      case 'bottom-center':
        return '50% calc(100% - 48px)';
      default:
        return '50% 50%';
    }
  };

  const clipPosition = getClipPathPosition();

  return {
    name: `${variant}-${start}${blur ? '-blur' : ''}`,
    css: `
    ::view-transition-group(root) {
      animation-duration: 0.8s;
      animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    }

    ::view-transition-old(root),
    ::view-transition-new(root) {
      mix-blend-mode: normal;
    }
          
    ::view-transition-new(root) {
      animation-name: reveal-light-${start}${blur ? '-blur' : ''};
      ${blur ? 'filter: blur(2px);' : ''}
    }

    ::view-transition-old(root),
    .dark::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }
    .dark::view-transition-new(root) {
      animation-name: reveal-dark-${start}${blur ? '-blur' : ''};
      ${blur ? 'filter: blur(2px);' : ''}
    }

    @keyframes reveal-dark-${start}${blur ? '-blur' : ''} {
      from {
        clip-path: circle(0% at ${clipPosition});
        ${blur ? 'filter: blur(8px);' : ''}
      }
      ${blur ? '50% { filter: blur(4px); }' : ''}
      to {
        clip-path: circle(150.0% at ${clipPosition});
        ${blur ? 'filter: blur(0px);' : ''}
      }
    }

    @keyframes reveal-light-${start}${blur ? '-blur' : ''} {
      from {
        clip-path: circle(0% at ${clipPosition});
        ${blur ? 'filter: blur(8px);' : ''}
      }
      ${blur ? '50% { filter: blur(4px); }' : ''}
      to {
        clip-path: circle(150.0% at ${clipPosition});
        ${blur ? 'filter: blur(0px);' : ''}
      }
    }
    `,
  };
};

const STYLE_ID = 'theme-transition-styles';

export const updateTransitionStyles = (css: string) => {
  if (typeof window === 'undefined') return;

  let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
};

export interface ThemeTransitionOptions {
  variant?: AnimationVariant;
  start?: AnimationStart;
  blur?: boolean;
  url?: string;
  gifUrl?: string;
  event?: React.MouseEvent | MouseEvent;
}

export function executeThemeTransition(
  switchThemeCallback: () => void,
  options?: ThemeTransitionOptions
) {
  if (typeof window === 'undefined') {
    switchThemeCallback();
    return;
  }

  const variant = options?.variant ?? 'gif';
  const start = options?.start ?? 'center';
  const blur = options?.blur ?? false;
  const url = options?.gifUrl || options?.url || '/transitions/default.gif';

  let customOrigin: { x: number; y: number } | undefined;
  if (options?.event) {
    if (options.event.clientX || options.event.clientY) {
      customOrigin = {
        x: options.event.clientX,
        y: options.event.clientY,
      };
    } else if (options.event.currentTarget instanceof HTMLElement) {
      const rect = options.event.currentTarget.getBoundingClientRect();
      customOrigin = {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      };
    }
  }

  const animation = createAnimation(variant, start, blur, url, customOrigin);
  updateTransitionStyles(animation.css);

  const doc = document as unknown as {
    startViewTransition?: (callback: () => void) => { finished: Promise<void> };
  };

  if (!doc.startViewTransition) {
    switchThemeCallback();
    return;
  }

  document.documentElement.classList.add('suppress-transitions');
  document.documentElement.classList.add('theme-transitioning');
  const transition = doc.startViewTransition(() => {
    switchThemeCallback();
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove('suppress-transitions');
    document.documentElement.classList.remove('theme-transitioning');
  });
}

