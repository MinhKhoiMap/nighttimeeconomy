import { useRef, useState, useEffect } from "react";
import { Player } from "@lordicon/react";

const LottieIcon = ({
  className = "lottie-icon",
  color = "#fff",
  size,
  iconType,
  isAnimateOnHover = false,
  isLoop = false,
  onComplete = () => {},
  onReady = () => {},
  style,
}) => {
  const playerRef = useRef();
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if ([1, -1].includes(direction)) playerRef.current?.play();
  }, [direction]);

  return (
    <span
      className={`${className} block`}
      style={style}
      onMouseEnter={() => isAnimateOnHover && setDirection(1)}
      onMouseLeave={() => isAnimateOnHover && setDirection(-1)}
    >
      <Player
        direction={direction}
        ref={playerRef}
        colorize={color}
        size={size}
        icon={iconType}
        onComplete={onComplete}
        onReady={onReady}
      />
    </span>
  );
};

export default LottieIcon;
