import { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import { PhotoProvider, PhotoView } from "react-photo-view";

// CSS
import "react-photo-view/dist/react-photo-view.css";

// Data
import { interviewPointData } from "../../../../assets/data/interview";

import locate from "../../../../assets/images/locate.png";
import PhotoSlide from "../../../../components/PhotoSlide/PhotoSlide";

const Interview = ({ site }) => {
  const { map } = useMap();

  const [imageGallery, setImageGallery] = useState(null);

  // Loading image icon for location and set event listeners for click point
  useEffect(() => {
    map.loadImage(locate, (err, image) => {
      if (err) throw err;

      if (!map.hasImage("locate")) {
        map.addImage("locate", image);
      }
    });

    map.on("click", "interview_point", (e) => {
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
        <PhotoSlide
          gallery={imageGallery}
          onCloseHandler={() => setImageGallery(null)}
        />
      )}
    </>
  );
};

export default Interview;
