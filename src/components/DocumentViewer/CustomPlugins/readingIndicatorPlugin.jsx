import { useMemo } from "react";
import { createStore } from "@react-pdf-viewer/core";
import { ReadingIndicatorComp } from "../DocumentViewer";

const readingIndicatorPlugin = () => {
  const store = useMemo(() => createStore({}), []);

  const ReadingIndicatorDecorator = () => (
    <ReadingIndicatorComp store={store} />
  );

  return {
    install: (pluginFunctions) => {
      store.update("getPagesContainer", pluginFunctions.getPagesContainer);
    },
    ReadingIndicator: ReadingIndicatorDecorator,
  };
};

export default readingIndicatorPlugin;
