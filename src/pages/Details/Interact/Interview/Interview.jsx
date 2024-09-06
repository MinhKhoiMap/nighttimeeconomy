import { useCallback, useContext, useEffect, useRef, useState } from "react";
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
import { SourceID } from "../../../../constants";

const Interview = ({ site }) => {
  const { interviewPointData } = useContext(SiteDataContext);
  const { siteChosen } = useContext(SiteChosenContext);

  const { map } = useMap();

  const [imageGallery, setImageGallery] = useState(null);
  const [show, setShow] = useState(false);

  const savedHandleInterviewClickFunction = useRef();

  // useRef to save the last version so we can easily remove the last function
  const showInterviewGallery = useCallback(
    async (e) => {
      setShow(true);
      const siteID = siteChosen.properties.id;
      let id = e.features[0].properties.id;
      let galleryRef = getRef(`/nha_trang/media/${siteID}/interview/${id}`);
      let imgsRef = await listChilds(galleryRef);
      let gallery = [];
      for (let ref of imgsRef) {
        let url = await getDownloadUrl(ref);
        gallery.push(url);
      }
      setImageGallery(gallery);
    },
    [siteChosen]
  );

  useEffect(() => {
    // Use to remove the last function (on the previous render which had old value)
    if (savedHandleInterviewClickFunction.current)
      map.off(
        "click",
        "interview_point",
        savedHandleInterviewClickFunction.current
      );

    savedHandleInterviewClickFunction.current = showInterviewGallery;
    map.on("click", "interview_point", showInterviewGallery);
  }, [siteChosen]);

  // Loading image icon for location and set event listeners for click point
  useEffect(() => {
    map.loadImage(locate, (err, image) => {
      if (err) throw err;

      if (!map.hasImage("locate")) {
        map.addImage("locate", image);
      }
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
      <Source
        type="geojson"
        data={interviewPointData[site]}
        id={SourceID.interview}
      >
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

      {show && (
        <PhotoSlide
          gallery={imageGallery}
          onCloseHandler={() => {
            setImageGallery(null);
            setShow(false);
          }}
          isLoading={show}
          setIsLoading={setShow}
        />
      )}

      {!imageGallery && show && <loading />}
    </>
  );
};

export default Interview;
