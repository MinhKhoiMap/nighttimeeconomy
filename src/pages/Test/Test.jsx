import mapboxgl from "mapbox-gl";
import { Layer, Source, useMap } from "react-map-gl";
import { useCallback, useEffect, useState } from "react";
import * as turf from "@turf/turf";

import ImageSlider from "../../components/ImageSlider/ImageSlider";
import { buildinguseData } from "../../assets/data/buildinguse";
import { siteSelectionData } from "../../assets/data/site";
import roads from "../../assets/data/roads";

const CaseBuildinguseValues = [
  "Housing",
  "#FF9844",
  "Office",
  "#87A7FC",
  "Hotel",
  "#37B5B6",
  "Mixed-use",
  "#E6B9DE",
  "Administrative Buildings",
  "#92197F",
  "School/Institute",
  "#F6ECA9",
  "Tourist/Attraction Point",
  "#D71313",
];

const Test = () => {
  const { map } = useMap();

  const handleLoadSite = useCallback(() => {
    var bounds = new mapboxgl.LngLatBounds();

    // Loop through all areas and extend bounds box
    siteSelectionData.features.forEach((feature) => {
      feature.geometry.coordinates[0].forEach((coordinate) =>
        bounds.extend(coordinate)
      );
    });

    map.fitBounds(bounds, {
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
      duration: 3000,
    });
  }, [map]);

  useEffect(() => {
    handleLoadSite();
  }, [map]);

  let requestID,
    counter = 0;
  const steps = 300;

  const [roadState, setRoadState] = useState(null);
  const [arc, setArc] = useState(null);
  const [point, setPoint] = useState(null);

  function animateRoad() {
    if (counter < steps) {
      setPoint(turf.point(arc[counter]));
    } else {
      counter = 0;
      setPoint(turf.point(arc[counter]));
    }

    requestID = requestAnimationFrame(animateRoad);
    counter++;
  }

  // Calculate the trip of the point along the current road path
  function calcPointPart(index) {
    const lineDistance = turf.lineDistance(
      roads[0].features[index],
      "kilometers"
    );
    let part = [];
    for (let i = 0; i < lineDistance; i += lineDistance / steps) {
      const segment = turf.along(roads[0].features[index], i, "kilometers");
      part.push(segment.geometry.coordinates);
    }

    setArc(part);
  }

  function changeRoad(id) {
    setRoadState(roads[0].features[id]);
    calcPointPart(id);
  }

  useEffect(() => {
    changeRoad(0);
  }, [0]);

  useEffect(() => {
    roadState && arc && animateRoad();

    return () => cancelAnimationFrame(requestID);
  }, [roadState]);

  return (
    <>
      <Source type="geojson" data={buildinguseData[0]}>
        <Layer
          id="buildinguse_selection"
          type="fill"
          paint={{
            "fill-color": [
              "match",
              ["get", "Buildsused"],
              ...CaseBuildinguseValues,
              // Other Values
              "rgba(255, 196, 54, 0.3)",
            ],
          }}
        />
      </Source>
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

export default Test;
