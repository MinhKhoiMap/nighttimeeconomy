import { useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import { v4 as uuid } from "uuid";
import $ from "jquery";

// Utils
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../../SiteSelection/SiteSelection";
import {
  CaseActivitiesValues,
  SourceID,
  viewModeCons,
} from "../../../../constants";

// Assets
import "./Activities.css";
import reload from "../../../../assets/images/reload.json";
import settings from "../../../../assets/images/settings.json";

// Components
import { ImageList, ImageListItem } from "@mui/material";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import InfoTable from "../../../../components/InfoTable/InfoTable";
import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import RadioGroups from "../../../../components/RadioGroups/RadioGroups";
import TextFieldCustom from "../../../../components/TextFieldCustom/TextFieldCustom";
import SliderCustom from "../../../../components/SliderCustom/SliderCustom";
import SpeedDialCustom from "../../../../components/SpeedDialCustom/SpeedDialCustom";
import LottieIcon from "../../../../components/LottieIcon/LottieIcon";
import { ViewModeContext } from "../../Details";
import firebaseAuth from "../../../../services/firebaseAuth";
import { updloadScenario } from "../../../../services/firebaseStorage";

const Editor = ({ site, updatePointFunc }) => {
  const { siteChosen } = useContext(SiteChosenContext);

  const [imagesUpload, setImagesUpload] = useState([]);
  const [pointTick, setPointTick] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { map } = useMap();

  // Add new point
  useEffect(() => {
    function handleClickOnEmpty(e) {
      if (pointTick.coordinates) {
        if (
          !confirm("Are you sure that you want to switch to a different point?")
        )
          return;
      }

      setPointTick((prev) => ({ ...prev, coordinates: e.lngLat }));
    }

    function handleClickOnExistedPoint(e) {
      console.log(pointTick.coordinates);
      if (pointTick.coordinates) {
        if (
          !confirm("Are you sure that you want to switch to a different point?")
        )
          return;
      }

      setPointTick({
        id: e.features[0].properties.id,
        coordinates: e.lngLat,
        item_1: e.features[0].properties.item_1,
        timeChosen: {
          time: e.features[0].properties["Time"],
          informal: e.features[0].properties["Informal"].toString(),
        },
      });
    }

    map.on("dblclick", `fill_${siteChosen.properties.id}`, handleClickOnEmpty);

    map.on("dblclick", "activities_point", handleClickOnExistedPoint);

    if (pointTick.coordinates) {
      updatePointFunc({
        type: "Feature",
        properties: {
          id: "test",
          Time: pointTick.timeChosen && pointTick.timeChosen.time,
          Informal: pointTick.timeChosen && pointTick.timeChosen.informal,
          Item: pointTick?.item_1,
          item_1: pointTick?.item_1,
        },
        geometry: {
          type: "Point",
          coordinates: [pointTick.coordinates.lng, pointTick.coordinates.lat],
        },
      });
    }

    return () => {
      map.off("dblclick", "activities_point", handleClickOnExistedPoint);
      map.off(
        "dblclick",
        `fill_${siteChosen.properties.id}`,
        handleClickOnEmpty
      );
    };
  }, [pointTick]);

  // Handle Tick Time Table
  function handleChooseTime(e, time) {
    $("td.active").removeClass("active");
    $(e.target).addClass("active");
    let t = "";
    for (var i = 1; i <= time.time; i++) t += i;
    setPointTick((prev) => ({
      ...prev,
      timeChosen: { time: t, informal: time.informal },
    }));
  }

  // Handle Upload Images
  function hanldeUploadImages({ target: { files } }) {
    console.log(files);
    if (files) {
      let imgs = [];
      for (var i = 0; i < files.length; i++) {
        imgs.push(URL.createObjectURL(files[i]));
      }
      setImagesUpload(imgs);
    }
  }

  // Handle Upload Scenario (Update/Add New)
  async function submitScenario(e) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    let params = {};

    for (let [fieldName, val] of formData.entries()) params[fieldName] = val;
    params.Time = pointTick?.timeChosen?.time;
    params.Informal = pointTick?.timeChosen?.informal;
    delete params.lng;
    delete params.lat;

    let geojson = JSON.parse(sessionStorage.getItem("geojson_source"));
    delete geojson.roads;
    delete geojson.site;

    if (pointTick.id) {
      let activities = geojson.activities[site].features.map((activity) => {
        if (activity.properties.id === pointTick.id) {
          activity.properties.Time = pointTick.timeChosen.time;
          activity.properties.Informal = pointTick.timeChosen.informal;
          activity.properties.item_1 = pointTick.item_1;
        }
        return activity;
      });
      geojson.activities[site].features = activities;
    } else {
      let point = {
        type: "Feature",
        properties: {
          id: uuid(),
          Time: pointTick.timeChosen.time,
          Informal: pointTick.timeChosen.informal,
          Item: pointTick.item_1,
          item_1: pointTick.item_1,
        },
        geometry: {
          type: "Point",
          coordinates: [pointTick.coordinates.lng, pointTick.coordinates.lat],
        },
      };
      geojson.activities[site].features.push(point);
    }

    let scenario =
      firebaseAuth.auth.currentUser.email + "-" + params["scenario-name"];

    for (let fileName in geojson) {
      let ref = `/nha_trang/scenarios/${siteChosen.properties.id}/${scenario}/${fileName}.json`;
      await updloadScenario(ref, geojson[fileName]).then(() => {
        console.log(`Upload ${fileName} successfully`);
        localStorage.setItem("lastEditedScenario", scenario);
      });
    }
    setIsLoading(false);
  }

  return (
    <EditSideBar site={site} submitForm={submitScenario}>
      <AccordionCustom summary="Generals" detailStyles={{ gap: 20 }}>
        <div className="flex items-center jusitfy-between gap-5 mt-2">
          <span className="text-xl text-white">Coordinates</span>
          <span className="flex gap-4">
            <TextFieldCustom
              fieldName="lng"
              label="Lng"
              variant="outlined"
              type="number"
              value={
                pointTick && pointTick.coordinates?.lng
                  ? pointTick && pointTick.coordinates.lng
                  : ""
              }
              helperText={"Longtitude must be between -180 and 180"}
              triggers={(e) => {
                if (Math.abs(e.target.value) > 180) throw new Error();
                setCoordinates((prev) => ({ ...prev, lng: e.target.value }));
              }}
            />
            <TextFieldCustom
              fieldName="lat"
              label="Lat"
              variant="outlined"
              type="number"
              value={
                pointTick && pointTick.coordinates?.lat
                  ? pointTick.coordinates.lat
                  : ""
              }
              helperText={"Lattitude must be between -90 and 90"}
              triggers={(e) => {
                if (Math.abs(e.target.value) > 90) throw new Error();
                setCoordinates((prev) => ({ ...prev, lng: e.target.value }));
              }}
            />
          </span>
        </div>
        <AccordionCustom summary="Function">
          <RadioGroups
            items={CaseActivitiesValues}
            nameGroup="activities"
            defaultValue={pointTick && pointTick?.item_1}
            setValue={(e) => {
              setPointTick((prev) => ({
                ...prev,
                item_1: e.target.value,
              }));
            }}
          />
        </AccordionCustom>

        <table className="time-table rounded-lg w-full bg-white/15 border-separate border-spacing-0">
          <thead>
            <tr>
              <th>Time</th>
              <th>Formal</th>
              <th>Informal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>6 A.M - 6 P.M</td>
              <td
                className={`time_filter ${
                  pointTick &&
                  String(pointTick?.timeChosen?.time).at(-1) === "1" &&
                  pointTick?.timeChosen?.informal === "0" &&
                  "active"
                }`}
                onClick={(e) =>
                  handleChooseTime(e, { time: "1", informal: "0" })
                }
              >
                1
              </td>
              <td
                className={`time_filter ${
                  pointTick &&
                  String(pointTick?.timeChosen?.time).at(-1) === "1" &&
                  pointTick?.timeChosen?.informal === "1" &&
                  "active"
                }`}
                onClick={(e) =>
                  handleChooseTime(e, { time: "1", informal: "1" })
                }
              >
                i1
              </td>
            </tr>
            <tr>
              <td>6 P.M - 10 P.M</td>
              <td
                className={`time_filter ${
                  pointTick &&
                  String(pointTick?.timeChosen?.time).at(-1) === "2" &&
                  pointTick?.timeChosen?.informal === "0" &&
                  "active"
                }`}
                onClick={(e) =>
                  handleChooseTime(e, { time: "2", informal: "0" })
                }
              >
                2
              </td>
              <td
                className={`time_filter ${
                  pointTick &&
                  String(pointTick?.timeChosen?.time).at(-1) === "2" &&
                  pointTick?.timeChosen?.informal === "1" &&
                  "active"
                }`}
                onClick={(e) =>
                  handleChooseTime(e, { time: "2", informal: "1" })
                }
              >
                i2
              </td>
            </tr>
            <tr>
              <td>10 P.M - 6 A.M</td>
              <td
                className={`time_filter ${
                  pointTick &&
                  String(pointTick?.timeChosen?.time).at(-1) === "3" &&
                  pointTick?.timeChosen?.informal === "0" &&
                  "active"
                }`}
                onClick={(e) =>
                  handleChooseTime(e, { time: "3", informal: "0" })
                }
              >
                3
              </td>
              <td
                className={`time_filter ${
                  pointTick &&
                  String(pointTick?.timeChosen?.time).at(-1) === "3" &&
                  pointTick?.timeChosen?.informal === "1" &&
                  "active"
                }`}
                onClick={(e) =>
                  handleChooseTime(e, { time: "3", informal: "1" })
                }
              >
                i3
              </td>
            </tr>
          </tbody>
        </table>

        {/* Height Slider */}
        {/* <div className="flex pl-2 pr-8 gap-8 items-center">
          <label htmlFor="height" className="text-white text-xl">
            Height
          </label>
          <SliderCustom
            min={0}
            max={550}
            formatLabel={(value) => `${value} m`}
            name="height"
          />
        </div> */}

        {/* Image Components */}
        {/* <div>
          <div className="flex gap-8 items-center mb-3">
            <label className="text-white text-xl">Images</label>
            {imagesUpload.length > 0 && (
              <span className="flex items-center gap-3">
                <SpeedDialCustom
                  direction="right"
                  icon={
                    <LottieIcon
                      iconType={settings}
                      size={24}
                      color="white"
                      isAnimateOnHover={true}
                    />
                  }
                  actions={[
                    {
                      name: "upload new",
                      icon: (
                        <i className="fa-solid fa-arrow-up-from-bracket"></i>
                      ),
                      action: () => $(".input-field").click(),
                    },
                    {
                      name: "clear all",
                      icon: (
                        <LottieIcon
                          iconType={reload}
                          size={20}
                          isAnimateOnHover={true}
                          color="black"
                        />
                      ),
                      action: () => setImagesUpload([]),
                    },
                  ]}
                />
              </span>
            )}
          </div>
          <div className="max-h-[400px] overflow-auto">
            {imagesUpload.length > 0 && (
              <ImageList cols={Math.min(imagesUpload.length, 3)} gap={8}>
                {imagesUpload.map((image) => (
                  <ImageListItem>
                    <img src={`${image}`} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </div>
          {!(imagesUpload.length > 0) && (
            <form
              onClick={() => $(".input-field").click()}
              className="w-full h-[200px] flex items-center justify-center rounded-lg border-[2px] border-dashed border-[#1475cf] hover:brightness-150 transition-all cursor-pointer"
            >
              <h3 className="flex items-center gap-3 font-bold">
                Browse Files to upload
                <i className="fa-solid fa-cloud-arrow-up text-[#1475cf] text-2xl"></i>
              </h3>
            </form>
          )}
          <input
            type="file"
            accept="image/*"
            className="input-field"
            hidden
            multiple
            onChange={hanldeUploadImages}
          />
        </div> */}
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

const Activities = ({ site }) => {
  const { activitiesData, setProjectData } = useContext(SiteDataContext);
  const { viewMode, setViewMode } = useContext(ViewModeContext);

  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [pointData, setPointData] = useState(null);
  const [filterActivities, setFilterActivities] = useState(null);
  const [filterTime, setFilterTime] = useState(null);
  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState(null);

  useEffect(() => {
    function controlInfoTable(e) {
      setShowTable(true);

      setInfoTable([
        {
          title: "Activity",
          content: e.features[0].properties.item_1,
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

    map.on("mouseenter", "activities_point", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mousemove", "activities_point", controlInfoTable);
    map.on("mouseleave", "activities_point", reset);
    // return () => {
    //   map.off("mousemove", "activities_point", controlInfoTable);
    //   map.off("mouseleave", "activities_point", reset);
    // };
  });

  // Highlighting the row in time table which is selected by clicking
  const handleFilterTime = (e, time) => {
    if ($(e.target).hasClass("active")) {
      $(e.target).toggleClass("active");
      setFilterTime(null);
      return;
    }
    $("td.active").removeClass("active");
    $(e.target).addClass("active");
    setFilterTime(time);
  };

  function handleOnFilterData() {
    let f = activitiesData[site].features.filter(({ properties }) => {
      return (
        (filterActivities
          ? properties.item_1 == filterActivities
          : properties.item_1 != null) &&
        (filterTime
          ? String(properties.Time).indexOf(filterTime.time) >= 0
          : properties.Time != null) &&
        (filterTime
          ? properties.Informal == filterTime.informal
          : properties.Informal != null)
      );
    });
    setPointData({ ...activitiesData[site], features: f });
  }

  function updateNewPoint(newPoint) {
    let data = JSON.parse(JSON.stringify(pointData));

    data.features.forEach((point, index) => {
      if (point.properties.id === "test") {
        console.log("first");
        delete data.features[index];
      }
    });

    data.features.push(newPoint);

    map.getSource("activities-point").setData(data);
    activitiesData[site] = data;
    setProjectData((prev) => ({ ...prev, activities: activitiesData }));
  }

  useEffect(() => {
    handleOnFilterData();
  }, [site, filterTime, filterActivities]);

  useEffect(() => {
    map.on("click", "cluster-point", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["cluster-point"],
      });
      const clusterId = features[0].properties.cluster_id;

      map
        .getSource("activities-point")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) throw new Error(err);

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          });
        });
    });
  });

  return (
    <>
      <Source
        id={SourceID.activities}
        type="geojson"
        data={pointData}
        cluster={true}
        clusterMaxZoom={15}
        clusterRadius={50}
      >
        <Layer
          id="cluster-point"
          type="circle"
          paint={{
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              80,
              "#f1f075",
              110,
              "#f28cb1",
            ],
            "circle-opacity": 0.7,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              80,
              28,
              110,
              35,
            ],
            "circle-stroke-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              80,
              "#f1f075",
              110,
              "#f28cb1",
            ],
            "circle-stroke-width": 1,
          }}
          filter={["has", "point_count"]}
        />
        {/* Label cluster count */}
        <Layer
          type="symbol"
          layout={{
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 16,
            "text-anchor": "center",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "#000",
          }}
          filter={["has", "point_count"]}
        />
        {/* Activities Point */}
        <Layer
          id="activities_point"
          type="circle"
          paint={{
            "circle-stroke-color": [
              "match",
              ["get", "item_1"],
              ...CaseActivitiesValues,
              // Other Values
              "rgba(255, 196, 54, 0.3)",
            ],
            "circle-stroke-width": 1,
            "circle-radius": 6.5,
            "circle-opacity": 0.8,
            "circle-color": [
              "match",
              ["get", "item_1"],
              ...CaseActivitiesValues,
              // Other Values
              "#ccc",
            ],
            "circle-pitch-scale": "map",
            "circle-radius-transition": { duration: 0.2 },
          }}
          filter={["all", ["!", ["has", "point_count"]]]}
        />
      </Source>

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

      {viewMode === viewModeCons.edit && (
        <Editor site={site} updatePointFunc={updateNewPoint} />
      )}

      {viewMode !== viewModeCons.edit && (
        <div className="fixed bottom-24 right-6">
          <div className="rounded-lg mb-4">
            <table className="time-table rounded-lg w-full bg-white/15 border-separate border-spacing-0">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Formal</th>
                  <th>Informal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>6 A.M - 6 P.M</td>
                  <td
                    className="time_filter"
                    onClick={(e) =>
                      handleFilterTime(e, { time: "1", informal: "0" })
                    }
                  >
                    1
                  </td>
                  <td
                    className="time_filter"
                    onClick={(e) =>
                      handleFilterTime(e, { time: "1", informal: "1" })
                    }
                  >
                    i1
                  </td>
                </tr>
                <tr>
                  <td>6 P.M - 10 P.M</td>
                  <td
                    className="time_filter"
                    onClick={(e) =>
                      handleFilterTime(e, { time: "2", informal: "0" })
                    }
                  >
                    2
                  </td>
                  <td
                    className="time_filter"
                    onClick={(e) =>
                      handleFilterTime(e, { time: "2", informal: "1" })
                    }
                  >
                    i2
                  </td>
                </tr>
                <tr>
                  <td>10 P.M - 6 A.M</td>
                  <td
                    className="time_filter"
                    onClick={(e) =>
                      handleFilterTime(e, { time: "3", informal: "0" })
                    }
                  >
                    3
                  </td>
                  <td
                    className="time_filter"
                    onClick={(e) =>
                      handleFilterTime(e, { time: "3", informal: "1" })
                    }
                  >
                    i3
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <AnnotationTable
            items={CaseActivitiesValues}
            filter={filterActivities}
            setFilter={setFilterActivities}
          />
        </div>
      )}
    </>
  );
};

export default Activities;
