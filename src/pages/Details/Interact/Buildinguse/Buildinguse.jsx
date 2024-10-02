import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";

// Utils
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../../SiteSelection/SiteSelection";
import { EditModeData } from "../Interact";
import {
  CaseBuildinguseValues,
  SourceID,
  viewModeCons,
} from "../../../../constants";
import { ViewModeContext } from "../../Details";
import firebaseAuth from "../../../../services/firebaseAuth";
import { updloadScenario } from "../../../../services/firebaseStorage";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import RadioGroups from "../../../../components/RadioGroups/RadioGroups";
import SliderCustom from "../../../../components/SliderCustom/SliderCustom";

const Editor = ({ site }) => {
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

    setIsLoading(false);
  }

  useEffect(() => {
    function handleClickOnPolygon(e) {
      if (e.features[0].properties.id === polygonTick?.id) {
        setPolygonTick({});
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
          buildinguse: e.features[0].properties["Buildsused"],
          height: e.features[0].properties?.height,
        });
      }
    }

    map.on("dblclick", "buildinguse_selection", handleClickOnPolygon);

    if (polygonTick?.buildinguse && polygonTick?.id) {
      let data = JSON.parse(JSON.stringify(buildinguseData[site])),
        temp;

      data.features = data.features.filter((polygon) => {
        if (polygon.properties.id === polygonTick.id) temp = polygon;
        return polygon.properties.id !== polygonTick.id;
      });

      temp.properties.Buildsused = polygonTick.buildinguse;
      if (polygonTick.height) temp.properties.height = polygonTick.height;

      data.features.push(temp);

      map.getSource(SourceID.buildinguse).setData(data);
      buildinguseData[site] = data;
      setProjectData((prev) => ({ ...prev, buildinguse: buildinguseData }));
    }

    return () => {
      map.off("dblclick", "landuse_selection", handleClickOnPolygon);
    };
  }, [polygonTick]);

  return (
    <EditSideBar site={site} submitForm={submitScenario}>
      <AccordionCustom summary="Functions">
        <RadioGroups
          items={CaseBuildinguseValues}
          nameGroup="buildinguse"
          defaultValue={polygonTick && polygonTick?.buildinguse}
          setValue={(e) => {
            setPolygonTick((prev) => ({
              ...prev,
              buildinguse: e.target.value,
            }));
          }}
        />
        <div className="flex pl-2 pr-8 gap-8 items-center">
          <label htmlFor="height" className="text-white text-xl">
            Height
          </label>
          <SliderCustom
            min={0}
            max={550}
            formatLabel={(value) => `${value} m`}
            name="height"
            updateState={(val) =>
              setPolygonTick((prev) => ({ ...prev, height: Number(val) }))
            }
          />
        </div>
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

const Buildinguse = ({ site }) => {
  const { buildinguseData, siteSelectionData } = useContext(SiteDataContext);
  const { viewMode, setViewMode } = useContext(ViewModeContext);

  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);
  const [buildingIntersection, setBuildingIntersection] = useState(null);
  const [showGrid, setShowGrid] = useState(false);

  const [filterBuilding, setFilterBuilding] = useState(null);
  const [chosedBuilding, setChosedBuilding] = useState(null);

  useEffect(() => {
    // Like the function in landuse component
    function controlInfoTable(e) {
      setShowTable(true);

      setInfoTable([
        {
          title: "Building use",
          content: e.features[0].properties.Buildsused,
        },
      ]);

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

    function reset() {
      setShowTable(false);
      setInfoTablePosition(null);
      map.getCanvas().style.cursor = "grab";
    }

    function changePointer() {
      map.getCanvas().style.cursor = "pointer";
    }

    map.on("mouseenter", "buildinguse_selection", changePointer);
    map.on("mousemove", "buildinguse_selection", controlInfoTable);
    map.on("mouseleave", "buildinguse_selection", reset);

    return () => {
      map.off("mousemove", "buildinguse_selection", controlInfoTable);
      map.off("mouseleave", "buildinguse_selection", reset);
      map.off("mouseenter", "buildinguse_selection", changePointer);
    };
  }, [map]);

  // Before drawing building, filtering all building outside the selected area boundary
  useEffect(() => {
    if (site) {
      let intersectBuildingGeos = buildinguseData[site].features.filter(
        (buildingGeo) => {
          return turf.booleanIntersects(
            turf.polygon(buildingGeo.geometry.coordinates),
            turf.polygon(siteSelectionData.features[site].geometry.coordinates)
          );
        }
      );

      setBuildingIntersection({
        type: "FeatureCollection",
        name: "",
        features: intersectBuildingGeos,
      });
    }
  }, [site]);

  return (
    <>
      {buildingIntersection && (
        <Source
          type="geojson"
          data={buildingIntersection}
          generateId={true}
          id={SourceID.buildinguse}
        >
          <Layer
            id="grid"
            type="fill"
            paint={{
              "fill-outline-color": "black",
              "fill-outline-color-transition": { duration: 300 },
              "fill-color": "transparent",
            }}
            filter={
              filterBuilding
                ? ["==", ["get", "Buildsused"], filterBuilding]
                : ["!=", ["get", "Buildsused"], null]
            }
          />
          <Layer
            beforeId={"grid"}
            id="buildinguse_selection"
            type="fill-extrusion"
            paint={{
              "fill-extrusion-color": [
                "match",
                ["get", "Buildsused"],
                ...CaseBuildinguseValues,
                // Other Values
                "rgba(255, 196, 54, 0.3)",
              ],
              "fill-extrusion-height": [
                "case",
                [">=", ["to-number", ["get", "height"]], 1],
                ["to-number", ["get", "height"]],
                -1,
              ],
            }}
            filter={
              filterBuilding
                ? ["==", ["get", "Buildsused"], filterBuilding]
                : ["!=", ["get", "Buildsused"], null]
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
          items={CaseBuildinguseValues}
          filter={filterBuilding}
          setFilter={setFilterBuilding}
        />
      </div>
      {viewMode === viewModeCons.edit && <Editor site={site} />}
    </>
  );
};

export default Buildinguse;
