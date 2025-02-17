import { useState, useEffect, useRef, useContext } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";
import { useToast } from "@/hooks/use-toast";
import "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import $ from "jquery";

// Assets
import settings from "../../../../assets/images/settings.json";
import reload from "../../../../assets/images/reload.json";

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
import {
  getDownloadUrl,
  getMeta,
  getRef,
  listChilds,
  updloadFile,
  updloadScenario,
} from "../../../../services/firebaseStorage";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import RadioGroups from "../../../../components/RadioGroups/RadioGroups";
import SliderCustom from "../../../../components/SliderCustom/SliderCustom";
import ChartCustom from "../../../../components/ChartCustom/ChartCustom";
import SpeedDialCustom from "../../../../components/SpeedDialCustom/SpeedDialCustom";
import LottieIcon from "../../../../components/LottieIcon/LottieIcon";
import { ImageList, ImageListItem } from "@mui/material";
import { uploadString } from "firebase/storage";
import PhotoSlide from "../../../../components/PhotoSlide/PhotoSlide";

const draw = new MapboxDraw({
  controls: {
    polygon: true,
    trash: true,
    combine_features: true,
    uncombine_features: true,
    line_string: false,
    point: true,
  },
});

const Editor = ({ site, handleChangeChosenBuilding, chartData }) => {
  const { siteChosen } = useContext(SiteChosenContext);
  const {
    activitiesData,
    landuseData,
    buildinguseData,
    interviewPointData,
    viewpointsData,
    setProjectData,
  } = useContext(SiteDataContext);
  const { scenarioChosen } = useContext(EditModeData);

  const [polygonTick, setPolygonTick] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagesUpload, setImagesUpload] = useState([]);
  const [viewpoint, setViewpoint] = useState(null);

  const { map } = useMap();
  const { toast } = useToast();

  async function submitScenario(e) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    let params = {};

    for (let [fieldName, val] of formData.entries()) params[fieldName] = val;

    // Upload GeoJSON Data
    let geojson = {
      activities: activitiesData,
      buildinguse: buildinguseData,
      interview: interviewPointData,
      landuse: landuseData,
      viewpoints: viewpointsData,
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

    // Handle upload media for viewpoints

    for (let media of imagesUpload) {
      let ref = `/nha_trang/media/${siteChosen.properties.id}/viewpoints/${scenario}/${media.id}`;
      for (let img of media.images) {
        await updloadFile(`${ref}/${img.file.name}`, img.file);
        await uploadString(
          getRef(`${ref}/${img.file.name}.json`),
          "faljsdflfkafjsdf"
        );
      }
    }

    toast({ title: "Upload Successfully!" });
    setIsLoading(false);
  }

  function handleUploadImages({ target: { files } }) {
    if (files) {
      let imgs = [];
      for (var i = 0; i < files.length; i++) {
        imgs.push({
          name: files[i].name,
          url: URL.createObjectURL(files[i]),
          file: files[i],
        });
      }

      setImagesUpload((prev) => {
        let temp;
        const filterMedia = prev.filter((media) => {
          if (media.id == viewpoint.properties.id) temp = media;
          return media.id != viewpoint.properties.id;
        });

        if (filterMedia.length == prev.length) {
          return [...prev, { id: viewpoint.properties.id, images: imgs }];
        } else {
          temp.images = imgs;
          return [...filterMedia, temp];
        }
      });
    }
  }

  function handleResetImage() {
    setImagesUpload((prev) => {
      return prev.filter((media) => media.id != viewpoint.properties.id);
    });
  }

  useEffect(() => {
    function handleEditPolygon(e) {
      if (e.features.length == 1) {
        if (e.features[0].properties.id == polygonTick?.id) {
          setPolygonTick({});
          handleChangeChosenBuilding(null);
          draw.delete(e.features[0].id);
        } else {
          // if (polygonTick.id) {
          //   if (
          //     !confirm(
          //       "Are you sure that you want to switch to a different polygon?"
          //     )
          //   )
          //     return;
          // }

          setPolygonTick({
            id: e.features[0].properties.id,
            buildinguse: e.features[0].properties["Buildsused"],
            height: e.features[0].properties?.height,
          });

          draw.add(e.features[0]);
        }
      }
    }

    function handleUpdatePolygon(e) {
      const currentMode = draw.getMode();
      if (currentMode === draw.modes.DRAW_POLYGON) {
        let data = JSON.parse(JSON.stringify(buildinguseData[site])),
          temp;

        data.features = data.features.filter((polygon) => {
          if (polygon.properties.id == polygonTick.id) temp = polygon;
          return polygon.properties.id != polygonTick.id;
        });

        temp.geometry = e.features[0].geometry;

        data.features.push(temp);

        map.getSource(SourceID.buildinguse).setData(data);
        buildinguseData[site] = data;
        setProjectData((prev) => ({ ...prev, buildinguse: buildinguseData }));
      } else if (currentMode === draw.modes.DRAW_POINT) {
        let data = JSON.parse(JSON.stringify(viewpointsData[site])),
          temp;

        data.features = data.features.filter((point) => {
          if (point.properties.id == viewpoint.id) temp = point;
          return point.properties.id != viewpoint.id;
        });

        temp.geometry = e.features[0].geometry;

        data.features.push(temp);

        map.getSource(SourceID.viewpoints).setData(data);
        viewpointsData[site] = data;
        setProjectData((prev) => ({ ...prev, viewpoints: viewpointsData }));
      }
    }

    function handleTrashPolygon() {
      let data = JSON.parse(JSON.stringify(buildinguseData[site]));
      data.features = data.features.filter(
        (polygon) => polygon.properties.id != polygonTick.id
      );

      handleChangeChosenBuilding(null);

      map.getSource(SourceID.buildinguse).setData(data);
      buildinguseData[site] = data;
      setProjectData((prev) => ({ ...prev, buildinguse: buildinguseData }));
    }

    function handleControlAddViewPoints() {
      if (!polygonTick.id && draw.getMode() === draw.modes.DRAW_POINT) {
        console.log("first");
        draw.changeMode(draw.modes.SIMPLE_SELECT);
      }
    }

    function handleCreateNew(e) {
      const currentMode = draw.getMode();
      if (currentMode === draw.modes.DRAW_POLYGON) {
        let data = JSON.parse(JSON.stringify(buildinguseData[site]));

        const { id, ...feature } = e.features[0];

        data.features.push({
          ...feature,
          properties: {
            id,
            Buildsused: CaseBuildinguseValues[0],
          },
        });

        map.getSource(SourceID.buildinguse).setData(data);
        buildinguseData[site] = data;
        setProjectData((prev) => ({ ...prev, buildinguse: buildinguseData }));
        setPolygonTick({
          id,
          buildinguse: CaseBuildinguseValues[0],
        });
      } else if (currentMode === draw.modes.DRAW_POINT) {
        let data = JSON.parse(JSON.stringify(viewpointsData[site]));
        const { id, ...viewpoint } = e.features[0];

        data.features.push({
          ...viewpoint,
          properties: {
            id,
            id_build: polygonTick.id,
          },
        });

        console.log(data, "viewpoint data");
        map.getSource(SourceID.viewpoints).setData(data);
        viewpointsData[site] = data;
        setProjectData((prev) => ({ ...prev, viewpoints: viewpointsData }));
      }
    }

    function handleEditViewpoint(e) {
      if (e.features[0].properties.id == viewpoint?.properties.id) {
        setViewpoint(null);
      } else {
        const { type, properties, geometry } = e.features[0];

        setViewpoint({
          type,
          properties,
          geometry,
        });
        draw.add(e.features[0]);
      }
    }

    map.on("draw.create", handleCreateNew);
    map.on("dblclick", "buildinguse_selection", handleEditPolygon);
    map.on("draw.update", handleUpdatePolygon);
    map.on("draw.delete", handleTrashPolygon);
    map.on("draw.modechange", handleControlAddViewPoints);
    map.on("contextmenu", "viewpoints", handleEditViewpoint);

    if (polygonTick?.buildinguse && polygonTick?.id) {
      let data = JSON.parse(JSON.stringify(buildinguseData[site])),
        temp;

      data.features = data.features.filter((polygon) => {
        if (polygon.properties.id === polygonTick.id) temp = polygon;
        return polygon.properties.id !== polygonTick.id;
      });

      temp.properties.Buildsused = polygonTick.buildinguse;
      if (polygonTick.height >= 0) temp.properties.height = polygonTick.height;

      handleChangeChosenBuilding(temp);

      data.features.push(temp);

      map.getSource(SourceID.buildinguse).setData(data);
      buildinguseData[site] = data;
      setProjectData((prev) => ({ ...prev, buildinguse: buildinguseData }));
    } else {
      setViewpoint(null);
    }

    return () => {
      map.off("dblclick", "buildinguse_selection", handleEditPolygon);
      map.off("draw.update", handleUpdatePolygon);
      map.off("draw.delete", handleTrashPolygon);
      map.off("draw.modechange", handleControlAddViewPoints);
      map.off("draw.create", handleCreateNew);
      map.off("contextmenu", "viewpoints", handleEditViewpoint);
    };
  }, [polygonTick, viewpoint]);

  useEffect(() => {
    function handleChangeModeChangeCursor() {
      if (draw.getMode() !== draw.modes.SIMPLE_SELECT)
        map.getCanvas().style.cursor = "crosshair";
      else map.getCanvas().style.cursor = "grab";
    }

    map.on("mousemove", handleChangeModeChangeCursor);

    return () => {
      map.off("mousemove", handleChangeModeChangeCursor);
    };
  }, []);

  return (
    <EditSideBar site={site} submitForm={submitScenario} drawTool={draw}>
      <AccordionCustom summary="Attributes">
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
            defaultValue={polygonTick?.height}
            formatLabel={(value) => `${value} m`}
            name="height"
            updateState={(val) =>
              setPolygonTick((prev) => ({ ...prev, height: Number(val) }))
            }
          />
        </div>
      </AccordionCustom>

      {viewpoint && (
        <AccordionCustom summary="View Point" detailStyles={{ gap: 20 }}>
          <AccordionCustom summary="Image Upload">
            {/* Image Components */}
            <div>
              {imagesUpload.filter((item) => item.id == viewpoint.properties.id)
                .length > 0 && (
                <>
                  <div className="flex gap-8 items-center mb-3">
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
                              action: () => handleResetImage(),
                            },
                          ]}
                        />
                      </span>
                    )}
                  </div>
                  <div className="max-h-[350px] overflow-auto">
                    <ImageList
                      style={{
                        display: "flex",
                        overflow: "auto",
                        width: "max-content",
                        padding: "6px",
                      }}
                      gap={8}
                    >
                      {imagesUpload
                        .filter((item) => item.id == viewpoint.properties.id)[0]
                        ?.images.map((img) => (
                          <ImageListItem key={img.name}>
                            <img
                              src={`${img.url}`}
                              className="!h-[300px]"
                              loading="lazy"
                            />
                          </ImageListItem>
                        ))}
                    </ImageList>
                  </div>
                </>
              )}

              {!(
                imagesUpload.filter(
                  (item) => item.id == viewpoint.properties.id
                ).length > 0
              ) && (
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
                onChange={handleUploadImages}
              />
            </div>
          </AccordionCustom>
        </AccordionCustom>
      )}

      {chartData && <ChartCustom chartData={chartData} />}
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
  const { siteChosen } = useContext(SiteChosenContext);
  const { buildinguseData, viewpointsData, siteSelectionData } =
    useContext(SiteDataContext);
  const { viewMode } = useContext(ViewModeContext);
  const { scenarioChosen } = useContext(EditModeData);

  const tableMaxWidth = 200,
    tableMaxHeight = 250;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);
  const [buildingIntersection, setBuildingIntersection] = useState(null);
  const [buildinguseStatistic, setBuildinguseStatistic] = useState(null);

  const [filterBuilding, setFilterBuilding] = useState(null);
  const [polygonChosen, setPolygonChosen] = useState(null);

  const [gallery, setGallery] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
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
      map.getMap().doubleClickZoom.enable();
      map.getCanvas().style.cursor = "grab";
    }

    function changePointer() {
      map.getMap().doubleClickZoom.disable();
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
    function handleChosenBuilding(e) {
      if (e.features[0].properties.id == polygonChosen?.properties.id) {
        setPolygonChosen(null);
      } else {
        const { type, properties, geometry } = e.features[0];
        setPolygonChosen({
          type,
          properties,
          geometry,
        });
      }
    }

    map.on("dblclick", "buildinguse_selection", handleChosenBuilding);

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

    return () => {
      map.off("dblclick", "buildinguse_selection", handleChosenBuilding);
    };
  }, [site, polygonChosen]);

  async function getViewpointsGallery(viewpoint_id) {
    setShowGallery(true);
    let ref = getRef(
      `nha_trang/media/${siteChosen.properties.id}/viewpoints/${scenarioChosen.name}/${viewpoint_id}`
    );
    const items = await listChilds(ref);
    const gallery = [];
    for (let item of items) {
      const url = await getDownloadUrl(item);
      const meta = await getMeta(item);
      if (meta.contentType.includes("image")) gallery.push(url);
    }
    setGallery(gallery);
  }

  useEffect(() => {
    async function handleShowViewpoint(e) {
      await getViewpointsGallery(e.features[0].id);
    }

    if (viewMode !== viewModeCons.edit) {
      map.on("contextmenu", "viewpoints", handleShowViewpoint);
    } else {
      map.off("contextmenu", "viewpoints", handleShowViewpoint);
    }

    return () => {
      map.off("contextmenu", "viewpoints", handleShowViewpoint);
    };
  }, [site, viewMode]);

  useEffect(() => {
    const dataChart = {
      typeChart: "pie",
      title: "Proportaion of buildinguse functions",
      labels: {},
      dataset: [{ backgroundColor: [], data: [] }],
      legend: {
        labels: {
          pointStyle: "circle",
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
        },
        opts: {
          position: "right",
        },
      },
    };

    const temp = [];
    CaseBuildinguseValues.forEach((buildinguse, id) => {
      if (id % 2 === 0) {
        dataChart.labels = { ...dataChart.labels, [buildinguse]: id };
        temp[id] = 0;
      } else {
        dataChart.dataset[0].backgroundColor.push(buildinguse);
      }
    });

    if (buildingIntersection) {
      buildingIntersection.features.forEach((feature) => {
        if (
          feature.properties.Buildsused &&
          temp[dataChart.labels[feature.properties.Buildsused]] >= 0
        )
          temp[dataChart.labels[feature.properties.Buildsused]]++;
      });
      dataChart.dataset[0].data = [...new Set(temp.filter((t) => t >= 0))];

      dataChart.labels = Object.keys(dataChart.labels);

      setBuildinguseStatistic(dataChart);
    }
  }, [site, buildingIntersection]);

  useEffect(() => {
    setPolygonChosen(null);
    setFilterBuilding(null);
  }, [viewMode]);

  return (
    <>
      {buildingIntersection && (
        <Source
          type="geojson"
          data={buildingIntersection}
          generateId={true}
          promoteId="id"
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

          {polygonChosen && (
            <>
              <Source
                type="geojson"
                data={viewpointsData[site]}
                generateId={true}
                promoteId="id"
                id={SourceID.viewpoints}
              >
                {/* Show Viewpoints */}
                <Layer
                  id="viewpoints"
                  // beforeId="chosen_building"
                  type="circle"
                  paint={{
                    "circle-color": "#FBB03B",
                    "circle-stroke-color": "white",
                    "circle-stroke-width": 2,
                  }}
                  filter={[
                    "==",
                    ["get", "id_build"],
                    polygonChosen.properties.id,
                  ]}
                />
              </Source>
              <Source type="geojson" data={polygonChosen}>
                {/* Show Decoration For Chosen Polygon */}
                <Layer
                  type="fill"
                  beforeId="viewpoints"
                  paint={{
                    "fill-color": "black",
                    "fill-opacity": 0.3,
                  }}
                  filter={
                    filterBuilding
                      ? ["==", ["get", "Buildsused"], filterBuilding]
                      : ["!=", ["get", "Buildsused"], null]
                  }
                />
                <Layer
                  type="line"
                  paint={{
                    "line-color": "#2A7D92",
                    "line-width": 2,
                  }}
                  filter={
                    filterBuilding
                      ? ["==", ["get", "Buildsused"], filterBuilding]
                      : ["!=", ["get", "Buildsused"], null]
                  }
                />
              </Source>
            </>
          )}
        </Source>
      )}

      {buildinguseStatistic && viewMode !== viewModeCons.edit && (
        <div className="fixed bottom-0 left-8">
          <ChartCustom chartData={buildinguseStatistic} />
        </div>
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

      {viewMode === viewModeCons.edit && (
        <Editor
          site={site}
          handleChangeChosenBuilding={setPolygonChosen}
          chartData={buildinguseStatistic}
        />
      )}

      {showGallery && (
        <PhotoSlide
          gallery={gallery}
          onCloseHandler={() => {
            setGallery(null);
            setShowGallery(false);
          }}
          isLoading={showGallery}
          setIsLoading={setShowGallery}
        />
      )}

      {/* {viewMode !== viewModeCons.edit && <ChartCustom chartData={} />} */}
    </>
  );
};

export default Buildinguse;
