import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { initialViewState } from "../../contexts/initialViewContext";
import { useMap } from "react-map-gl";
import * as turf from "@turf/turf";

import "./HomePage.css";
import logo from "../../assets/images/logo.svg";

const HomePage = () => {
  const initialView = useContext(initialViewState);

  // get map instance
  const { map } = useMap();

  useEffect(() => {
    // random a start point when redirecting or directing to home page 
    if (map) {
      let center = turf.randomPoint(1, { bbox: [-180, -90, 180, 90] });

      // move to the center point
      map.flyTo({
        center: center.features[0].geometry.coordinates,
        zoom: initialView.zoom,
      });
    }
  }, []);

  return (
    <>
      <div className="absolute top-9 left-10 xl:w-[40%] w-1/4">
        <h1 className="project-name text-white uppercase font-[Belleza]">
          Night Time Economy
        </h1>
        <p className=" text-white text-justify mr-6 break-words mt-6">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odit omnis
          provident reiciendis eius debitis, assumenda officiis iusto
          recusandae. Quo itaque iure sunt magni quam expedita ratione
          exercitationem aspernatur veritatis doloribus.
        </p>
      </div>
      <Link
        to="/nha_trang"
        id="fly"
        className="absolute bottom-[50px] left-1/2 -translate-x-1/2 border border-white"
      >
        <span>Start</span>
      </Link>
      <div className="logo__container fixed bottom-11 left-3">
        <img src={logo} />
      </div>
    </>
  );
};

export default HomePage;
