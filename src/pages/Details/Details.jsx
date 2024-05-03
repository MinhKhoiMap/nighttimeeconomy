import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useMap } from "react-map-gl";
import $ from "jquery";

// Utils
import { fitAreaUtls } from "../../utils/fitAreaUtls";

// Assets
import "./Details.css";
import { siteSelectionData } from "../../assets/data/site";
import Interact from "./Interact/Interact";
import Project from "./Project/Project";
import Overview from "./Overview/Overview";

const viewModeArr = ["Overview", "Projecct", "Interact"];

const Details = () => {
  let { site } = useParams();
  const navbarRef = useRef();
  const { map } = useMap();

  const navigator = useNavigate();

  const [siteIndex, setSiteIndex] = useState(null);
  const [viewMode, setViewMode] = useState(viewModeArr[2]);
  const [areaName, setAreaName] = useState("");

  // Handle Fitbounds
  const fitArea = () => {
    if (siteIndex) {
      if (viewMode !== viewModeArr[0])
        fitAreaUtls(siteSelectionData.features[siteIndex]?.geometry, map);
      else
        fitAreaUtls(siteSelectionData.features[siteIndex].geometry, map, {
          padding: { top: 60, bottom: 60, left: 900, right: 10 },
        });
    }
  };

  // Change Chosen Site State
  useEffect(() => {
    setSiteIndex(site);
    setAreaName(`area ${new Number(site) + 1}`);
  });

  // Handle Fit Bounds When Change Site State
  useEffect(() => {
    fitArea();
  }, [siteIndex, viewMode]);

  // handle Top Navbar
  useEffect(() => {
    function handleShowNavbar(e) {
      if (
        (navbarRef.current && e.clientY <= 40) ||
        $(e.target).parents(".details__navbar").length ||
        $(e.target).hasClass("details__navbar")
      ) {
        navbarRef.current.classList.add("details__navbar--show");
      } else {
        navbarRef.current.classList.remove("details__navbar--show");
      }
    }

    let timer = setTimeout(() => {
      document.addEventListener("mousemove", handleShowNavbar);
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousemove", handleShowNavbar);
    };
  }, []);

  return (
    <>
      <div
        className="details__navbar details__navbar--show opacity-100"
        ref={navbarRef}
      >
        <div className="flex flex-col justify-center gap-1">
          <h3
            className="capitalize cursor-pointer"
            onClick={() => navigator("/")}
          >
            Night Time Economy
          </h3>
          <p className="cursor-pointer capitalize" onClick={fitArea}>
            {areaName}
          </p>
        </div>
        <div>
          <button
            className={`text-white text-center ${
              viewMode === viewModeArr[0] && "current-mode"
            }`}
            onClick={() => setViewMode(viewModeArr[0])}
          >
            Overview
          </button>
          <button
            disabled
            className={`text-white text-center ${
              viewMode === viewModeArr[1] && "current-mode"
            }`}
            onClick={() => setViewMode(viewModeArr[1])}
          >
            Project
          </button>
          <button
            className={`text-white text-center ${
              viewMode === viewModeArr[2] && "current-mode"
            }`}
            onClick={() => setViewMode(viewModeArr[2])}
          >
            Interact
          </button>
        </div>
      </div>

      {viewMode === viewModeArr[2] && <Interact siteIndex={siteIndex} />}
      {viewMode === viewModeArr[1] && <Project groupName={"group 1"} />}
      {viewMode === viewModeArr[0] && (
        <Overview areaName={areaName} siteIndex={siteIndex} />
      )}
    </>
  );
};

export default Details;
