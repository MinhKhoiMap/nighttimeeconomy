import { useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";
import { toast } from "react-toastify";

import {
  SiteChosenContext,
  SiteDataContext,
} from "../../../SiteSelection/SiteSelection";
import { EditModeData } from "../Interact";
import {
  CaseLanduseValues,
  SourceID,
  viewModeCons,
} from "../../../../constants/index";
import firebaseAuth from "../../../../services/firebaseAuth";

// Data
// import { landuseData } from "../../../../assets/data/landuse";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import RadioGroups from "../../../../components/RadioGroups/RadioGroups";
import { ViewModeContext } from "../../Details";
import { updloadScenario } from "../../../../services/firebaseStorage";

const Editor = ({ site, updateLanduseFunc }) => {
  const { siteChosen } = useContext(SiteChosenContext);
  const {
    activitiesData,
    landuseData,
    buildinguseData,
    interviewPointData,
    setProjectData,
  } = useContext(SiteDataContext);
  const { scenarioChosen } = useContext(EditModeData);

  const [polygonTick, setPolygonTick] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { map } = useMap();

  async function submitScenario(e) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    let params = {};

    for (let [fieldName, val] of formData.entries()) params[fieldName] = val;

    let geojson = {
      activities: activitiesData,
      buildinguse: buildinguseData,
      interview: interviewPointData,
      landuse: landuseData,
    };

    let scenario =
      typeof scenarioChosen !== "string"
        ? scenarioChosen.name
        : firebaseAuth.auth.currentUser.email +
          "-" +
          params["scenario-name"].trim();

    for (let fileName in geojson) {
      let ref = `/nha_trang/scenarios/${siteChosen.properties.id}/${scenario}/${fileName}.json`;
      await updloadScenario(ref, geojson[fileName]).then(() => {
        console.log(`Upload ${fileName} successfully`);
      });
    }
    toast.success("Upload Successfully!", { containerId: "toastify" });
    setIsLoading(false);
  }

  useEffect(() => {
    function handleClickOnPolygon(e) {
      if (e.features[0].properties.id === polygonTick?.id) {
        setPolygonTick({});
        updateLanduseFunc(null);
      } else {
        if (polygonTick.id) {
          if (
            !confirm(
              "Are you sure that you want to switch to a different polygon?"
            )
          )
            return;
        }

        setPolygonTick({
          id: e.features[0].properties.id,
          landuse: e.features[0].properties["Landuse"],
        });
      }
    }

    map.on("dblclick", "landuse_selection", handleClickOnPolygon);

    if (polygonTick?.landuse && polygonTick?.id) {
      let data = JSON.parse(JSON.stringify(landuseData[site])),
        temp;

      data.features = data.features.filter((polygon) => {
        if (polygon.properties.id === polygonTick.id) temp = polygon;
        return polygon.properties.id !== polygonTick.id;
      });

      temp.properties.Landuse = polygonTick.landuse;

      data.features.push(temp);

      updateLanduseFunc(temp);

      map.getSource(SourceID.landuse).setData(data);
      landuseData[site] = data;
      setProjectData((prev) => ({ ...prev, landuse: landuseData }));
    }

    return () => {
      map.off("dblclick", "landuse_selection", handleClickOnPolygon);
    };
  }, [polygonTick]);

  return (
    <EditSideBar site={site} submitForm={submitScenario}>
      <AccordionCustom summary="Functions">
        <RadioGroups
          items={CaseLanduseValues}
          nameGroup="landuse"
          defaultValue={polygonTick && polygonTick?.landuse}
          setValue={(e) => {
            setPolygonTick((prev) => ({
              ...prev,
              landuse: e.target.value,
            }));
          }}
        />
      </AccordionCustom>
      <button
        type="submit"
        className="text-white text-lg mt-4 w-full p-[6px] bg-black rounded-md border border-[#ccc] font-bold"
      >
        Save
      </button>
      {isLoading && <loading />}
    </EditSideBar>
  );
};

