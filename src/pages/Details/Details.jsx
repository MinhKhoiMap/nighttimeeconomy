import { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMap } from "react-map-gl";
import $ from "jquery";

// Utils
import { fitAreaUtls } from "../../utils/fitAreaUtls";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../SiteSelection/SiteSelection";

// Assets
import "./Details.css";
// import { siteSelectionData } from "../../assets/data/site";
import Interact from "./Interact/Interact";
import Project from "./Project/Project";
import Overview from "./Overview/Overview";

const viewModeArr = ["Overview", "Project", "Interact"];

const Details = () => {
  const { siteChosen, setSiteChosen } = useContext(SiteChosenContext);
  const { siteSelectionData } = useContext(SiteDataContext);

  // get site selected index from params in url
  let { site } = useParams();
  const navbarRef = useRef();
  const { map } = useMap();

  const navigator = useNavigate();

  const [siteIndex, setSiteIndex] = useState(null);
  // Set default mode is "interact"
  const [viewMode, setViewMode] = useState(viewModeArr[0]);
  const [areaName, setAreaName] = useState("");

  function findSiteIndex(siteId) {
    for (var i = 0; i < siteSelectionData.features.length; i++) {
      if (siteSelectionData.features[i].properties.id === siteId) {
        return i.toString();
      }
    }
  }

  // Change Selected Site State
  useEffect(() => {
    let idChosen = findSiteIndex(site);
    setSiteIndex(`${idChosen}`);
    if (!siteChosen) {
      setSiteChosen(siteSelectionData.features[idChosen]);
    }
  }, [site]);

  useEffect(() => {
    if (siteChosen) setAreaName(siteChosen.properties.id);
  }, [siteChosen]);

  const fitArea = () => {
    if (siteIndex) {
      if (viewMode !== viewModeArr[0])
        fitAreaUtls(siteChosen.geometry, map, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          duration: 400,
        });
      else
        fitAreaUtls(siteChosen.geometry, map, {
          padding: { top: 60, bottom: 60, left: 600, right: 50 },
          duration: 400,
        });
    }
  };

  // handle Top Navbar
  useEffect(() => {
    // navbar hanlder
    function handleShowNavbar(e) {
      // When client'mouse axis y value is less than 40 or hover on navbar, show navbar
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

    // Wait 2s to hide the navabar and set navbar event handler function
    let timer = setTimeout(() => {
      navbarRef.current.classList.remove("details__navbar--show");
      document.addEventListener("mousemove", handleShowNavbar);
    }, 2000);

    return () => {
      // release memory
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
        <div className="flex items-center justify-center gap-1">
          <h3
            className="capitalize cursor-pointer relative pr-5
            after:w-[1.25px] after:h-[200%] after:bg-[#ddd] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:rounded-xl"
            onClick={() => navigator("/")}
            title="Home"
          >
            Night Time Economy
          </h3>
          <button
            className="cursor-pointer capitalize ml-4 px-3 hover:text-white transition-colors duration-150"
            onClick={fitArea}
          >
            {areaName}
          </button>
          <button
            className={`text-white text-center ${
              viewMode === viewModeArr[0] && "current-mode"
            }`}
            onClick={() => setViewMode(viewModeArr[0])}
          >
            Overview
          </button>
          <button
            className={`text-white text-center ${
              viewMode === viewModeArr[2] && "current-mode"
            }`}
            onClick={() => setViewMode(viewModeArr[2])}
          >
            Interact
          </button>
          <button
            className={`text-white text-center ${
              viewMode === viewModeArr[1] && "current-mode"
            }`}
            onClick={() => setViewMode(viewModeArr[1])}
          >
            Project
          </button>
        </div>
      </div>

      {viewMode === viewModeArr[2] && siteIndex && (
        <Interact siteIndex={siteIndex} />
      )}
      {viewMode === viewModeArr[1] && siteIndex && (
        <Project
          siteIndex={siteIndex}
          projectName={site}
          setShowProjectMode={() => setViewMode(viewModeArr[2])}
        />
      )}
      {viewMode === viewModeArr[0] && siteIndex && (
        <Overview areaName={areaName} siteIndex={siteIndex} />
      )}
    </>
  );
};

export default Details;
