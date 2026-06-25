import { useCallback, useLayoutEffect, useState } from "react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import readingIndicatorPlugin from "./CustomPlugins/readingIndicatorPlugin";

// Styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

// Components
import SkeletonLoading from "../SkeletonLoading/SkeletonLoading";

export const ReadingIndicatorComp = ({ store }) => {
  const [percentages, setPercentages] = useState(0);

  const handleScroll = (e) => {
    const target = e.target;

    if (target instanceof HTMLDivElement) {
      const p =
        Math.floor(100 * target.scrollTop) /
        (target.scrollHeight - target.clientHeight);

      let newPercent = Math.min(100, p);
      setPercentages(newPercent);
    }
  };

  const handlePagesContainer = () => {
    const getPagesContainer = store.get("getPagesContainer");

    if (!getPagesContainer) {
      return;
    }

    const pagesEle = getPagesContainer();
    pagesEle.addEventListener("scroll", handleScroll);
    pagesEle.style.scrollBehavior = "smooth";
  };

  useLayoutEffect(() => {
    store.subscribe("getPagesContainer", handlePagesContainer);

    return () => store.unsubscribe("getPagesContainer", handlePagesContainer);
  }, []);

  return (
    <div
      style={{
        height: "4px",
      }}
    >
      <div
        style={{
          backgroundColor: "pink",
          height: "100%",
          width: `${percentages}%`,
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
          borderTopRightRadius: "5px",
          borderBottomRightRadius: "5px",
        }}
      />
    </div>
  );
};

function DocumentViewer({ file }) {
  const readingIndicatorPluginInstance = readingIndicatorPlugin();
  const { ReadingIndicator } = readingIndicatorPluginInstance;

  const toolbarPluginInstance = toolbarPlugin();
  const {
    Toolbar,
    pageNavigationPluginInstance,
    zoomPluginInstance,
    searchPluginInstance,
  } = toolbarPluginInstance;

  const {
    CurrentPageInput,
    GoToFirstPageButton,
    GoToLastPageButton,
    GoToNextPageButton,
    GoToPreviousPage,
    NumberOfPages,
  } = pageNavigationPluginInstance;

  const { ZoomIn, ZoomOut, ZoomPopover } = zoomPluginInstance;

  const { ShowSearchPopover, Search } = searchPluginInstance;

  const renderToolbar = useCallback(
    () => (
      <div className="flex justify-center relative w-full">
        <Toolbar>
          {() => {
            return (
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  justifyContent: "center",
                  padding: "4px",
                }}
              >
                <div style={{ padding: "0px 2px" }}>
                  <GoToFirstPageButton />
                </div>
                <div style={{ padding: "0px 2px" }}>
                  <GoToPreviousPage />
                </div>
                <div style={{ padding: "0 2px 0 8px", width: "4rem" }}>
                  <CurrentPageInput style={{ fontSize: "16px" }} />
                </div>
                <div
                  style={{
                    padding: "0px 8px",
                    marginLeft: "10px",
                  }}
                >
                  <NumberOfPages>
                    {(props) => (
                      <p className="text-white text-base">
                        / {props.numberOfPages}
                      </p>
                    )}
                  </NumberOfPages>
                </div>
                <div style={{ padding: "0px 2px" }}>
                  <GoToNextPageButton />
                </div>
                <div style={{ padding: "0px 2px" }}>
                  <GoToLastPageButton />
                </div>
                <div style={{ padding: "0px 2px", width: "4rem" }}>
                  <ZoomPopover />
                </div>
                <div style={{ padding: "0px 2px" }}>
                  <ZoomIn />
                </div>
                <div style={{ padding: "0px 2px" }}>
                  <ZoomOut />
                </div>
              </div>
            );
          }}
        </Toolbar>
        <div
          style={{
            bottom: "0",
            position: "absolute",
            left: 0,
            // Take the full width of toolbar
            width: "100%",
          }}
        >
          <ReadingIndicator />
        </div>
      </div>
    ),
    []
  );

  // Plugins
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar,
    sidebarTabs: () => [],
  });

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <div
        className="rpv-core__viewer"
        style={{
          border: "1px solid rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: "hidden",
          }}
        >
          <Viewer
            fileUrl={file}
            theme="dark"
            plugins={[
              defaultLayoutPluginInstance,
              pageNavigationPluginInstance,
              zoomPluginInstance,
              searchPluginInstance,
              readingIndicatorPluginInstance,
            ]}
            defaultScale={SpecialZoomLevel.PageFit}
            renderLoader={() => <loading />}
          />
        </div>
      </div>
    </Worker>
  );
}

export default DocumentViewer;
