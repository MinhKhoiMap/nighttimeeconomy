import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import * as turf from "@turf/turf";
import { toast, useToast } from "../../../../hooks/use-toast";
import "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import $ from "jquery";
import firebaseAuth from "../../../../services/firebaseAuth";
import path from "path";

// Assets
import settings from "../../../../assets/images/settings.json";
import reload from "../../../../assets/images/reload.json";
import "./style.css";

// Data
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
import { ViewModeContext } from "../../Details";

// Services
import {
  getDownloadUrl,
  getMeta,
  getRef,
  listChilds,
  updloadFile,
  updloadScenario,
} from "../../../../services/firebaseStorage";
import { uploadString } from "firebase/storage";

// Components
import InfoTable from "../../../../components/InfoTable/InfoTable";
import AnnotationTable from "../../../../components/AnnotationTable/AnnotationTable";
import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import RadioGroups from "../../../../components/RadioGroups/RadioGroups";
import ChartCustom from "../../../../components/ChartCustom/ChartCustom";
import { ImageList, ImageListItem } from "@mui/material";
import LottieIcon from "../../../../components/LottieIcon/LottieIcon";
import SpeedDialCustom from "../../../../components/SpeedDialCustom/SpeedDialCustom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../../components/ui/carousel";
import { Image } from "antd";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../components/ui/alert";
import { Skeleton } from "antd";
import { MessageCircleWarningIcon } from "lucide-react";

const draw = new MapboxDraw({
  controls: {
    polygon: true,
    trash: true,
    combine_features: false,
    uncombine_features: false,
    line_string: false,
    point: false,
  },
});

class EditHistories {
  done = []; // The version in the past
  undone = []; // When undo, this will store the previous verison

  // V1 V2 V3 V4 V5
  // [done]||[undone]

  constructor() {}

  getStorageSize(object) {
    const objectList = [];
    const stack = [object];
    let bytes = 0;

    while (stack.length) {
      const value = stack.pop();

      switch (typeof value) {
        case "boolean":
          bytes += 4;
          break;
        case "string":
          bytes += value.length * 2;
          break;
        case "number":
          bytes += 8;
          break;
        case "object":
          if (!objectList.includes(value)) {
            objectList.push(value);
            for (const prop in value) {
              if (value.hasOwnProperty(prop)) {
                stack.push(value[prop]);
              }
            }
          }
          break;
      }
    }

    return bytes / 1048576;
  }

  pushHistory(geojsonData) {
    // if (!(this.getStorageSize(this.done) <= 2)) this.done.shift();
    this.done.push(geojsonData);
    return this.done;
  }

  undoVer() {
    return this.done.pop();
  }
}

