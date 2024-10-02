import mapboxgl from "mapbox-gl";
import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import {data} from "../../assets/data/data"
 
const Test = () => {
  
  useEffect(() => {
    let h = data.map((d) => {
      let c = d.features.map((a) => {
        a.properties.id = uuid();
        return a
      })
      
      return c
    })
    console.log(h)
  }, [])
  
  return (
    <div className="z-[99999] h-fit overflow-auto fixed top-0 bottom-0 left-0 right-0">
    </div>
  );
};

export default Test;
