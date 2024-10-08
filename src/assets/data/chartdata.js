export default [
  {
    typeChart: "bar",
    opts: {
      indexAxis: "y",
    },
    title: "WHAT DO YOU THINK ARE THE BENEFITS OF THE NIGHT ECONOMY?",
    labels: [
      "Place to gather after work",
      "Reduce unemployment rate",
      "Shopping",
      "Relax",
      "Culture entertainment",
      "Diversity",
      "Crowd",
    ],
    dataset: [
      {
        label: "Business owners",
        backgroundColor: "#4285F4",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [0, 3, 2, 0, 2, 3, 3],
      },
      {
        label: "Researchers",
        backgroundColor: "#EA4335",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [0, 5, 1, 0, 1, 5, 1],
      },
      {
        label: "Residents",
        backgroundColor: "#38812F",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [3, 3, 3, 4, 3, 3, 2],
      },
    ],
  },
  {
    typeChart: "pie",
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
    title: "How was real spend in the trip?",
    labels: [
      "0 ~ 300 (USD)",
      "300 ~ 600 (USD)",
      "600 ~ 900 (USD)",
      "900 ~ 1200 (USD)",
      "1200 ~ 1500 (USD)",
      "more than 1500 (USD)",
    ],
    dataset: [
      {
        backgroundColor: [
          "#3266CC",
          "#DC3912",
          "#8F4700",
          "#12961B",
          "#991499",
          "#0099C6",
        ],
        data: [2, 0, 0, 1, 1, 2],
      },
    ],
  },
  {
    typeChart: "bar",
    opts: {
      indexAxis: "y",
    },
    title: "Demand of Resident And Tourist",
    labels: [
      "Bar Club",
      "Festival",
      "FnB",
      "Market",
      "Pavement",
      "Shop",
      "Transportation",
    ],
    dataset: [
      {
        label: "Foreign",
        backgroundColor: "#ce2027",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [1, 0, 2, 0, 1, 0, 1],
      },
      {
        label: "Resident",
        backgroundColor: "#38812F",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [1, 5, 2, 2, 0, 0, 0],
      },
      {
        label: "Local",
        backgroundColor: "#c5fff8",
        categoryPercentage: 1,
        barPercentage: 0.8,
        data: [0, 0, 0, 0, 0, 2, 0],
      },
    ],
  },
];
