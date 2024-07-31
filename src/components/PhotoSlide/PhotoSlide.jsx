import React, { useState } from "react";
import { PhotoSlider } from "react-photo-view";
import "./PhotoSlide.css";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";

function PhotoSlide({ gallery = [], onCloseHandler }) {
  const [show, setShow] = useState(true);

  return (
    <PhotoSlider
      className="z-[999999] photo_slider"
      images={gallery.map((img) => ({ src: img, key: img }))}
      visible={show}
      onClose={() => {
        setShow(false);
      }}
      toolbarRender={({ onScale, scale, onRotate, rotate }) => {
        return (
          <span className="flex gap-4 pr-6 items-center">
            <i
              className="ti-zoom-in text-lg hover:cursor-pointer hover:opacity-70 transition-opacity duration-150"
              onClick={() => onScale(scale + 1)}
            />
            <i
              className="ti-zoom-out text-lg hover:cursor-pointer hover:opacity-70 transition-opacity duration-150"
              onClick={() => onScale(scale - 1)}
            />
            <i
              className="fa-solid fa-rotate-right text-lg font-[500] hover:cursor-pointer hover:opacity-70 transition-opacity duration-150"
              onClick={() => onRotate(rotate + 90)}
            ></i>
          </span>
        );
      }}
      maskOpacity={0.8}
      afterClose={() => onCloseHandler()}
      loadingElement={
        <div className="min-w-[200px]">
          <SkeletonLoading type="image" />
        </div>
      }
      brokenElement={
        <div className="min-w-[200px]">
          <SkeletonLoading type="video" />
        </div>
      }
    />
  );
}

export default PhotoSlide;
