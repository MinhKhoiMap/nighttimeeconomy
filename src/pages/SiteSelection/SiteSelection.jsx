import { createContext, useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import { Outlet, useNavigate } from "react-router-dom";
import $ from "jquery";
import mapboxgl from "mapbox-gl";

import "./SiteSelection.css";
import getGeoJSONData from "../../services/fetchGeoJSONData";
import loadcat from "../../assets/images/loadcat.gif";

const SitePolygon = ({ feature, index, map, setSiteChosen }) => {
  const navigate = useNavigate();

  let name = `${feature.properties.id}`;

  // Set event listeners to each layer
  useEffect(() => {
    function handleChooseSite() {
      setSiteChosen(feature);
      navigate(`./${feature.properties.id}`);
    }

    function handleHoverChangeCursor() {
      map.getMap().doubleClickZoom.disable();
      map.getCanvas().style.cursor = "pointer";
    }

    function handleDragChangeCursor() {
      map.getCanvas().style.cursor = "grab";
    }

    function reset() {
      map.getMap().doubleClickZoom.enable();
      map.getCanvas().style.cursor = "grab";
    }

    map.on("click", `fill_${name}`, handleChooseSite);
    map.on("mouseenter", `fill_${name}`, handleHoverChangeCursor);
    map.on("mouseleave", `fill_${name}`, reset);
    map.on("dragstart", `fill_${name}`, handleDragChangeCursor);
    map.on("dragend", `fill_${name}`, reset);

    return () => {
      map.off("click", `fill_${name}`, handleChooseSite);
      map.off("mouseenter", `fill_${name}`, handleHoverChangeCursor);
      map.off("mouseleave", `fill_${name}`, reset);
      map.off("dragstart", `fill_${name}`, handleDragChangeCursor);
      map.off("dragend", `fill_${name}`, reset);
    };
  }, []);

  return (
    <Source key={name} id={name} type="geojson" data={feature}>
      <Layer
        type="line"
        paint={{
          "line-color": "#fff",
          "line-width": 0.4,
        }}
      />
      <Layer
        id={`fill_${name}`}
        type="fill"
        paint={{ "fill-color": "rgba(13, 16, 92, 0.3)" }}
      />
      {/* <Layer
        type="symbol"
        layout={{
          "text-field": (index + 1).toString(),
          "text-size": 16,
          "text-anchor": "center",
          "text-allow-overlap": true,
        }}
        paint={{ "text-color": "white" }}
      /> */}
    </Source>
  );
};

export const SiteChosenContext = createContext({});
export const SiteDataContext = createContext({});

const SiteSelection = () => {
  // this is represents the selected area index
  const [siteChosen, setSiteChosen] = useState(null);
  const [projectData, setProjectData] = useState(
    sessionStorage.getItem("geojson_source") &&
      JSON.parse(sessionStorage.getItem("geojson_source"))
  );
  const [loading, setLoading] = useState(
    !sessionStorage.getItem("geojson_source")
  );

  const { map } = useMap();

  useEffect(() => {
    if (!loading && projectData) handleLoadSite();
  }, [loading]);

  useEffect(() => {
    $(".orient-marker").fadeOut();

    if (loading) {
      let source = {};

      getGeoJSONData("site")
        .then((data) => {
          source.site = data;
          setProjectData((prev) => ({ ...prev, site: data }));
        })
        .then(() => getGeoJSONData("landuse"))
        .then((data) => {
          source.landuse = data;
          setProjectData((prev) => ({ ...prev, landuse: data }));
        })
        .then(() => getGeoJSONData("buildinguse"))
        .then((data) => {
          source.buildinguse = data;
          setProjectData((prev) => ({ ...prev, buildinguse: data }));
        })
        .then(() => getGeoJSONData("activities"))
        .then((data) => {
          source.activities = data;
          setProjectData((prev) => ({ ...prev, activities: data }));
          sessionStorage.setItem("geojson_source", JSON.stringify(source));
        })
        .then(() => getGeoJSONData("interview"))
        .then((data) => {
          source.interview = data;
          setProjectData((prev) => ({ ...prev, interview: data }));
          sessionStorage.setItem("geojson_source", JSON.stringify(source));
        })
        .then(() => getGeoJSONData("road"))
        .then((data) => {
          source.roads = data;
          setProjectData((prev) => ({ ...prev, roads: data }));
          sessionStorage.setItem("geojson_source", JSON.stringify(source));
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // Handling to display all areas in a viewport
  const handleLoadSite = () => {
    var bounds = new mapboxgl.LngLatBounds();

    // Loop through all areas and extend bounds box
    projectData.site.features.forEach((feature) => {
      feature.geometry.coordinates[0].forEach((coordinate) =>
        bounds.extend(coordinate)
      );
    });

    map.fitBounds(bounds, {
      padding: { top: 20, bottom: 20, left: 20, right: 20 },
      duration: 3000,
    });
  };

  // let counter = 0;

  return (
    <>
      {!loading && (
        <>
          {projectData.site.features.map((feature, index) => (
            <SitePolygon
              key={feature.name}
              feature={feature}
              index={index}
              map={map}
              setSiteChosen={setSiteChosen}
            />
          ))}

          <SiteDataContext.Provider
            value={{
              siteSelectionData: projectData.site,
              landuseData: projectData.landuse,
              buildinguseData: projectData.buildinguse,
              activitiesData: projectData.activities,
              interviewPointData: projectData.interview,
              roads: projectData.roads,
              setProjectData,
            }}
          >
            <SiteChosenContext.Provider value={{ siteChosen, setSiteChosen }}>
              {/* Children Component will be mounted here, and childrent component has siteChosenIndex as a prop */}
              <Outlet />
            </SiteChosenContext.Provider>
          </SiteDataContext.Provider>
        </>
      )}

      {loading && (
        <div className="fixed top-0 bottom-0 right-0 left-0 bg-black/85 z-[99999] flex items-end pl-5 pb-2">
          <span className="max-w-[250px] flex gap-2 flex-col">
            <span className="flex items-end gap-3">
              <img src={loadcat} alt="" width="60" />
              <p className="loading-wrap text-white font-[Raleway] tracking-[8px]">
                <span style={{ "--i": 1 }}>L</span>
                <span style={{ "--i": 2 }}>o</span>
                <span style={{ "--i": 3 }}>a</span>
                <span style={{ "--i": 4 }}>d</span>
                <span style={{ "--i": 5 }}>i</span>
                <span style={{ "--i": 6 }}>n</span>
                <span style={{ "--i": 7 }}>g</span>
                <span style={{ "--i": 8 }}>.</span>
                <span style={{ "--i": 9 }}>.</span>
                <span style={{ "--i": 10 }}>.</span>
              </p>
            </span>
            <div className="barload-container w-[250px]"></div>
          </span>
        </div>
      )}
    </>
  );
};

export default SiteSelection;
