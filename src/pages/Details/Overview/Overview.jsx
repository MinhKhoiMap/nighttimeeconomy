import { useContext, useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";

// Assets
import "./Overview.css";
import roads from "../../../assets/data/roads";
import { SiteDataContext } from "../../SiteSelection/SiteSelection";

// Utils, Services
import { fitAreaUtls } from "../../../utils/fitAreaUtls";
import {
  listChilds,
  getRef,
  getDownloadUrl,
  getMeta,
} from "../../../services/firebaseStorage";
import PhotoViewer from "../../../components/PhotoViewer/PhotoViewer";
import SkeletonLoading from "../../../components/SkeletonLoading/SkeletonLoading";

const Overview = ({ areaName, siteIndex }) => {
  const { siteSelectionData } = useContext(SiteDataContext);

  const { map } = useMap();

  const [roadState, setRoadState] = useState(null);
  const [arc, setArc] = useState(null);
  const [roadIndex, setRoadIndex] = useState(0);
  const [point, setPoint] = useState(null);
  const [imgUrls, setImgUrls] = useState([]);
  const [intro, setIntro] = useState(null);

  let requestID,
    counter = 0,
    arrayOfCounter = [];

  const distance = 10; // meter unit

  // Handling the point animation, when the point move to the end of the road, change to next road
  function animateRoad() {
    if (!(counter < arc.length)) {
      counter = 0;
      if (roadIndex + 1 < roads[siteIndex].features.length) {
        setRoadIndex((prev) => prev + 1);
        changeRoad(roadIndex + 1);
      } else {
        setRoadIndex(0);
        changeRoad(0);
      }
      cancelAnimationFrame(requestID);
    } else {
      try {
        let id = uuidv4();
        map.getMap().addSource(`effect-${id}`, {
          type: "geojson",
          data: turf.point(arc[counter == 0 ? 0 : counter - 1]),
        });
        map.getMap().addLayer(
          {
            id: `effect-${id}`,
            source: `effect-${id}`,
            type: "circle",
            paint: {
              "circle-radius": 3,
              "circle-opacity": 1,
              "circle-color": "pink",
            },
          },
          "point-effect"
        );
        arrayOfCounter.push(id);
        setTimeout(() => {
          let shift = arrayOfCounter.shift();
          map.getMap().removeLayer(`effect-${shift}`);
          map.getMap().removeSource(`effect-${shift}`);
        }, 400);
        setPoint(turf.point(arc[counter]));
      } catch (error) {
        console.log(error, "Error at Overview animate Road");
        setRoadIndex(0);
        changeRoad(0);
        counter = 0;
        cancelAnimationFrame(requestID);
      }
    }

    requestID = requestAnimationFrame(animateRoad);
    counter++;
  }

  // Calculate the trip of the point along the current road path
  function calcPointPart(index) {
    const lineDistance = turf.lineDistance(
      roads[siteIndex].features[index],
      "kilometers"
    );
    let part = [];
    for (let i = 0; i < lineDistance * 1000; i += distance) {
      const segment = turf.along(
        roads[siteIndex].features[index],
        i / 1000,
        "kilometers"
      );
      part.push(segment.geometry.coordinates);
    }
    setArc(part);
    setPoint(turf.point(part[0]));
  }

  function changeRoad(id) {
    calcPointPart(id);
    setRoadState(roads[siteIndex].features[id]);
  }

  const fitArea = () => {
    fitAreaUtls(siteSelectionData.features[siteIndex].geometry, map, {
      padding: { top: 60, bottom: 60, left: 800, right: 50 },
      duration: 400,
    });
  };

  async function loadMedia() {
    try {
      const overviewRef = getRef(
        `nha_trang/media/site${Number(siteIndex) + 1}/overview`
      );
      const filesRef = await listChilds(overviewRef);
      let imgs = [];
      for (let ref of filesRef) {
        let url = await getDownloadUrl(ref);
        let meta = await getMeta(ref);
        if (meta.contentType.includes("video")) {
          setIntro(url);
        } else {
          imgs.push(url);
          setImgUrls(imgs);
        }
      }
    } catch (err) {
      console.log(err, "Overview error");
    }
  }

  useEffect(() => {
    setImgUrls(null);
    setIntro(null);
    changeRoad(0);
    fitArea();

    loadMedia();
  }, [siteIndex]);

  useEffect(() => {
    roadState && arc && animateRoad();

    return () => {
      cancelAnimationFrame(requestID);
    };
  }, [roadState]);

  return (
    <>
      <div
        className="overview__container fixed top-0 left-0 bottom-0 text-white w-[47%] px-6 pt-3 bg-[#242526] 
                  pb-11 overflow-auto shadow-xl shadow-white/20"
      >
        <div className="w-full">
          <div className="flex flex-col mb-3">
            <div className="flex-2">
              <h2 className="text-3xl font-bold capitalize mb-4">{areaName}</h2>
              <p className="text-justify text-lg">
                Short description: Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Phasellus scelerisque sapien at diam
                condimentum, ut commodo nisi pharetra. Phasellus eget laoreet
                enim. Cras lacinia, ipsum vitae posuere tincidunt, metus lorem
                viverra elit, vel elit lorem id libero.
              </p>
            </div>
            <div className="mt-2 flex-1">
              {intro ? (
                <video
                  className="w-full"
                  src={intro}
                  loop
                  muted
                  autoPlay={"autoplay"}
                  preload="auto"
                  controls
                />
              ) : (
                <SkeletonLoading type="video" />
              )}
            </div>
          </div>
          <figure className="w-full flex flex-col gap-5">
            {imgUrls ? (
              <PhotoViewer gallery={imgUrls} />
            ) : (
              <SkeletonLoading type="image" />
            )}
          </figure>
        </div>
      </div>

      {/* Drawing the point */}
      {point && (
        <Source data={point} type="geojson">
          <Layer
            id="point-effect"
            type="circle"
            paint={{
              "circle-opacity": 1,
              "circle-color": "white",
            }}
          />
        </Source>
      )}
    </>
  );
};

export default Overview;