const Landuse = ({ site }) => {
  const { landuseData } = useContext(SiteDataContext);
  const { viewMode } = useContext(ViewModeContext);

  const tableMaxWidth = 300,
    tableMaxHeight = 350;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);

  const [filterLand, setFilterLand] = useState(null);
  const [polygonChosen, setPolygonChosen] = useState(null);

  function updateLanduseFunc(polygon) {
    setPolygonChosen(polygon);
  }

  useEffect(() => {
    // Handling show info tag when hover on layer (land polygon)
    function controlInfoTable(e) {
      setShowTable(true);

      let hoveredPolygonId = e.features[0].id;

      let polygon =
        e.features[0].geometry.type === "Polygon"
          ? turf.polygon(e.features[0].geometry.coordinates)
          : turf.multiPolygon(e.features[0].geometry.coordinates);

      setInfoTable([
        { title: "Landuse", content: e.features[0].properties.Landuse },
        {
          title: "Area",
          content: <div>{turf.round(turf.area(polygon), 5)} m&sup2;</div>,
        },
      ]);

      // Calculate the info tag position following client's mouse
      const screenX = screen.width,
        screenY = screen.height;

      let clientX = e.originalEvent.clientX,
        clientY = e.originalEvent.clientY,
        positionX = "left",
        positionY = "top",
        valueX = 20,
        valueY = 20;

      if (clientY + tableMaxHeight + 50 > screenY) {
        positionY = "bottom";
        valueY = 0;
      }

      if (clientX + tableMaxWidth + 50 > screenX) {
        positionX = "right";
        valueY = 0;
      }

      if (mouseDivRef.current) {
        mouseDivRef.current.style.top = clientY + "px";
        mouseDivRef.current.style.left = clientX + "px";
      }

      setInfoTablePosition({
        px: { position: positionX, value: valueX + "px" },
        py: { position: positionY, value: valueY + "px" },
      });
    }

    // Hide tag
    function reset() {
      setShowTable(false);
      setInfoTablePosition(null);
    }

    map.on("mousemove", "landuse_selection", controlInfoTable);
    map.on("mouseleave", "landuse_selection", reset);

    return () => {
      map.off("mousemove", "landuse_selection", controlInfoTable);
      map.off("mouseleave", "landuse_selection", reset);
    };
  }, []);

  return (
    <>
      {site && (
        <Source type="geojson" data={landuseData[site]} id="landuse">
          <Layer
            id="landuse_selection"
            type="fill"
            paint={{
              "fill-outline-color": "black",
              // color the polygon based on Landuse value
              "fill-color": [
                "match",
                ["get", "Landuse"],
                ...CaseLanduseValues,
                // Other Values
                "rgba(255, 196, 54, 0.3)",
              ],
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "click"], false],
                0.8,
                1,
              ],
            }}
            // filter the polygon based on Landuse value
            filter={
              filterLand
                ? ["==", ["get", "Landuse"], filterLand]
                : ["!=", ["get", "Landuse"], null]
            }
          />
        </Source>
      )}

      {polygonChosen && (
        <Source type="geojson" data={polygonChosen}>
          <Layer
            id="chosen-overlay"
            type="line"
            paint={{
              "line-color": "#fff",
              "line-width": 1.8,
              "line-cap": "round",
            }}
          />
          <Layer
            beforeId="chosen-overlay"
            type="fill"
            paint={{
              "fill-color": "white",
              "fill-opacity": 0.2,
            }}
            // filter the polygon based on Landuse value
            filter={
              filterLand
                ? ["==", ["get", "Landuse"], filterLand]
                : ["!=", ["get", "Landuse"], null]
            }
          />
        </Source>
      )}

      <div className="fixed" ref={mouseDivRef}>
        {showTable && (
          <InfoTable
            infoList={infoTable}
            cx={infoTablePosition.px}
            cy={infoTablePosition.py}
            maxWidth={tableMaxWidth}
            maxHeight={tableMaxHeight}
          />
        )}
      </div>

      <div
        className="fixed bottom-14"
        style={{
          left: viewMode !== viewModeCons.edit ? "unset" : "24px",
          right: viewMode !== viewModeCons.edit ? "24px" : "unset",
        }}
      >
        <AnnotationTable
          items={CaseLanduseValues}
          filter={filterLand}
          setFilter={setFilterLand}
        />
      </div>

      {viewMode === viewModeCons.edit && (
        <Editor site={site} updateLanduseFunc={updateLanduseFunc} />
      )}
    </>
  );
};

export default Landuse;
