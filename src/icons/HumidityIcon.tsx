type HumidityIconProps = {
  size?: number;
  color?: string;
};

export const HumidityIcon: React.FC<HumidityIconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2.5C8.5 2.5 6 5 6 8.5c0 3.5 6 9.5 6 9.5s6-6 6-9.5c0-3.5-2.5-6-6-6z" />
  </svg>
);

