import { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import { PhotoProvider, PhotoView } from "react-photo-view";

// CSS
import "react-photo-view/dist/react-photo-view.css";

// Data
import { interviewPointData } from "../../../../assets/data/interview";

import locate from "../../../../assets/images/locate.png";
import ImageSlider from "../../../../components/ImageSlider/ImageSlider";

const Interview = ({ site }) => {
  const { map } = useMap();

  const [imageGallery, setImageGallery] = useState(null);

  // Loading image icon for location
  useEffect(() => {
    map.loadImage(locate, (err, image) => {
      if (err) throw err;

      if (!map.hasImage("locate")) {
        map.addImage("locate", image);
      }
    });

    map.on("click", "interview_point", (e) => {
      console.log(e.features);
      setImageGallery(JSON.parse(e.features[0].properties["Gallery"]));
    });

    map.on("mouseover", "interview_point", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "interview_point", () => {
      map.getCanvas().style.cursor = "grab";
    });
  }, []);

  return (
    <>
      <Source type="geojson" data={interviewPointData[site]}>
        <Layer
          id="interview_point"
          type="symbol"
          layout={{
            "icon-image": "locate",
            "icon-size": 0.06,
          }}
          paint={{
            "icon-color": "black",
          }}
        />
      </Source>

      {imageGallery && (
        <div
          className="fixed z-[9999] top-0 bottom-0 left-0 right-0 bg-black/95"
          onClick={() => setImageGallery(null)}
        >
          <div
            className="absolute w-[90%] h-[90%] top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageSlider imgArr={imageGallery} setIsShow={setImageGallery} />
          </div>
        </div>
      )}
    </>
  );
};

export default Interview;
