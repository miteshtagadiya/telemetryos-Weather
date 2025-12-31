type WindIconProps = {
  size?: number;
  color?: string;
};

export const WindIcon: React.FC<WindIconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 8h18M3 12h18M3 16h12" />
    <path d="M15 19l3-3-3-3" />
  </svg>
);

