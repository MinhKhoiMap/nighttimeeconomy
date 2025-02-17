import { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  PolarAreaController,
  PieController,
  RadarController,
  BubbleController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  BarController,
  LineController,
  PolarAreaController,
  PieController,
  RadarController,
  BubbleController,
  ScatterController,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

ChartJS.defaults.color = "#fff";
ChartJS.defaults.font.family = "Open Sauce One";
ChartJS.defaults.font.weight = "700";
ChartJS.defaults.scale.grid.display = false;

const ChartCustom = ({ chartData, width = 300, height = 300 }) => {
  const chartRef = useRef(null);

  return (
    <Chart
      width={width}
      height={height}
      ref={chartRef}
      type={chartData.typeChart}
      options={{
        indexAxis: "x",
        color: "#FFFFFF",
        responsive: true,
        skipNull: true,
        plugins: {
          legend: {
            labels: {
              font: {
                size: 12,
                family: "Barlow",
              },
              padding: 20,
              boxPadding: 15,
              ...chartData?.legend?.labels,
            },
            position: "top",
            ...chartData?.legend?.opts,
          },
          title: {
            display: true,
            color: "#FFFFFF",
            text: chartData.title,
            font: {
              size: 16,
            },
          },
          datalabels: {
            formatter: (value, context) => {
              const dataPoints = context.chart.data.datasets[0].data;
              const totalValue = dataPoints.reduce(
                (total, dataPoint) => total + dataPoint,
                0
              );
              const percentageVal = ((value / totalValue) * 100).toFixed(1);
              const display = percentageVal > 0 ? `${percentageVal}%` : null;

              return display;
            },
            display: chartData.typeChart.toLowerCase() == "pie",
          },
        },
        ...chartData?.opts,
      }}
      plugins={[ChartDataLabels]}
      data={{
        labels: chartData.labels,
        datasets: chartData.dataset,
      }}
    />
  );
};

export default ChartCustom;
