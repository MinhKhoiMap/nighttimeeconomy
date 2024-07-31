import { useContext, useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";

// CSS
import "react-photo-view/dist/react-photo-view.css";

// Data
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../../SiteSelection/SiteSelection";

import locate from "../../../../assets/images/locate.png";
import PhotoSlide from "../../../../components/PhotoSlide/PhotoSlide";
import {
  getDownloadUrl,
  getRef,
  listChilds,
} from "../../../../services/firebaseStorage";

const Interview = ({ site }) => {
  const { interviewPointData } = useContext(SiteDataContext);
  const { siteChosen } = useContext(SiteChosenContext);

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

    map.on("click", "interview_point", async (e) => {
      // setImageGallery(JSON.parse(e.features[0].properties["Gallery"]));
      let id = e.features[0].properties.id;
      let galleryRef = getRef(
        `/nha_trang/media/${siteChosen.properties.id}/interview/${id}`
      );
      let imgsRef = await listChilds(galleryRef);
      let gallery = [];
      for (let ref of imgsRef) {
        let url = await getDownloadUrl(ref);
        gallery.push(url);
      }
      setImageGallery(gallery);
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
