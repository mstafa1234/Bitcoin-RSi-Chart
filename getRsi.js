let prices = [];

const getData = async () => {
  const res = await fetch(
    "https://fapi.binance.com/fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=15"
  );
  const data = await res.json();
  data.map((e) => prices.push(e[4]));
  return calculateRsi(prices);
};

const calculateRsi = (highs) => {
  let avgGain = 0;
  let avgLoss = 0;
  let rsi = 0;
  for (let i = 1; i < highs.length; i++) {
    const sum = parseFloat(highs[i]) - parseFloat(highs[i - 1]);
    // const change =
    //   (parseFloat(highs[i]) / parseFloat(highs[i - 1])) * 100 - 100;
    //console.log(highs[i],highs[i-1] , sum.toFixed(2) , i, change.toFixed(2))
    sum >= 0 ? (avgGain += sum) : (avgLoss += Math.abs(sum));
  }
  const rs = avgGain / 14 / (avgLoss / 14);
  rsi = 100 - 100 / (1 + rs);
  const currentPrice = prices.slice(-1)[0];
  prices = [];
  return { rsi: rsi.toFixed(2), currentPrice };
};

// chart

const labels = [0];
let data = [];
const chartData = {
  labels: labels,
  datasets: [
    {
      label: "My First dataset",
      borderColor: "#fff",
      data: data,
      borderWidth: 0.5,
      pointBackgroundColor: "#fff",
    },
  ],
};
const config = {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Line Chart",
      },
    },

    elements: {
      point: {
        radius: 0,
      },
    },

    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          // forces step size to be 50 units
          stepSize: 5,
        },
      },
    },
  },
};

const myChart = new Chart(document.getElementById("myChart"), config);

setInterval(async () => {
  let rsiData = await getData();
  const d = parseFloat(rsiData.rsi);
  updateChart(myChart, "My Rsi chart", d, rsiData.currentPrice);
}, 4000);
const updateChart = (chart, label, data, currentPrice) => {
  chart.data.labels.push(currentPrice);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
    dataset.label = label;
  });
  chart.update();
};
