import { useEffect, useState } from "react";
import { PhotoSlider } from "react-photo-view";
import "./PhotoSlide.css";
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";
import imageNotFound from "../../assets/images/image-not-found-icon.svg";

function PhotoSlide({ gallery, onCloseHandler, isLoading, setIsLoading }) {
  const [show, setShow] = useState(true);

  return (
    <PhotoSlider
      className="z-[999999] photo_slider"
      images={
        gallery?.length > 0
          ? gallery.map((img) => ({ src: img, key: img }))
          : ["fasf"].map((img) => ({ src: img, key: img }))
      }
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
      loadingElement={() => {
        useEffect(() => {
          setIsLoading(true);

          return () => setIsLoading(false);
        }, []);

        return (
          <div className="min-w-[200px]">
            <SkeletonLoading type="image" />
          </div>
        );
      }}
      brokenElement={() => (
        <>
          {!gallery && (
            <div className="min-w-[200px]">
              <SkeletonLoading type="image" />
            </div>
          )}

          {gallery?.length > 0 && (
            <div className="min-w-[200px]">
              <img src={imageNotFound} alt="image not found" />
            </div>
          )}
        </>
      )}
    />
  );
}

export default PhotoSlide;