const editHistories = new EditHistories();
const Editor = ({ site, handleChangeChosenLanduse, chartData }) => {
  const { siteChosen } = useContext(SiteChosenContext);
  const {
    activitiesData,
    landuseData,
    buildinguseData,
    interviewPointData,
    setProjectData,
  } = useContext(SiteDataContext);
  const { scenarioChosen } = useContext(EditModeData);

  const [polygonTick, setPolygonTick] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagesUpload, setImagesUpload] = useState([]);
  const [active, setActive] = useState(false);

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

    if (imagesUpload.length > 0) {
      for (let media of imagesUpload) {
        let ref = `/nha_trang/media/${siteChosen.properties.id}/design_images/${scenario}/landuse/${media.id}`;
        for (let img of media.images) {
          if (img.file) await updloadFile(`${ref}/${img.file.name}`, img.file);
          await uploadString(
            getRef(`${ref}/${img?.file?.name || img.name}.json`),
            img.text
          );
        }
      }
      console.log(`Upload images successfully`);
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
          if (media.id == polygonTick.id) temp = media;
          return media.id != polygonTick.id;
        });

        if (filterMedia.length == prev.length) {
          return [...prev, { id: polygonTick.id, images: imgs }];
        } else {
          temp.images = imgs;
          return [...filterMedia, temp];
        }
      });
    }
  }

  function handleResetImage() {
    setImagesUpload((prev) => {
      return prev.filter((media) => media.id != polygonTick.id);
    });
  }

  const handleEditPolygon = useCallback(
    async (e) => {
      map.getMap().doubleClickZoom.disable();
      if (e.features[0].properties.id == polygonTick?.id) {
        setPolygonTick({});
        handleChangeChosenLanduse(null);
        draw.delete(e.features[0].id);
        setImagesUpload([]);
      } else {
        setPolygonTick({
          id: e.features[0].properties.id,
          landuse: e.features[0].properties["Landuse"],
        });

        draw.deleteAll();
        draw.add(e.features[0]);

        const feature_id = e.features[0].properties.id;

        if (typeof scenarioChosen === "string") {
          toast({ title: "This area hasn't had any images yet" });
          return;
        }

        let ref = getRef(
          `nha_trang/media/${siteChosen.properties.id}/design_images/${scenarioChosen.name}/landuse/${feature_id}`
        );

        const items = await listChilds(ref);
        if (items.length > 0) {
          setActive(true);
          const gallery = [];
          for (let item of items) {
            const url = await getDownloadUrl(item);
            const meta = await getMeta(item);
            if (meta.contentType.includes("image"))
              gallery.push({ name: item.name, url });
            else {
              const res = await fetch(url);
              const data = await res.text();
              const basename = path.basename(item.name, ".json");

              for (const img of gallery)
                if (img.name == basename) {
                  img.text = data;
                  break;
                }
            }
          }

          setImagesUpload((prev) => {
            let data = JSON.parse(JSON.stringify(prev));
            const arr = data.filter((img) => img.id != feature_id);

            return [...arr, { id: feature_id, images: gallery }];
          });

          setActive(false);
        }
      }
    },
    [polygonTick, scenarioChosen]
  );

  const handleTrashPolygon = useCallback(() => {
    let data = JSON.parse(JSON.stringify(landuseData[site]));
    editHistories.pushHistory(JSON.parse(JSON.stringify(landuseData[site])));

    data.features = data.features.filter(
      (polygon) => polygon.properties.id != polygonTick.id
    );

    handleChangeChosenLanduse(null);

    map.getSource(SourceID.landuse).setData(data);
    landuseData[site] = data;
    setProjectData((prev) => ({ ...prev, landuse: landuseData }));
  }, [polygonTick, landuseData]);

  const handleUpdatePolygon = useCallback(
    (e) => {
      let data = JSON.parse(JSON.stringify(landuseData[site])),
        temp;

      data.features = data.features.filter((polygon) => {
        if (polygon.properties.id == polygonTick.id) temp = polygon;
        return polygon.properties.id != polygonTick.id;
      });

      temp.geometry = e.features[0].geometry;

      data.features.push(temp);

      map.getSource(SourceID.landuse).setData(data);
      landuseData[site] = data;
      // editHistories.pushHistory(data);
      setProjectData((prev) => ({ ...prev, landuse: landuseData }));
    },
    [polygonTick, landuseData]
  );

  useEffect(() => {
    map.on("dblclick", "landuse_selection", handleEditPolygon);
    map.on("draw.update", handleUpdatePolygon);
    map.on("draw.delete", handleTrashPolygon);

    //  Handle Update Scenario State
    if (polygonTick?.landuse && polygonTick?.id) {
      let data = JSON.parse(JSON.stringify(landuseData[site])),
        temp;

      data.features = data.features.filter((polygon) => {
        if (polygon.properties.id === polygonTick.id) temp = polygon;
        return polygon.properties.id !== polygonTick.id;
      });

      temp.properties.Landuse = polygonTick.landuse;

      data.features.push(temp);

      handleChangeChosenLanduse(temp);

      map.getSource(SourceID.landuse).setData(data);
      landuseData[site] = data;
      setProjectData((prev) => ({ ...prev, landuse: landuseData }));
    }

    return () => {
      map.off("dblclick", "landuse_selection", handleEditPolygon);
      map.off("draw.update", handleUpdatePolygon);
      map.off("draw.delete", handleTrashPolygon);
      map.getMap().doubleClickZoom.enable();
    };
  }, [polygonTick, scenarioChosen]);

  useEffect(() => {
    function handleCreateNewPolyon(e) {
      let data = JSON.parse(JSON.stringify(landuseData[site]));

      const { id, ...feature } = e.features[0];

      data.features.push({
        ...feature,
        properties: {
          id,
          landuse: CaseLanduseValues[0],
        },
      });

      map.getSource(SourceID.landuse).setData(data);
      landuseData[site] = data;
      editHistories.pushHistory(data);
      setProjectData((prev) => ({ ...prev, landuse: landuseData }));
      setPolygonTick({
        id,
      });
    }

    map.on("draw.create", handleCreateNewPolyon);

    return () => {
      map.off("draw.create", handleCreateNewPolyon);
    };
  }, [site]);

  function handleUndoDraw() {
    const version = editHistories.undoVer();
    console.log(version, "version");
    map.getSource(SourceID.landuse).setData(version);
    landuseData[site] = version;
    setProjectData((prev) => ({ ...prev, landuse: landuseData }));
  }

  useEffect(() => {
    function handleChangeModeChangeCursor() {
      if (draw.getMode() !== draw.modes.SIMPLE_SELECT)
        map.getCanvas().style.cursor = "crosshair";
      else map.getCanvas().style.cursor = "grab";
    }

    map.on("mousemove", handleChangeModeChangeCursor);

    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-rotate-left", "text-black", "text-sm");
    const button = document.createElement("button");
    button.classList.add("mapbox-gl-draw_ctrl-draw-btn", "mapbox-gl-undo");
    button.appendChild(icon);
    button.onclick = handleUndoDraw;
    button.title = "Undo";

    $(
      ".mapboxgl-control-container .mapboxgl-ctrl-top-right .mapboxgl-ctrl-group.mapboxgl-ctrl"
    ).append([button]);

    return () => {
      map.off("mousemove", handleChangeModeChangeCursor);
    };
  }, []);

  return (
    <EditSideBar site={site} submitForm={submitScenario} drawTool={draw}>
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

      {polygonTick?.id && (
        <AccordionCustom summary="Project Images" detailStyles={{ gap: 20 }}>
          <AccordionCustom summary="Image Upload">
            {/* Image Components */}
            <div>
              {imagesUpload.filter((item) => item.id == polygonTick.id).length >
                0 && (
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
                        .filter((item) => item.id == polygonTick.id)[0]
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
                imagesUpload.filter((item) => item.id == polygonTick.id)
                  .length > 0
              ) && (
                <form
                  onClick={() => $(".input-field").click()}
                  className="w-full h-[200px] flex items-center justify-center rounded-lg border-[2px] border-dashed border-[#1475cf] hover:brightness-150 transition-all cursor-pointer"
                >
                  {!active && (
                    <h3 className="flex items-center gap-3 font-bold">
                      Browse Files to upload
                      <i className="fa-solid fa-cloud-arrow-up text-[#1475cf] text-2xl"></i>
                    </h3>
                  )}
                  <Skeleton.Image active={active} />
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
          {imagesUpload.length > 0 &&
            imagesUpload.filter(
              (img) => img.id == polygonTick.id && img.images.length > 0
            ).length > 0 && (
              <AccordionCustom summary="Text">
                {imagesUpload
                  .filter((img) => img.id == polygonTick.id)[0]
                  ?.images.map((img, index) => (
                    <div key={img.name}>
                      <label className="text-white" htmlFor={img.name}>
                        {`Image ${index + 1}: `}
                      </label>
                      <Textarea
                        className="mt-2 text-black"
                        placeholder={`Type your text for image ${
                          index + 1
                        } here.`}
                        id={img.name}
                        defaultValue={img.text}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val) {
                            let temp = null;
                            const imgUpload = imagesUpload.filter((item) => {
                              if (item.id == polygonTick.id) temp = item;

                              return item.id != polygonTick.id;
                            });

                            for (const i of temp.images) {
                              if (i.name == img.name) {
                                i.text = val;
                                break;
                              }
                            }

                            console.log([...imgUpload, temp]);

                            setImagesUpload(() => [...imgUpload, temp]);
                          }
                        }}
                      />
                    </div>
                  ))}
              </AccordionCustom>
            )}
          <Alert className="border border-[#D14537] bg-transparent">
            <MessageCircleWarningIcon
              className="h-5 w-5 mt-[2px]"
              color="#F88B56"
            />
            <AlertTitle className="text-base text-[#F88B56] ">
              Warning!
            </AlertTitle>
            <AlertDescription className="text-sm italic text-white">
              If you switch to another polygon without save the images and
              texts, the data will be lost!
            </AlertDescription>
          </Alert>
        </AccordionCustom>
      )}

      <div className="px-10 h-[500px] flex justify-center">
        {chartData && <ChartCustom chartData={chartData} />}
      </div>

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
  const { scenarioChosen } = useContext(EditModeData);
  const { siteChosen } = useContext(SiteChosenContext);

  const tableMaxWidth = 300,
    tableMaxHeight = 350;

  const mouseDivRef = useRef();
  const { map } = useMap();

  const [infoTablePosition, setInfoTablePosition] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [infoTable, setInfoTable] = useState([]);
  const [landuseStatistic, setLanduseStatistic] = useState(null);

  const [filterLand, setFilterLand] = useState(null);
  const [polygonChosen, setPolygonChosen] = useState(null);

  const [gallery, setGallery] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    // Handling show info tag when hover on layer (land polygon)
    function controlInfoTable(e) {
      setShowTable(true);

      // let hoveredPolygonId = e.features[0].id;

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

  // Handle Chart
  useEffect(() => {
    const dataChart = {
      typeChart: "pie",
      title: "Proportaion of landuse functions",
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

    const temp = [],
      labels_index = [];
    CaseLanduseValues.forEach((item, id) => {
      if (id % 2 === 0) {
        dataChart.labels = { ...dataChart.labels, [item]: labels_index.length };
        temp[labels_index.length] = 0;
        labels_index.push(item);
      } else {
        dataChart.dataset[0].backgroundColor.push(item);
      }
    });

    if (landuseData[site]) {
      landuseData[site].features.forEach((feature) => {
        if (
          feature.properties.Landuse &&
          temp[dataChart.labels[feature.properties.Landuse]] >= 0
        )
          temp[dataChart.labels[feature.properties.Landuse]]++;
      });

      dataChart.dataset[0].data = temp;
      dataChart.labels = Object.keys(dataChart.labels);

      setLanduseStatistic(dataChart);
    }
  }, [site, landuseData[site]]);

  async function getDesignImagesGallery(landuse_id) {
    setShowGallery(true);
    let ref = getRef(
      `nha_trang/media/${siteChosen.properties.id}/design_images/${scenarioChosen.name}/landuse/${landuse_id}`
    );

    const items = await listChilds(ref);
    const gallery = [];
    for (let item of items) {
      const url = await getDownloadUrl(item);
      const meta = await getMeta(item);
      if (meta.contentType.includes("image"))
        gallery.push({ name: item.name, url });
      else {
        const res = await fetch(url);
        const data = await res.text();
        const basename = path.basename(item.name, ".json");

        for (const img of gallery)
          if (img.name == basename) {
            img.text = data;
            break;
          }
      }
    }
    if (gallery.length > 0) {
      setGallery(gallery);
    } else {
      setShowGallery(false);
      toast({ title: "This area hasn't had any images yet" });
    }
  }

  useEffect(() => {
    async function handleShowGallery(e) {
      await getDesignImagesGallery(e.features[0].id);
    }

    if (viewMode !== viewModeCons.edit) {
      map.on("dblclick", "landuse_selection", handleShowGallery);
    } else {
      map.off("dblclick", "landuse_selection", handleShowGallery);
    }

    return () => {
      map.off("dblclick", "landuse_selection", handleShowGallery);
    };
  }, [site, viewMode, scenarioChosen]);

  return (
    <>
      {site && (
        <Source
          type="geojson"
          data={landuseData[site]}
          id="landuse"
          generateId={true}
          promoteId="id"
        >
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

      {landuseStatistic && viewMode !== viewModeCons.edit && (
        <div className="fixed bottom-0 left-8">
          <ChartCustom chartData={landuseStatistic} />
        </div>
      )}

      {/* Draw Border For Chosen Polygon */}
      {polygonChosen && viewMode === viewModeCons.edit && (
        <Source type="geojson" data={polygonChosen}>
          <Layer
            type="fill"
            paint={{
              "fill-color": "black",
              "fill-opacity": 0.3,
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
        <Editor
          site={site}
          handleChangeChosenLanduse={setPolygonChosen}
          chartData={landuseStatistic}
        />
      )}

      {/* {showGallery && (
        <PhotoSlide
          gallery={gallery}
          onCloseHandler={() => {
            setGallery(null);
            setShowGallery(false);
          }}
          isLoading={showGallery}
          setIsLoading={setShowGallery}
        />
      )} */}

      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogOverlay className="z-[999]" />
        <DialogContent className="w-[90vw] h-[80vh] !max-w-none z-[9999]">
          <DialogTitle className="h-fit"></DialogTitle>
          <DialogDescription></DialogDescription>
          <Carousel className="w-[87vw] h-[70vh]">
            <CarouselContent className="h-full">
              {gallery &&
                gallery.map((item) => (
                  <CarouselItem key={item.name}>
                    <div className="p-1 w-[87vw] h-[70vh]">
                      <div
                        className="h-[70vh] w-[87vw] flex gap-8"
                        key={item.name}
                      >
                        <figure className="flex-1 h-full">
                          <Image
                            width="100%"
                            height="100%"
                            preview={false}
                            src={item.url}
                            maskClassName="z-[999999]"
                            rootClassName="z-[999999]"
                          />
                        </figure>
                        {item.text && (
                          <span className="text-black flex-1">{item.text}</span>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Landuse;
