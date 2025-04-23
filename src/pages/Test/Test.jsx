import mapboxgl from "mapbox-gl";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { data } from "../../assets/data/data";
import * as turf from "@turf/turf";

const Test = () => {
  // useEffect(() => {
  //   const polygon = {
  //     type: "Feature",
  //     geometry: {
  //       type: "Polygon",
  //       coordinates: [
  //         [
  //           [109.1961613, 12.2650145],
  //           [109.1996633, 12.2651487],
  //           [109.2010036, 12.2662638],
  //           [109.204233, 12.2667294],
  //           [109.2054467, 12.2681173],
  //           [109.2056762, 12.2691348],
  //           [109.2052313, 12.2699053],
  //           [109.2061763, 12.2702589],
  //           [109.2073438, 12.2678265],
  //           [109.1993389, 12.2633424],
  //           [109.1987853, 12.2638986],
  //           [109.1968662, 12.2640323],
  //           [109.1960614, 12.2644177],
  //           [109.1961613, 12.2650145]
  //         ]
  //       ],
  //     },
  //   };

  //   function getRandomSample(array, n) {
  //     const result = [];
  //     const taken = new Set();
  //     while (result.length < n && taken.size < array.length) {
  //       const idx = Math.floor(Math.random() * array.length);
  //       if (!taken.has(idx)) {
  //         result.push(array[idx]);
  //         taken.add(idx);
  //       }
  //     }
  //     return result;
  //   }

  //   function generateEvenlyDistributedRandomPoints(
  //     polygon,
  //     count,
  //     cellSize = 3
  //   ) {
  //     // 1. Generate a grid
  //     const bbox = turf.bbox(polygon);
  //     const grid = turf.pointGrid(bbox, cellSize, { units: "meters" });

  //     // 2. Filter points inside the polygon
  //     const insidePoints = grid.features.filter((pt) =>
  //       turf.booleanPointInPolygon(pt, polygon)
  //     );

  //     // 3. Randomly pick 'count' points from the inside ones
  //     const sampled = getRandomSample(insidePoints, count);

  //     return turf.featureCollection(sampled);
  //   }

  //   // Example usage
  //   const numPoints = Math.floor(Math.random() * 51) + 50; // between 50 and 100
  //   const evenlyDistributedPoints = generateEvenlyDistributedRandomPoints(
  //     polygon,
  //     numPoints
  //   );

  //   console.log(JSON.stringify(evenlyDistributedPoints, null, 2));
  // }, []);

  return (
    <div className="z-[99999] h-fit overflow-auto fixed top-0 bottom-0 left-0 right-0"></div>
  );
};

export default Test;
