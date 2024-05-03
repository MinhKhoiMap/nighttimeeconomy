import { useEffect, useRef, useState } from "react";
import { Player } from "@lordicon/react";
import $ from "jquery";
import { Layer, Source, useMap } from "react-map-gl";

import ImageSlider from "../../../components/ImageSlider/ImageSlider";
import LottieIcon from "../../../components/LottieIcon/LottieIcon";

// Assets
import "./Overview.css";
import group1 from "../../../assets/images/Team_5/group_photo/IMG_20230717_110239_291.jpg";
import img2 from "../../../assets/images/Team_5/group_photo/IMG_20230722_172101_262.jpg";
import zoom_icon from "../../../assets/images/zoom_icon.json";
import roads from "../../../assets/data/roads";

import video3 from "../../../assets/videos/GROUP3.mp4";
import video4 from "../../../assets/videos/GROUP4.mp4";

const imgUrl = [group1, img2, group1, group1, img2, group1, group1, group1];
const videoUrl = [video3, video4];

const Overview = ({ areaName, siteIndex }) => {
  let position = 0,
    lastScrollTop = 0;
  const imageGalleryRef = useRef();

  const { map } = useMap();

  const [isShowSlider, setIsShowSlider] = useState(false);
  const [roadState, setRoadState] = useState(null);

  function handleScrollImage(e) {
    const startPoint = imageGalleryRef.current.offsetTop;

    // if (
    //   e.target.scrollTop >= startPoint &&
    //   e.target.scrollTop >= lastScrollTop
    // ) {
    //   console.log(position, e.target.scrollTop);
    //   e.target.scroll(0, 440 * position);
    //   position++;
    // } else if (e.target.scrollTop < lastScrollTop) {
    // }

    lastScrollTop = e.target.scrollTop;
  }

  const dashArraySequence = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5],
  ];

  let step = 0,
    requestID;

  function animateRoad(timestamp) {
    const newStep = parseInt((timestamp / 70) % dashArraySequence.length);

    if (newStep !== step) {
      map
        .getMap()
        .setPaintProperty(
          "road_dashed",
          "line-dasharray",
          dashArraySequence[step]
        );
      step = newStep;
    }

    requestID = requestAnimationFrame(animateRoad);
  }

  useEffect(() => {
    let index = 0;

    function changeRoad(id) {
      if (id >= roads[siteIndex].features.length) {
        index = 0;
        setRoadState(roads[siteIndex].features[0]);
      } else {
        setRoadState(roads[siteIndex].features[id]);
      }
    }

    changeRoad(index++);

    const timer = setInterval(() => {
      changeRoad(index++);
    }, 2500);

    return () => clearInterval(timer);
  }, [siteIndex]);

  useEffect(() => {
    roadState && animateRoad(0);

    return () => cancelAnimationFrame(requestID);
  }, [roadState]);

  return (
    <>
      <div
        className="overview__container fixed top-1/2 -translate-y-1/2 left-[109px] text-white w-[720px] h-[500px] px-6 py-3 bg-white/30 
      rounded-[10px] pb-3 overflow-auto"
      >
        <div className="w-full" onScroll={handleScrollImage}>
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
                src={videoUrl[siteIndex % 2]}
                loop
                muted
                autoPlay={"autoplay"}
                preload="auto"
                controls
              />
            </div>
          </div>
          <figure
            ref={imageGalleryRef}
            className="w-full flex flex-col gap-5"
            onScroll={handleScrollImage}
          >
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
        <Source data={roadState} type="geojson">
          <Layer
            type="line"
            paint={{
              "line-color": "yellow",
              "line-width": 4,
              "line-opacity": 0.4,
            }}
            layout={{ "line-join": "bevel" }}
          />
          <Layer
            id="road_dashed"
            type="line"
            paint={{
              "line-color": "yellow",
              "line-width": 3,
              "line-dasharray": [0, 4, 3],
            }}
            layout={{ "line-join": "bevel" }}
          />
        </Source>
      )}
    </>
  );
};

export default Overview;
