import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import { useToast } from "../../../../hooks/use-toast";

// Assets
import "react-photo-view/dist/react-photo-view.css";
import "./style.css";
import locate from "../../../../assets/images/locate.png";
import chartdata from "../../../../assets/data/chartdata";
import {
  ChartBarStackedIcon,
  ChartColumnBigIcon,
  ChartPieIcon,
  ChevronsUpDownIcon,
  CirclePlusIcon,
  MessageCircleWarningIcon,
} from "lucide-react";

// Data
import { SourceID, viewModeCons } from "../../../../constants";
import {
  SiteChosenContext,
  SiteDataContext,
} from "../../../SiteSelection/SiteSelection";
import { ViewModeContext } from "../../Details";

// Services
import {
  getDownloadUrl,
  getRef,
  listChilds,
} from "../../../../services/firebaseStorage";
import { uploadString } from "firebase/storage";

import EditSideBar from "../../../../components/EditSideBar/EditSideBar";
import ChartCustom from "../../../../components/ChartCustom/ChartCustom";
import PhotoSlide from "../../../../components/PhotoSlide/PhotoSlide";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../components/ui/alert";

import AccordionCustom from "../../../../components/AccordionCustom/AccordionCustom";
import { EditModeData } from "../Interact";

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

  const [chartData, setChartData] = useState([
    {
      id: 0,
      typeChart: chartConfig.pie,
      opts: { indexAxis: chartConfig.axis.x },
      title: "",
      labels: [""],
      dataset: [{ backgroundColor: ["#F6D776"], data: [0] }],
    },
  ]);
  const [currentInput, setCurrentInput] = useState([0, 0]);
  const [isLoading, setIsLoading] = useState(false);

  function handleChangeChartType(val, id) {
    if (val !== chartConfig.pie) {
      if (val === chartConfig.bar) {
        setChartData((prev) => {
          const temp = {
            id,
            typeChart: chartConfig.bar,
            opts: {
              indexAxis: chartConfig.axis.x,
            },
            title: "",
            labels: [""],
            dataset: [{ backgroundColor: "#F6D776", data: [0], label: "" }],
          };

          const list = JSON.parse(JSON.stringify(prev));
          const filter = list.filter((chart) => chart.id != id);

          filter.splice(id, 0, temp);

          return filter;
        });
      } else {
        setChartData((prev) => {
          const temp = {
            id,
            typeChart: chartConfig.likert,
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
          };

          const list = JSON.parse(JSON.stringify(prev));
          const filter = list.filter((chart) => chart.id != id);

          filter.splice(id, 0, temp);

          return filter;
        });
      }
    } else {
      setChartData((prev) => {
        const temp = {
          id,
          typeChart: chartConfig.pie,
          opts: { indexAxis: chartConfig.axis.x },
          title: "",
          labels: [""],
          dataset: [{ backgroundColor: ["#F6D776"], data: [0] }],
        };

        const list = JSON.parse(JSON.stringify(prev));
        const filter = list.filter((chart) => chart.id != id);

        filter.splice(id, 0, temp);

        return filter;
      });
    }
  }

  function handleChangeChartAxis(val, id) {
    setChartData((prev) => {
      let temp = null;

      const list = JSON.parse(JSON.stringify(prev));

      const filter = list.filter((chart) => {
        if (chart.id == id) temp = chart;

        return chart.id != id;
      });

      temp.opts.indexAxis = val;

      filter.splice(id, 0, temp);

      return filter;
    });
  }

  function handleAddChartField(e, id) {
    e.preventDefault();

    if (
      chartConfig.pie == chartData[id].typeChart &&
      chartData[id].labels.length >= 4
    ) {
      toast({
        title: "You have reached the maximum number of labels!",
        variant: "destructive",
      });
      return;
    }

    if (chartData[id].typeChart == chartConfig.pie) {
      setChartData((prev) => {
        let temp = null;

        const list = JSON.parse(JSON.stringify(prev));

        const filter = list.filter((chart) => {
          if (chart.id == id) temp = chart;

          return chart.id != id;
        });

        temp.labels.push("");
        console.log(temp.dataset[0].backgroundColor);
        temp.dataset[0].backgroundColor.push(
          "#000000".replace(/0/g, function () {
            return (~~(Math.random() * 16)).toString(16);
          })
        );
        temp.dataset[0].data.push(0);

        filter.splice(id, 0, temp);

        return filter;
      });
    } else {
      setChartData((prev) => {
        let temp = null;

        const list = JSON.parse(JSON.stringify(prev));

        const filter = list.filter((chart) => {
          if (chart.id == id) temp = chart;

          return chart.id != id;
        });

        temp.labels.push("");

        temp.dataset.forEach((sub) => {
          sub.data.push(0);
        });

        filter.splice(id, 0, temp);

        return filter;
      });
    }
  }

  function handleAddChartSubField(e, id) {
    e.preventDefault();
    setChartData((prev) => {
      if (chartData[id].dataset.length >= 4) {
        toast({
          title: "You have reached the maximum number of labels!",
          variant: "destructive",
        });

        return prev;
      }

      let temp = null;

      const list = JSON.parse(JSON.stringify(prev));

      const filter = list.filter((chart) => {
        if (chart.id == id) temp = chart;

        return chart.id != id;
      });

      temp.dataset.push({
        categoryPercentage: 1,
        barPercentage: 0.8,
        backgroundColor: "#000000".replace(/0/g, function () {
          return (~~(Math.random() * 16)).toString(16);
        }),
        data: Array(temp.labels.length).fill(0),
        label: "",
      });

      filter.splice(id, 0, temp);

      return filter;
    });
  }

  function handleAddChart() {
    setChartData((prev) => [
      ...prev,
      {
        id: chartData.length,
        typeChart: chartConfig.pie,
        opts: { indexAxis: chartConfig.axis.x },
        title: "",
        labels: [""],
        dataset: [{ backgroundColor: ["#F6D776"], data: [0] }],
      },
    ]);
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

    loadChart();
  }, [site, scenarioChosen]);

  return (
    <EditSideBar site={site}>
      <AccordionCustom summary="Charts" className="edit-sidebar__accordion">
        {chartData?.length > 0 &&
          chartData.map((chart, index) => {
            console.log(chart, chartData);

            return (
              <Tabs defaultValue="edit" className="w-full" key={chart.id}>
                <TabsList className="w-full rounded-b-none">
                  <TabsTrigger value="edit" className="flex-1">
                    Edit Data
                  </TabsTrigger>
                  <TabsTrigger
                    value="view"
                    className="flex-1 text-black viewchart-btn"
                    disabled={!(chart.labels[0] !== "")}
                  >
                    View Chart
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="edit"
                  className="m-0 border border-[#363636] px-4 pb-2"
                >
                  {/* Config Chart */}
                  <div className="flex items-center gap-2 mt-3">
                    <Input
                      type="text"
                      placeholder="Chart Name..."
                      name="title"
                      className="text-black"
                      value={chart.title}
                      onChange={(e) => {
                        setChartData((prev) => {
                          let temp = null;

                          const list = JSON.parse(JSON.stringify(prev));

                          const filter = list.filter((chart) => {
                            if (chart.id == index) temp = chart;

                            return chart.id != index;
                          });
                          temp.title = e.target.value;

                          filter.splice(index, 0, temp);

                          return filter;
                        });
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
                          value={chart.typeChart}
                          onValueChange={(val) =>
                            handleChangeChartType(val, index)
                          }
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
                          value={chart.opts.indexAxis}
                          onValueChange={(val) =>
                            handleChangeChartAxis(val, index)
                          }
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
                      {chart.typeChart === chartConfig.pie && (
                        <>
                          {chart.labels.map((label, id) => (
                            <div className="flex gap-3 my-2" key={label}>
                              <div className="flex w-1/2 pr-2 items-center bg-white rounded-sm">
                                <Input
                                  autoFocus
                                  className="flex-1 mr-2 text-black"
                                  placeholder={`Label ${id + 1}...`}
                                  value={chart.labels[id]}
                                  onChange={(e) =>
                                    setChartData((prev) => {
                                      let temp = null;

                                      const list = JSON.parse(
                                        JSON.stringify(prev)
                                      );

                                      const filter = list.filter((chart) => {
                                        if (chart.id == index) temp = chart;

                                        return chart.id != index;
                                      });

                                      temp.labels[id] = e.target.value;

                                      filter.splice(index, 0, temp);

                                      return filter;
                                    })
                                  }
                                />
                                <input
                                  type="color"
                                  className="w-5"
                                  value={chart.dataset[0].backgroundColor[id]}
                                  onChange={(e) =>
                                    setChartData((prev) => {
                                      let temp = null;

                                      const list = JSON.parse(
                                        JSON.stringify(prev)
                                      );

                                      const filter = list.filter((chart) => {
                                        if (chart.id == index) temp = chart;

                                        return chart.id != index;
                                      });

                                      temp.dataset[0].backgroundColor[id] =
                                        e.target.value;

                                      filter.splice(index, 0, temp);

                                      return filter;
                                    })
                                  }
                                />
                              </div>
                              <Input
                                className="w-1/2 text-black"
                                placeholder={`Number ${id + 1}...`}
                                value={chart.dataset[0].data[id]}
                                type="number"
                                onChange={(e) =>
                                  setChartData((prev) => {
                                    let temp = null;

                                    const list = JSON.parse(
                                      JSON.stringify(prev)
                                    );

                                    const filter = list.filter((chart) => {
                                      if (chart.id == index) temp = chart;

                                      return chart.id != index;
                                    });

                                    temp.dataset[0].data[id] = e.target.value;

                                    filter.splice(index, 0, temp);

                                    return filter;
                                  })
                                }
                              />
                            </div>
                          ))}
                        </>
                      )}
                      {chart.typeChart === chartConfig.bar && (
                        <>
                          {chart.labels.map((label, label_index) => (
                            <Collapsible
                              defaultOpen
                              className="my-5"
                              key={label}
                            >
                              <div className="flex">
                                <Input
                                  className="text-black"
                                  placeholder={`Label ${label_index + 1}...`}
                                  value={chart.labels[label_index]}
                                  autoFocus={label_index === currentInput[0]}
                                  onChange={(e) => {
                                    setCurrentInput([label_index, null]);
                                    setChartData((prev) => {
                                      let temp = null;

                                      const list = JSON.parse(
                                        JSON.stringify(prev)
                                      );

                                      const filter = list.filter((chart) => {
                                        if (chart.id == index) temp = chart;

                                        return chart.id != index;
                                      });

                                      temp.labels[label_index] = e.target.value;

                                      filter.splice(index, 0, temp);

                                      return filter;
                                    });
                                  }}
                                />
                                <CollapsibleTrigger>
                                  <ChevronsUpDownIcon />
                                </CollapsibleTrigger>
                              </div>

                              <CollapsibleContent className="ml-6">
                                {chart.dataset.map((sub, id) => (
                                  <div
                                    className="flex gap-3 my-2"
                                    key={sub.label}
                                  >
                                    <div className="flex w-1/2 pr-2 items-center bg-white rounded-sm">
                                      <Input
                                        className="flex-1 mr-2 text-black"
                                        placeholder={`Sublabel ${id + 1}...`}
                                        autoFocus={
                                          currentInput[0] == label_index &&
                                          currentInput[1] == id
                                        }
                                        value={sub.label}
                                        onChange={(e) => {
                                          setChartData((prev) => {
                                            let temp = null;

                                            const list = JSON.parse(
                                              JSON.stringify(prev)
                                            );

                                            const filter = list.filter(
                                              (chart) => {
                                                if (chart.id == index)
                                                  temp = chart;

                                                return chart.id != index;
                                              }
                                            );

                                            temp.dataset[id].label =
                                              e.target.value;

                                            filter.splice(index, 0, temp);

                                            return filter;
                                          });
                                          setCurrentInput([label_index, id]);
                                        }}
                                      />
                                      <input
                                        type="color"
                                        className="w-5"
                                        value={sub.backgroundColor}
                                        onChange={(e) =>
                                          setChartData((prev) => {
                                            let temp = null;

                                            const list = JSON.parse(
                                              JSON.stringify(prev)
                                            );

                                            const filter = list.filter(
                                              (chart) => {
                                                if (chart.id == index)
                                                  temp = chart;

                                                return chart.id != index;
                                              }
                                            );

                                            temp.dataset[id].backgroundColor =
                                              e.target.value;

                                            filter.splice(index, 0, temp);

                                            return filter;
                                          })
                                        }
                                      />
                                    </div>
                                    <Input
                                      className="w-1/2 text-black"
                                      placeholder={`Number ${id + 1}...`}
                                      type="number"
                                      value={sub.data[label_index]}
                                      onChange={(e) =>
                                        setChartData((prev) => {
                                          let temp = null;

                                          const list = JSON.parse(
                                            JSON.stringify(prev)
                                          );

                                          const filter = list.filter(
                                            (chart) => {
                                              if (chart.id == index)
                                                temp = chart;

                                              return chart.id != index;
                                            }
                                          );

                                          temp.dataset[id].data[label_index] =
                                            e.target.value;

                                          filter.splice(index, 0, temp);

                                          return filter;
                                        })
                                      }
                                    />
                                  </div>
                                ))}
                                <button
                                  onClick={(e) =>
                                    handleAddChartSubField(e, index)
                                  }
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
                        onClick={(e) => handleAddChartField(e, index)}
                        title="Add Label"
                        className="flex justify-center mt-4 bg-transparent border border-[#7A7D81] rounded-md w-full py-2 hover:bg-[#A8A8A8] transition-colors"
                      >
                        <CirclePlusIcon />
                      </button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="view">
                  <ChartCustom chartData={chart} />
                </TabsContent>
              </Tabs>
            );
          })}

        <button
          onClick={handleAddChart}
          className="text-white text-lg w-full p-[6px] bg-black rounded-md border border-[#ccc] font-bold"
          type="button"
        >
          Add Chart
        </button>

        <Alert className="border border-[#D14537] bg-transparent">
          <MessageCircleWarningIcon
            className="h-5 w-5 mt-[2px]"
            color="#F88B56"
          />
          <AlertTitle className="text-base text-[#F88B56] ">
            Warning!
          </AlertTitle>
          <AlertDescription className="text-sm italic text-white">
            If you switch to another mode (buildinguse, landuse,...) without
            save the chart, the chart data will be lost!
          </AlertDescription>
        </Alert>
      </AccordionCustom>
      <button
        onClick={handleSaveChart}
        className="text-white text-lg w-full p-[6px] bg-black rounded-md border border-[#ccc] font-bold mt-4"
        type="button"
      >
        Save Chart
      </button>
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
      setChartData([chartdata[site]]);
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
        <div className="w-[500px] h-[350px] fixed bottom-5 left-8">
          <Tabs defaultValue="chart1" className="w-full">
            <TabsList className="w-fit">
              {Array(chartData.length)
                .fill(0)
                .map((_, index) => (
                  <TabsTrigger
                    value={`chart${index + 1}`}
                    className="w-fit"
                    key={index}
                  >
                    {index + 1}
                  </TabsTrigger>
                ))}
            </TabsList>
            {chartData.map((chart, index) => (
              <TabsContent
                className="w-[400px] h-[300px]"
                value={`chart${index + 1}`}
                key={index}
              >
                <ChartCustom chartData={chart} width={450} height={300} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {viewMode === viewModeCons.edit && <Editor site={site} />}
    </>
  );
};

export default Interview;
