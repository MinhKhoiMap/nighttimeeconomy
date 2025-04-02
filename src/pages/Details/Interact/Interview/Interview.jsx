import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl";
import { useToast } from "../../../../hooks/use-toast";

// Assets
import "react-photo-view/dist/react-photo-view.css";
import "./style.css";
import locate from "../../../../assets/images/locate.png";
import chartdata from "../../../../assets/data/chartdata";
import {
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
import { EditModeData, ViewModeContext } from "../../Details";

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

const chartConfig = {
  pie: "pie",
  bar: "bar",
  likert: "likert",
  axis: {
    x: "x",
    y: "y",
  },
};

const Editor = ({ site }) => {
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
    } else if (val === chartConfig.likert) {
      setChartData((prev) => {
        const temp = {
          id,
          typeChart: chartConfig.likert,
          opts: {
            indexAxis: chartConfig.axis.y,
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
          dataset: [
            {
              label: "1",
              backgroundColor: "#C32314",
              data: [0],
            },
            {
              label: "2",
              backgroundColor: "#E6AAA0",
              data: [0],
            },
            {
              label: "3",
              backgroundColor: "#E1E1E1",
              data: [0],
            },
            {
              label: "4",
              backgroundColor: "#78AFE6",
              data: [0],
            },
            {
              label: "5",
              backgroundColor: "#236EC3",
              data: [0],
            },
          ],
        };

        const list = JSON.parse(JSON.stringify(prev));
        const filter = list.filter((chart) => chart.id != id);

        filter.splice(id, 0, temp);

        return filter;
      });
    } else if (val === chartConfig.pie) {
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
        // console.log(temp.dataset[0].backgroundColor);
        temp.dataset[0].backgroundColor.push(
          "#000000".replace(/0/g, function () {
            return (~~(Math.random() * 16)).toString(16);
          })
        );
        temp.dataset[0].data.push(0);

        filter.splice(id, 0, temp);

        return filter;
      });
    } else if (chartData[id].typeChart == chartConfig.bar) {
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
    } else if (chartData[id].typeChart == chartConfig.likert) {
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

    chartData.forEach(
      (chart) =>
        chart.typeChart === chartConfig.likert &&
        (chart.typeChart = chartConfig.bar)
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
            // console.log(chart, chartData);

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
                              <svg
                                width="16px"
                                height="16px"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.75 8.25C10.75 8.80228 10.3023 9.25 9.75 9.25C9.19772 9.25 8.75 8.80228 8.75 8.25C8.75 7.69772 9.19772 7.25 9.75 7.25C10.3023 7.25 10.75 7.69772 10.75 8.25Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M13.5 8.25C13.5 8.80228 13.0523 9.25 12.5 9.25C11.9477 9.25 11.5 8.80228 11.5 8.25C11.5 7.69772 11.9477 7.25 12.5 7.25C13.0523 7.25 13.5 7.69772 13.5 8.25Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M16.5 8.25C16.5 8.80228 16.0523 9.25 15.5 9.25C14.9477 9.25 14.5 8.80228 14.5 8.25C14.5 7.69772 14.9477 7.25 15.5 7.25C16.0523 7.25 16.5 7.69772 16.5 8.25Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M19.5 8.25C19.5 8.80228 19.0523 9.25 18.5 9.25C17.9477 9.25 17.5 8.80228 17.5 8.25C17.5 7.69772 17.9477 7.25 18.5 7.25C19.0523 7.25 19.5 7.69772 19.5 8.25Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M9.75 16.75C10.3023 16.75 10.75 16.3023 10.75 15.75C10.75 15.1977 10.3023 14.75 9.75 14.75C9.19772 14.75 8.75 15.1977 8.75 15.75C8.75 16.3023 9.19772 16.75 9.75 16.75Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M12.5 16.75C13.0523 16.75 13.5 16.3023 13.5 15.75C13.5 15.1977 13.0523 14.75 12.5 14.75C11.9477 14.75 11.5 15.1977 11.5 15.75C11.5 16.3023 11.9477 16.75 12.5 16.75Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M15.5 16.75C16.0523 16.75 16.5 16.3023 16.5 15.75C16.5 15.1977 16.0523 14.75 15.5 14.75C14.9477 14.75 14.5 15.1977 14.5 15.75C14.5 16.3023 14.9477 16.75 15.5 16.75Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M18.5 16.75C19.0523 16.75 19.5 16.3023 19.5 15.75C19.5 15.1977 19.0523 14.75 18.5 14.75C17.9477 14.75 17.5 15.1977 17.5 15.75C17.5 16.3023 17.9477 16.75 18.5 16.75Z"
                                  fill="#212121"
                                />
                                <path
                                  d="M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H19C20.6569 20 22 18.6569 22 17V7C22 5.34315 20.6569 4 19 4H5ZM19 5.5C19.8284 5.5 20.5 6.17157 20.5 7V11.25H7.5V5.5H19ZM20.5 12.75V17C20.5 17.8284 19.8284 18.5 19 18.5H7.5V12.75H20.5ZM6 11.25H3.5V7C3.5 6.17157 4.17157 5.5 5 5.5H6V11.25ZM3.5 12.75H6V18.5H5C4.17157 18.5 3.5 17.8284 3.5 17V12.75Z"
                                  fill="#212121"
                                />
                              </svg>
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

                              <CollapsibleContent className="ml-2 pl-3 border-l border-l-[#ccc]">
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
                                  <CirclePlusIcon /> Add Sub Field
                                </button>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </>
                      )}
                      {chart.typeChart === chartConfig.likert && (
                        <>
                          {chart.labels.map((label, label_index) => (
                            <Collapsible
                              defaultOpen
                              className="my-5"
                              key={label}
                            >
                              {/* Label main (question label) */}
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

                              {/* Sublabel */}
                              <CollapsibleContent className="mt-2 ml-2 pl-3 border-l border-l-[#ccc] flex gap-2">
                                {chart.dataset.map((sub, sub_index) => (
                                  <div className="my-2 flex-1" key={sub.label}>
                                    <label
                                      htmlFor={sub.label}
                                      className="text-center block w-full mb-[6px]"
                                    >
                                      {sub.label}
                                    </label>
                                    <Input
                                      className="text-black"
                                      placeholder={`Sublabel ${sub.label}...`}
                                      value={sub.data[label_index]}
                                      type="number"
                                      // autoFocus={sub_index === currentInput[0]}
                                      onChange={(e) => {
                                        // setCurrentInput([sub_index, null]);
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

                                          temp.dataset[sub_index].data[
                                            label_index
                                          ] = e.target.value;

                                          filter.splice(index, 0, temp);

                                          return filter;
                                        });
                                      }}
                                    />
                                  </div>
                                ))}
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
                        <CirclePlusIcon /> Add Field
                      </button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="view">
                  <ChartCustom
                    chartData={
                      chart.typeChart === chartConfig.likert
                        ? { ...chart, typeChart: "bar" }
                        : chart
                    }
                  />
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
                <ChartCustom
                  chartData={
                    chart.typeChart === chartConfig.likert
                      ? { ...chart, typeChart: "bar" }
                      : chart
                  }
                  width={450}
                  height={300}
                />
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
