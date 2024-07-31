import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import "./PhotoViewer.css";

// Components
import LottieIcon from "../LottieIcon/LottieIcon";
import zoom_icon from "../../assets/images/zoom_icon.json";

function PhotoViewer({ gallery = [] }) {
  return (
    <PhotoProvider
      className="z-[9999999]"
      maskOpacity={0.8}
      onVisibleChange={(visible, index, state) => {
        state.visible = true;
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
    >
      {gallery.map((img) => (
        <PhotoView src={img} key={img}>
          <div className="relative photo-view">
            <img
              src={img}
              loading="lazy"
              className="hover:cursor-pointer w-full max-h-[500px] object-contain object-center"
            />
            <div
              className="absolute right-0 bottom-0 top-0 left-0 z-50 bg-black/50 transition-all
                                  flex justify-center items-center text-[15px] hover:cursor-pointer"
            >
              <LottieIcon
                iconType={zoom_icon}
                size={60}
                color="#ccc"
                isAnimateOnHover={true}
                style={{
                  width: "100%",
                  height: "100%",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </div>
          </div>
        </PhotoView>
      ))}
    </PhotoProvider>
  );
}

export default PhotoViewer;
