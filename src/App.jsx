import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  CandlestickController,
  OhlcController,
  CandlestickElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { Chart as FinancialChart } from 'react-chartjs-2';
import './assets/style.css'

Chart.register(...registerables);
Chart.register(CandlestickController, OhlcController, CandlestickElement);

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState('ethusdt');
  const [timeframe, setTimeframe] = useState('1m');
  const [chartData, setChartData] = useState({ datasets: [] });
  const [currentRate, setCurrentRate] = useState(0); 
  const [error, setError] = useState(null);
  const [sellAmount, setSellAmount] = useState('');

  const fetchChartData = async (symbol, interval) => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );
      const data = await response.json();

      if (response.ok) {
        const candlestickData = data.map((kline) => ({
          x: new Date(kline[0]),
          o: parseFloat(kline[1]),
          h: parseFloat(kline[2]),
          l: parseFloat(kline[3]),
          c: parseFloat(kline[4]),
        }));

        setChartData({
          datasets: [
            {
              label: `${symbol.toUpperCase()} Chart`,
              data: candlestickData,
              borderColor: (context) => {
                const { dataset, dataIndex } = context;
                const { o, c } = dataset.data[dataIndex];
                return c > o ? '#258225' : '#ad1212';
              },
              backgroundColor: 'rgba(0, 0, 0, 0)', 
              borderWidth: 1, 
              barThickness: 7,
            },
          ],
        });
        
        setCurrentRate(candlestickData[candlestickData.length - 1].c);
        setError(null);
      } else {
        setError('Failed to fetch chart data.');
      }
    } catch (error) {
      setError('An error occurred while fetching data.');
    }
  };

  useEffect(() => {
    fetchChartData(selectedCrypto.toUpperCase(), timeframe);
  }, [selectedCrypto, timeframe]);

  const handleSellAmountChange = (e) => {
    setSellAmount(e.target.value); 
  };

  return (
    <div className="container">
      <h1>Cryptocurrency Live Chart</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
  
      <div className="controls">
        <label htmlFor="cryptoSelect">Select Cryptocurrency:</label>
        <select
          id="cryptoSelect"
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}
        >
          <option value="ethusdt">ETH/USDT</option>
          <option value="bnbusdt">BNB/USDT</option>
          <option value="dotusdt">DOT/USDT</option>
        </select>
  
        <label htmlFor="timeframeSelect">Select Timeframe:</label>
        <select
          id="timeframeSelect"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="1m">1 Minute</option>
          <option value="3m">3 Minutes</option>
          <option value="5m">5 Minutes</option>
        </select>
      </div>
  
      <div className="chart-container">
      <FinancialChart
    type="candlestick"
    data={chartData}
    options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(50, 50, 50, 0.9)',
                callbacks: {
                    title: (tooltipItems) => {
                        const time = tooltipItems[0].parsed.x; // Get the timestamp
                        return new Date(time).toLocaleString(); // Format the date and time
                    },
                    label: (tooltipItem) => {
                        const { c } = tooltipItem.raw; // Get the closing price
                        return `Price: ${c}`; // Display only the closing price
                    },
                },
            },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    tooltipFormat: 'P p',
                    displayFormats: {
                        minute: 'HH:mm',
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Price',
                    color: '#ffffff',
                },
            },
        },
    }}
/>


</div>


      <div className="mt-5">
  <div className="mb-4">
    <input
      type="text"
      value={currentRate}
      readOnly
      className="input-rate"
      placeholder="Current Rate"
    />
    <button className="button button-buy">
      Buy
    </button>
  </div>

  <div className="mb-4" style={{ marginTop: '20px' }}> 
    <input
      type="text"
      value={sellAmount}
      onChange={handleSellAmountChange}
      className="input-rate"
      placeholder="Amount to Sell"
    />
    <button className="button button-sell">
      Sell
    </button>
  </div>
</div>

    </div>
  );
}

export default App;
