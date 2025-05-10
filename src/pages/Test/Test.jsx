import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import * as turf from "@turf/turf";

const Test = () => {
  useEffect(() => {
    // const newBuildinguse = buildinguse.features.map((feature) => {
    //   const id = uuid();
    //   feature.properties.id = id;
    //   console.log(feature);
    //   return feature;
    // });
    // console.log(newBuildinguse);
  }, []);

  return (
    <div className="z-[99999] h-fit overflow-auto fixed top-0 bottom-0 left-0 right-0"></div>
  );
};

export default Test;
