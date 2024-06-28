import { useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";

import ImageSlider from "../../../components/ImageSlider/ImageSlider";
import LottieIcon from "../../../components/LottieIcon/LottieIcon";

// Assets
import "./Overview.css";
import zoom_icon from "../../../assets/images/zoom_icon.json";
import roads from "../../../assets/data/roads";
import { siteSelectionData } from "../../../assets/data/site";

// Utils
import { fitAreaUtls } from "../../../utils/fitAreaUtls";

const imgUrl = [];
const videoUrl = [];

const Overview = ({ areaName, siteIndex }) => {
  const imageGalleryRef = useRef();

  const { map } = useMap();

  const [isShowSlider, setIsShowSlider] = useState(false);
  const [roadState, setRoadState] = useState(null);
  const [arc, setArc] = useState(null);
  const [point, setPoint] = useState(null);

  let requestID,
    counter = 0;
  const steps = 300;

  // Handling the point animation, when the point move to the end of the road, change to next road
  function animateRoad() {
    if (!(counter < steps)) {
      counter = 0;
    }

    setPoint(turf.point(arc[counter]));
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
    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      const segment = turf.along(
        roads[siteIndex].features[index],
        i,
        "kilometers"
      );
      part.push(segment.geometry.coordinates);
    }

    setArc(part);
  }

  function changeRoad(id) {
    setRoadState(roads[siteIndex].features[id]);
    calcPointPart(id);
  }

  const fitArea = () => {
    fitAreaUtls(siteSelectionData.features[siteIndex].geometry, map, {
      padding: { top: 60, bottom: 60, left: 800, right: 50 },
      duration: 400,
    });
  };

  useEffect(() => {
    changeRoad(0);
    fitArea();
  }, [siteIndex]);

  useEffect(() => {
    roadState && arc && animateRoad();

    return () => cancelAnimationFrame(requestID);
  }, [roadState]);

  return (
    <>
      <div
        className="overview__container fixed top-0 left-0 bottom-0 text-white w-[720px] px-6 pt-3 bg-[#242526] 
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
              <video
                className="w-full"
                src={videoUrl[siteIndex % 2]}
                loop
                muted
                autoPlay={"autoplay"}
                preload="auto"
                controls
              />
            </div>
          </div>
          <figure ref={imageGalleryRef} className="w-full flex flex-col gap-5">
            {imgUrl.map((img, index) => (
              <div key={index} className="relative">
                <img src={img} className="w-full h-full object-contain" />
                <button
                  className="text-[#1b3c73] absolute right-4 bottom-4 z-50 rounded-lg transition-colors
                flex items-center text-[15px]"
                  onClick={() => setIsShowSlider(true)}
                >
                  <span className="icon-label bg-white">See detail</span>
                  <LottieIcon
                    iconType={zoom_icon}
                    size={20}
                    color="#1b3c73"
                    isAnimateOnHover={true}
                    style={{
                      padding: "4px 8px",
                    }}
                  />
                </button>
              </div>
            ))}
          </figure>
        </div>
      </div>
      {isShowSlider && (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-black/95 p-6">
          <ImageSlider imgArr={imgUrl} setIsShow={setIsShowSlider} />
        </div>
      )}

      {roadState && (
        <>
          {/* Drawing background road path */}
          <Source data={roadState} type="geojson">
            <Layer
              type="line"
              paint={{
                "line-color": "white",
                "line-width": 6,
                "line-opacity": 0.4,
              }}
              layout={{ "line-join": "bevel" }}
            />
          </Source>

          {/* Drawing the point */}
          {point && (
            <Source data={point} type="geojson">
              <Layer
                type="circle"
                paint={{
                  "circle-opacity": 1,
                  "circle-color": "white",
                  "circle-pitch-scale": "map",
                }}
              />
            </Source>
          )}
        </>
      )}
    </>
  );
};

export default Overview;
