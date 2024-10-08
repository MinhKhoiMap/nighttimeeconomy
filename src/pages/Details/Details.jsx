import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMap } from "react-map-gl";
import $ from "jquery";

// Utils
import { fitAreaUtls } from "../../utils/fitAreaUtls";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../SiteSelection/SiteSelection";
import {
  viewModeArr,
  viewModeCons,
  viewModeIndexDefault,
} from "../../constants";

// Assets
import "./Details.css";

// Components
import Interact from "./Interact/Interact";
import Project from "./Project/Project";
import Overview from "./Overview/Overview";

export const ViewModeContext = createContext({});

const Details = () => {
  const { siteChosen, setSiteChosen } = useContext(SiteChosenContext);
  const { siteSelectionData } = useContext(SiteDataContext);

  // get site selected index from params in url
  let { site } = useParams(),
    timer;
  const navbarRef = useRef();
  const { map } = useMap();

  const navigator = useNavigate();

  const [siteIndex, setSiteIndex] = useState(null);
  const [lastViewMode, setLastViewMode] = useState(
    viewModeArr[viewModeIndexDefault]
  );
  // Set default mode is "interact"
  const [viewMode, setViewMode] = useState(viewModeArr[viewModeIndexDefault]);
  const [areaName, setAreaName] = useState("");

  function findSiteIndex(siteId) {
    for (var i = 0; i < siteSelectionData.features.length; i++) {
      if (siteSelectionData.features[i].properties.id === siteId) {
        return i.toString();
      }
    }
  }
  const fitArea = () => {
    if (siteIndex) {
      console.log(viewMode);
      if (viewMode !== viewModeArr[viewModeCons.overview])
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

  // navbar hanlder
  const handleShowNavbar = useCallback((e) => {
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
  }, []);

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

  // handle Top Navbar
  useEffect(() => {
    // Wait 2s to hide the navabar and set navbar event handler function
    timer = setTimeout(() => {
      navbarRef.current.classList.remove("details__navbar--show");
      document.addEventListener("mousemove", handleShowNavbar);
    }, 2000);

    return () => {
      // release memory
      clearTimeout(timer);
      console.log("clean up func");
      document.removeEventListener("mousemove", handleShowNavbar);
    };
  }, []);

  useEffect(() => {
    if (viewMode === viewModeCons.edit) {
      clearTimeout(timer);
      document.removeEventListener("mousemove", handleShowNavbar);
    } else {
      document.addEventListener("mousemove", handleShowNavbar);
    }
  }, [viewMode]);

  return (
    <>
      {viewMode !== viewModeCons.edit && (
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
                viewMode === viewModeArr[viewModeCons.overview] &&
                "current-mode"
              }`}
              onClick={() => {
                setLastViewMode(viewMode);
                setViewMode(viewModeArr[viewModeCons.overview]);
              }}
            >
              Overview
            </button>
            <button
              className={`text-white text-center ${
                viewMode === viewModeArr[viewModeCons.interact] &&
                "current-mode"
              }`}
              onClick={() => {
                setLastViewMode(viewMode);
                setViewMode(viewModeArr[viewModeCons.interact]);
              }}
            >
              Interact
            </button>
            <button
              className={`text-white text-center ${
                viewMode === viewModeArr[viewModeCons.project] && "current-mode"
              }`}
              onClick={() => {
                setLastViewMode(viewMode);
                setViewMode(viewModeArr[viewModeCons.project]);
              }}
            >
              Project
            </button>
          </div>
        </div>
      )}

      {(viewMode === viewModeArr[viewModeCons.interact] ||
        viewMode === viewModeCons.edit) &&
        siteIndex && (
          <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
            <Interact siteIndex={siteIndex} />
          </ViewModeContext.Provider>
        )}
      {viewMode === viewModeArr[viewModeCons.project] && siteIndex && (
        <Project
          siteIndex={siteIndex}
          projectName={site}
          setShowProjectMode={() => setViewMode(lastViewMode)}
        />
      )}
      {viewMode === viewModeArr[viewModeCons.overview] && siteIndex && (
        <Overview areaName={areaName} siteIndex={siteIndex} />
      )}

      {/* <div className="fixed top-[300px] left-[30px]">
        <Menu
          id="lock-menu"
          open={true}
          MenuListProps={{
            "aria-labelledby": "lock-button",
            role: "listbox",
          }}
          anchorEl={<p>alkfjskldfjakl;sdjf</p>}
        >
          {[
            "Show some love to MUI",
            "Show all notification content",
            "Hide sensitive notification content",
            "Hide all notification content",
          ].map((option, index) => (
            <MenuItem
              key={option}
              disabled={index === 0}
              onClick={(event) => handleMenuItemClick(event, index)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div> */}
    </>
  );
};

export default Details;
