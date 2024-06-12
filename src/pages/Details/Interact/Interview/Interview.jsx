import { useEffect, useState } from "react";
import { Layer, Marker, Source, useMap } from "react-map-gl";

// Data
import { interviewPointData } from "../../../../assets/data/interview";
import { interviewGallery } from "../../../../assets/data/interviewImage";

import locate from "../../../../assets/images/locate.png";
import ImageSlider from "../../../../components/ImageSlider/ImageSlider";

const Interview = ({ site }) => {
  const { map } = useMap();

  const [showImageGallery, setShowImageGallery] = useState(false);

  // Loading image icon for location
  useEffect(() => {
    map.loadImage(locate, (err, image) => {
      if (err) throw err;

      if (!map.hasImage("locate")) {
        map.addImage("locate", image);
      }
    });

    map.on("click", "interview_point", (e) => {
      setShowImageGallery(true);
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
            // "icon-allow-overlap": true,
            "icon-opacity": 0.5,
          }}
          paint={{
            "icon-color": "black",
          }}
        />
      </Source>

      {showImageGallery && (
        <div
          className="fixed z-[9999] top-0 bottom-0 left-0 right-0 bg-black/95"
          onClick={() => setShowImageGallery(false)}
        >
          <div
            className="absolute w-[90%] h-[90%] top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageSlider
              imgArr={interviewGallery[0]}
              setIsShow={setShowImageGallery}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Interview;
