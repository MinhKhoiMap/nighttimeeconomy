import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";

// Assets
import "react-photo-view/dist/react-photo-view.css";
import "./style.css";

// Data
import { SourceID, viewModeCons } from "../../../../constants";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../../SiteSelection/SiteSelection";
import { ViewModeContext } from "../../Details";
import chartdata from "../../../../assets/data/chartdata";

import locate from "../../../../assets/images/locate.png";
import PhotoSlide from "../../../../components/PhotoSlide/PhotoSlide";
import {
  getDownloadUrl,
  getRef,
  listChilds,
} from "../../../../services/firebaseStorage";

import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import ChartCustom from "../../../../components/ChartCustom/ChartCustom";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Input } from "../../../../components/ui/input";
import { Separator } from "../../../../components/ui/separator";
import {
  ChartBarStackedIcon,
  ChartColumnBigIcon,
  ChartPieIcon,
  ChevronsUpDownIcon,
  CirclePlusIcon,
} from "lucide-react";
import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import { EditModeData } from "../Interact";
import { uploadString } from "firebase/storage";
import { useToast } from "../../../../hooks/use-toast";

const Editor = ({ site }) => {
  const chartConfig = {
    pie: "pie",
    bar: "bar",
    likert: "likert",
    axis: {
      x: "x",
      y: "y",
    },
  };

  const { siteChosen } = useContext(SiteChosenContext);
  const { scenarioChosen } = useContext(EditModeData);

  const { toast } = useToast();

  const [chartData, setChartData] = useState({
    typeChart: chartConfig.pie,
    opts: { indexAxis: chartConfig.axis.x },
    title: "",
    labels: [""],
    dataset: [{ backgroundColor: ["#F6D776"], data: [0] }],
  });
  const [currentInput, setCurrentInput] = useState([0, 0]);
  const [isLoading, setIsLoading] = useState(false);

  function handleChangeChartType(val) {
    if (val !== chartConfig.pie) {
      if (val === chartConfig.bar) {
        setChartData({
          typeChart: chartConfig.bar,
          opts: {
            indexAxis: chartConfig.axis.x,
          },
          title: "",
          labels: [""],
          dataset: [{ backgroundColor: "#F6D776", data: [0], label: "" }],
        });
      } else {
        setChartData({
          typeChart: chartConfig.pie,
          opts: {
            indexAxis: chartConfig.axis.x,
            scales: {
              x: {
                stacked: true,
              },
              y: {
                stacked: true,
              },
            },
          },
          title: "",
          labels: [""],
          dataset: [{ backgroundColor: "#F6D776", data: [0], label: "" }],
        });
      }
    } else {
      setChartData({
        typeChart: chartConfig.pie,
        opts: { indexAxis: chartConfig.axis.x },
        title: "",
        labels: [""],
        dataset: [{ backgroundColor: ["#F6D776"], data: [0] }],
      });
    }
  }

  function handleChangeChartAxis(val) {
    setChartData((prev) => ({
      ...prev,
      opts: {
        indexAxis: val,
      },
    }));
  }

  function handleAddChartField(e) {
    e.preventDefault();

    if (chartData.typeChart === chartConfig.pie) {
      setChartData((prev) => ({
        ...prev,
        labels: [...prev.labels, ""],
        dataset: [
          {
            backgroundColor: [...prev.dataset[0].backgroundColor, "#F6D776"],
            data: [...prev.dataset[0].data, 0],
          },
        ],
      }));
    } else {
      setChartData((prev) => {
        const temp = JSON.parse(JSON.stringify(prev));

        temp.labels.push("");

        temp.dataset.forEach((sub) => {
          sub.data.push(0);
        });

        return temp;
      });
    }
  }

  function handleAddChartSubField(e) {
    e.preventDefault();
    setChartData((prev) => ({
      ...prev,
      dataset: [
        ...prev.dataset,
        {
          categoryPercentage: 1,
          barPercentage: 0.8,
          backgroundColor: "#F6D776",
          data: Array(prev.labels.length).fill(0),
          label: "",
        },
      ],
    }));
  }

  async function handleSaveChart(e) {
    e.preventDefault();
    setIsLoading(true);

    let ref = getRef(
      `/nha_trang/charts_data/${siteChosen.properties.id}/${scenarioChosen.name}/chart.json`
    );

    await uploadString(ref, JSON.stringify(chartData));

    toast({ title: "Save Chart Success!" });
    setIsLoading(false);
  }

  return (
    <EditSideBar site={site}>
      <AccordionCustom summary="Charts" className="edit-sidebar__accordion">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="w-full rounded-b-none">
            <TabsTrigger value="edit" className="flex-1">
              Edit Data
            </TabsTrigger>
            <TabsTrigger
              value="view"
              className="flex-1 text-black viewchart-btn"
              disabled={!(chartData.labels[0] !== "")}
            >
              View Chart
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="edit"
            className="m-0 border border-[#363636] px-4 pb-2"
          >
            <div className="flex items-center gap-2 mt-3">
              <Input
                type="text"
                placeholder="Chart Name..."
                name="title"
                className="text-black"
                value={chartData.title}
                onChange={(e) => {
                  setChartData((prev) => ({ ...prev, title: e.target.value }));
                }}
              />
              {/* Chart Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="bg-white text-black flex items-center rounded-sm px-3 py-2 flex-shrink-0">
                  Chart Options <ChevronsUpDownIcon height={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[9999]">
                  <DropdownMenuLabel>Type</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#ce2027]" />
                  {/* Chart Type Menu */}
                  <DropdownMenuRadioGroup
                    value={chartData.typeChart}
                    onValueChange={handleChangeChartType}
                  >
                    <DropdownMenuRadioItem value={chartConfig.pie}>
                      <div className="flex w-full justify-between items-center">
                        <span className="text-sm">Pie</span>
                        <ChartPieIcon width={16} />
                      </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={chartConfig.bar}>
                      <div className="flex w-full justify-between items-center">
                        <span className="text-sm">Bar</span>
                        <ChartColumnBigIcon width={16} />
                      </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={chartConfig.likert}>
                      <div className="flex w-full justify-between items-center">
                        <span className="text-sm">Likert</span>
                        <ChartBarStackedIcon width={16} />
                      </div>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Axis</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#ce2027]" />
                  {/* Chart Axis Menu */}
                  <DropdownMenuRadioGroup
                    value={chartData.opts.indexAxis}
                    onValueChange={handleChangeChartAxis}
                  >
                    <DropdownMenuRadioItem value={chartConfig.axis.x}>
                      <div className="flex w-full justify-between items-center">
                        <span className="text-sm">X</span>
                      </div>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value={chartConfig.axis.y}>
                      <div className="flex w-full justify-between items-center">
                        <span className="text-sm">Y</span>
                      </div>
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Add Fields */}
            <div>
              <Separator className="mt-2" />
              <div className="pt-2">
                {chartData.typeChart === chartConfig.pie && (
                  <>
                    {chartData.labels.map((label, index) => (
                      <div className="flex gap-3 my-2" key={label}>
                        <div className="flex w-1/2 pr-2 items-center bg-white rounded-sm">
                          <Input
                            autoFocus
                            className="flex-1 mr-2 text-black"
                            placeholder={`Label ${index + 1}...`}
                            value={chartData.labels[index]}
                            onChange={(e) =>
                              setChartData((prev) => {
                                const temp = JSON.parse(JSON.stringify(prev));
                                temp.labels[index] = e.target.value;

                                return temp;
                              })
                            }
                          />
                          <input
                            type="color"
                            className="w-5"
                            value={chartData.dataset[0].backgroundColor[index]}
                            onChange={(e) =>
                              setChartData((prev) => {
                                const temp = JSON.parse(JSON.stringify(prev));
                                temp.dataset[0].backgroundColor[index] =
                                  e.target.value;

                                return temp;
                              })
                            }
                          />
                        </div>
                        <Input
                          className="w-1/2 text-black"
                          placeholder={`Number ${index + 1}...`}
                          value={chartData.dataset[0].data[index]}
                          type="number"
                          onChange={(e) =>
                            setChartData((prev) => {
                              const temp = JSON.parse(JSON.stringify(prev));
                              temp.dataset[0].data[index] = e.target.value;

                              return temp;
                            })
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
                {chartData.typeChart === chartConfig.bar && (
                  <>
                    {chartData.labels.map((label, label_index) => (
                      <Collapsible defaultOpen className="my-5" key={label}>
                        <div className="flex">
                          <Input
                            className="text-black"
                            placeholder={`Label ${label_index + 1}...`}
                            value={chartData.labels[label_index]}
                            autoFocus={label_index === currentInput[0]}
                            onChange={(e) => {
                              setCurrentInput([label_index, null]);
                              setChartData((prev) => {
                                const temp = JSON.parse(JSON.stringify(prev));

                                temp.labels[label_index] = e.target.value;

                                return temp;
                              });
                            }}
                          />
                          <CollapsibleTrigger>
                            <ChevronsUpDownIcon />
                          </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="ml-6">
                          {chartData.dataset.map((sub, index) => (
                            <div className="flex gap-3 my-2" key={sub.label}>
                              <div className="flex w-1/2 pr-2 items-center bg-white rounded-sm">
                                <Input
                                  className="flex-1 mr-2 text-black"
                                  placeholder={`Sublabel ${index + 1}...`}
                                  autoFocus={
                                    currentInput[0] == label_index &&
                                    currentInput[1] == index
                                  }
                                  value={sub.label}
                                  onChange={(e) => {
                                    setChartData((prev) => {
                                      const temp = JSON.parse(
                                        JSON.stringify(prev)
                                      );
                                      temp.dataset[index].label =
                                        e.target.value;

                                      return temp;
                                    });
                                    setCurrentInput([label_index, index]);
                                  }}
                                />
                                <input
                                  type="color"
                                  className="w-5"
                                  value={sub.backgroundColor}
                                  onChange={(e) =>
                                    setChartData((prev) => {
                                      const temp = JSON.parse(
                                        JSON.stringify(prev)
                                      );
                                      temp.dataset[index].backgroundColor =
                                        e.target.value;

                                      return temp;
                                    })
                                  }
                                />
                              </div>
                              <Input
                                className="w-1/2 text-black"
                                placeholder={`Number ${index + 1}...`}
                                type="number"
                                value={sub.data[label_index]}
                                onChange={(e) =>
                                  setChartData((prev) => {
                                    const temp = JSON.parse(
                                      JSON.stringify(prev)
                                    );
                                    temp.dataset[index].data[label_index] =
                                      e.target.value;

                                    return temp;
                                  })
                                }
                              />
                            </div>
                          ))}
                          <button
                            onClick={handleAddChartSubField}
                            className="flex justify-center mt-4 bg-transparent border border-[#7A7D81] rounded-md w-full py-2 hover:bg-[#A8A8A8] transition-colors"
                          >
                            <CirclePlusIcon />
                          </button>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </>
                )}

                <button
                  onClick={handleAddChartField}
                  className="flex justify-center mt-4 bg-transparent border border-[#7A7D81] rounded-md w-full py-2 hover:bg-[#A8A8A8] transition-colors"
                >
                  <CirclePlusIcon />
                </button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="view">
            <ChartCustom chartData={chartData} />
          </TabsContent>
        </Tabs>
        <span className="text-xs italic text-[#ce2027]">
          * If you switch to another mode (buildinguse, landuse,...) without
          save the chart, the chart data will be lost!
        </span>
        <button
          onClick={handleSaveChart}
          className="text-white text-lg w-full p-[6px] bg-black rounded-md border border-[#ccc] font-bold"
          type="button"
        >
          Save Chart
        </button>
      </AccordionCustom>
      {isLoading && <loading />}
    </EditSideBar>
  );
};

const Interview = ({ site }) => {
  const { interviewPointData } = useContext(SiteDataContext);
  const { siteChosen } = useContext(SiteChosenContext);
  const { viewMode } = useContext(ViewModeContext);
  const { scenarioChosen } = useContext(EditModeData);

  const { map } = useMap();

  const [imageGallery, setImageGallery] = useState(null);
  const [show, setShow] = useState(false);
  const [chartData, setChartData] = useState(null);

  const savedHandleInterviewClickFunction = useRef();

  // useRef to save the last version so we can easily remove the last function
  const showInterviewGallery = useCallback(
    async (e) => {
      setShow(true);
      const siteID = siteChosen.properties.id;
      let id = e.features[0].properties.id;
      let galleryRef = getRef(`/nha_trang/media/${siteID}/interview/${id}`);
      let imgsRef = await listChilds(galleryRef);
      let gallery = [];
      for (let ref of imgsRef) {
        let url = await getDownloadUrl(ref);
        gallery.push(url);
      }
      setImageGallery(gallery);
    },
    [siteChosen]
  );

  useEffect(() => {
    // Use to remove the last function (on the previous render which had old value)
    if (savedHandleInterviewClickFunction.current)
      map.off(
        "click",
        "interview_point",
        savedHandleInterviewClickFunction.current
      );

    savedHandleInterviewClickFunction.current = showInterviewGallery;
    map.on("click", "interview_point", showInterviewGallery);
  }, [siteChosen]);

  useEffect(() => {
    async function loadChart() {
      let ref = getRef(
        `nha_trang/charts_data/${siteChosen.properties.id}/${scenarioChosen.name}/chart.json`
      );
      const url = await getDownloadUrl(ref);
      const res = await fetch(url);
      const data = await res.json();

      setChartData(data);
    }

    if (typeof scenarioChosen !== "string") {
      loadChart();
    } else {
      setChartData(chartdata[site]);
    }
  }, [scenarioChosen]);

  // Loading image icon for location and set event listeners for click point
  useEffect(() => {
    map.loadImage(locate, (err, image) => {
      if (err) throw err;

      if (!map.hasImage("locate")) {
        map.addImage("locate", image);
      }
    });

    map.on("mouseover", "interview_point", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "interview_point", () => {
      map.getCanvas().style.cursor = "grab";
    });
  }, []);

  return (
    <>
      <Source
        type="geojson"
        data={interviewPointData[site]}
        id={SourceID.interview}
      >
        <Layer
          id="interview_point"
          type="symbol"
          layout={{
            "icon-image": "locate",
            "icon-size": 0.06,
          }}
          paint={{
            "icon-color": "black",
          }}
        />
      </Source>

      {show && (
        <PhotoSlide
          gallery={imageGallery}
          onCloseHandler={() => {
            setImageGallery(null);
            setShow(false);
          }}
          isLoading={show}
          setIsLoading={setShow}
        />
      )}

      {!imageGallery && show && <loading />}

      {viewMode !== viewModeCons.edit && chartData && (
        <div className="w-[500px] h-[300px] fixed bottom-5 left-8">
          <ChartCustom chartData={chartData} />
        </div>
      )}

      {viewMode === viewModeCons.edit && <Editor site={site} />}
    </>
  );
};

export default Interview;
