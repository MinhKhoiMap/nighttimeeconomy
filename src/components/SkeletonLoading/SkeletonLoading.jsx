import "./SkeletonLoading.css";

import ImageSkeleton from "./ImageSkeleton";
import VideoSkeleton from "./VideoSkeleton";

function SkeletonLoading({ type = "image" }) {
  return (
    <div className="w-full h-full">
      {Array(1)
        .fill(0)
        .map(() => {
          let element;
          let t = type.toLowerCase().trim();
          switch (t) {
            case "image":
              element = <ImageSkeleton key={t} />;
              break;
            case "video":
              element = <VideoSkeleton key={t} />;
              break;
            default:
              throw new Error("Invalid type");
          }

          return element;
        })}
    </div>
  );
}

export default SkeletonLoading;
