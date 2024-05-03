import { useEffect, useRef, useState } from "react";
import { Player } from "@lordicon/react";

import close from "../../assets/images/close_icon.json";
import arrow_down from "../../assets/images/arrow_down.json";

const ImageSlider = ({ imgArr, setIsShow }) => {
  const [imagePosition, setImagePosition] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHover, setIsHover] = useState(false);

  const close_btn = useRef(null);
  const prev_btn = useRef(null);
  const next_btn = useRef(null);

  useEffect(() => {
    if ([1, -1].includes(direction)) close_btn.current?.play();
  }, [direction]);

  useEffect(() => {
    if (prev_btn.current && next_btn.current) {
      prev_btn.current.onmouseover = () => prev_btn.current.play();
      next_btn.current.onmouseover = () => next_btn.current.play();
    }
    if (prev_btn.current) {
      prev_btn.current.onmouseover = () => alert("hofkljasdf");
    }
  }, [prev_btn.current, next_btn.current]);

  return (
    <div className="relative w-full h-full">
      <figure className="w-full h-full relative flex justify-center items-center overflow-hidden">
        {imgArr.map((img, index) => (
          <img
            key={index}
            className={`w-fit max-w-full h-fit max-h-full object-contain rounded-[10px] absolute transition-all ease-in-out duration-200 ${
              index === imagePosition
                ? "z-30 opacity-100"
                : "z-0 opacity-0 blur-sm"
            }`}
            src={img}
          />
        ))}
      </figure>

      <button
        className="absolute z-[999] left-[6%] top-1/2 -translate-y-1/2 flex justify-center items-center w-10 h-10 
                          rounded-full bg-black/15 hover:bg-black/80 transition-all rotate-90"
        onClick={() =>
          setImagePosition((prev) => (prev < 1 ? imgArr.length - 1 : prev - 1))
        }
        onMouseOver={() => {
          next_btn.current.play();
          setIsHover(true);
        }}
        onMouseLeave={() => setIsHover(false)}
      >
        <Player
          colorize="#fff"
          ref={next_btn}
          icon={arrow_down}
          direction={direction}
        />
      </button>
      <button
        className="absolute z-[999] right-[6%] top-1/2 -translate-y-1/2 flex justify-center items-center w-10 h-10 
                          rounded-full bg-black/15 hover:bg-black/80 transition-all -rotate-90"
        onClick={() =>
          setImagePosition((prev) =>
            prev === imgArr.length - 1 ? 0 : prev + 1
          )
        }
        onMouseOver={() => {
          prev_btn.current.play();
          setIsHover(true);
        }}
        onMouseLeave={() => setIsHover(false)}
      >
        <Player
          colorize="#fff"
          ref={prev_btn}
          icon={arrow_down}
          onComplete={() => isHover && prev_btn.current.playFromBeginning()}
          direction={direction}
        />
      </button>

      <div className="absolute z-[9999] flex gap-4 bottom-4 left-1/2 -translate-x-1/2">
        {imgArr.map((_, index) => (
          <div
            key={index}
            className={`rounded-full w-4 h-4 transition-all duration-200 cursor-pointer ${
              index === imagePosition ? "bg-white scale-125" : "bg-white/40"
            }`}
            onClick={() => setImagePosition(index)}
          ></div>
        ))}
      </div>

      <button
        className="absolute z-[9999] top-0 right-0"
        onMouseEnter={() => setDirection(1)}
        onMouseLeave={() => setDirection(-1)}
        onClick={() => setIsShow(false)}
      >
        <Player
          colorize="#fff"
          ref={close_btn}
          icon={close}
          direction={direction}
        />
      </button>
    </div>
  );
};

export default ImageSlider;
