import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const createIcon = (paths: ReactNode[]) => {
  const Icon = (props: IconProps) => (
    <svg {...baseProps} {...props}>
      {paths}
    </svg>
  );
  Icon.displayName = 'Icon';
  return Icon;
};

export const Heart = createIcon([
  <path
    key="path"
    d="M20.84 4.61a4.5 4.5 0 0 0-6.36 0L12 7.09l-2.48-2.48a4.5 4.5 0 0 0-6.36 6.36L12 21l8.84-8.03a4.5 4.5 0 0 0 0-6.36Z"
  />,
]);

export const TrendingUp = createIcon([
  <polyline key="1" points="3 17 9 11 13 15 21 7" />,
  <polyline key="2" points="14 7 21 7 21 14" />,
]);

export const MessageSquare = createIcon([
  <path
    key="1"
    d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z"
  />,
]);

export const Zap = createIcon([
  <polygon key="1" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
]);

export const Upload = createIcon([
  <path key="1" d="M12 3v12" />,
  <path key="2" d="M16 7l-4-4-4 4" />,
  <path key="3" d="M4 21h16" />,
]);

export const Send = createIcon([
  <path key="1" d="M22 2 11 13" />,
  <path key="2" d="M22 2 15 22 11 13 2 9 22 2" />,
]);

export const AlertCircle = createIcon([
  <circle key="1" cx="12" cy="12" r="9" />,
  <path key="2" d="M12 8v4" />,
  <path key="3" d="M12 16h.01" />,
]);

export const Brain = createIcon([
  <path
    key="1"
    d="M15.5 4.5a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1-2.5 2.5H17v2.25a2.75 2.75 0 1 1-5.5 0V5.75A3.75 3.75 0 0 0 7.75 2 3.75 3.75 0 0 0 4 5.75v6.5A3.75 3.75 0 0 0 7.75 16H9v1.75a2.25 2.25 0 1 0 4.5 0V7.5h2"
  />,
]);

export const Lock = createIcon([
  <rect key="1" x="5" y="11" width="14" height="10" rx="2" />,
  <path key="2" d="M7 11V7a5 5 0 0 1 10 0v4" />,
]);

export const BarChart3 = createIcon([
  <line key="1" x1="3" x2="3" y1="3" y2="21" />,
  <rect key="2" x="7" y="9" width="4" height="9" rx="1" />,
  <rect key="3" x="13" y="5" width="4" height="13" rx="1" />,
  <rect key="4" x="19" y="12" width="4" height="6" rx="1" />,
]);

export const CheckCircle = createIcon([
  <path key="1" d="m9 12 2 2 4-4" />,
  <circle key="2" cx="12" cy="12" r="9" />,
]);

export const Users = createIcon([
  <path key="1" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />,
  <circle key="2" cx="9" cy="7" r="4" />,
  <path key="3" d="M22 21v-2a4 4 0 0 0-3-3.87" />,
  <path key="4" d="M16 3.13a4 4 0 0 1 0 7.75" />,
]);
