// Header componentini yükle
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    if (window.setupHeaderEvents) window.setupHeaderEvents();
  });

// Grafikleri oluştur ve güncelle
function updateCharts() {
  fetch('../coffee_message.json')
    .then(response => response.json())
    .then(data => {
      const processedData = processData(data);
      createDailyChart(processedData.dailyData);
      createMonthlyChart(processedData.monthlyData);
      createComparisonChart(processedData.comparisonData);
    })
    .catch(error => console.error('Veri yüklenirken hata:', error));
}

function processData(data) {
  const dailyData = {};
  const monthlyData = {};
  const deviceData = {};

  data.forEach(entry => {
    try {
      const messageData = JSON.parse(entry.message);
      const timestamp = new Date(entry.timestamp.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
      const count = parseInt(messageData.count) || 0;
      const deviceId = messageData.device_id;

      // Günlük veri
      const dateKey = timestamp.toISOString().split('T')[0];
      dailyData[dateKey] = (dailyData[dateKey] || 0) + count;

      // Aylık veri
      const monthKey = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + count;

      // Cihaz bazlı veri
      if (!deviceData[deviceId]) {
        deviceData[deviceId] = {};
      }
      deviceData[deviceId][dateKey] = (deviceData[deviceId][dateKey] || 0) + count;
    } catch (error) {
      console.error('Veri işleme hatası:', error);
    }
  });

  return {
    dailyData: dailyData,
    monthlyData: monthlyData,
    comparisonData: deviceData
  };
}

function createDailyChart(dailyData) {
  const dates = Object.keys(dailyData).sort();
  const values = dates.map(date => dailyData[date]);

  const options = {
    series: [{
      name: 'Kahve Satışı',
      data: values
    }],
    chart: {
      type: 'line',
      height: 450,
      toolbar: {
        show: false
      }
    },
    colors: ['#4b2e83'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: dates,
      labels: {
        style: {
          colors: '#666'
        },
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Satış Adedi',
        style: {
          color: '#666'
        }
      },
      labels: {
        style: {
          colors: '#666'
        }
      }
    },
    grid: {
      borderColor: '#f0f0f0'
    },
    tooltip: {
      theme: 'light'
    }
  };

  const chart = new ApexCharts(document.querySelector("#daily-sales-chart"), options);
  chart.render();
}

function createMonthlyChart(monthlyData) {
  const months = Object.keys(monthlyData).sort();
  const values = months.map(month => monthlyData[month]);

  // Her ay için ayrı seri oluştur
  const series = months.map(month => ({
    name: month,
    data: Array(12).fill(0).map((_, i) => i === months.indexOf(month) ? monthlyData[month] : null)
  }));

  const options = {
    series: series,
    chart: {
      type: 'area',
      height: 450,
      toolbar: {
        show: false
      }
    },
    colors: ['#4b2e83', '#8ec5fc', '#e0c3fc'],
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1
      }
    },
    xaxis: {
      categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      title: {
        text: 'Hafta',
        style: {
          color: '#666'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Satış Adedi',
        style: {
          color: '#666'
        }
      }
    }
  };

  const chart = new ApexCharts(document.querySelector("#monthly-trend-chart"), options);
  chart.render();
}

function createComparisonChart(deviceData) {
  const devices = Object.keys(deviceData);
  const dates = new Set();
  devices.forEach(device => {
    Object.keys(deviceData[device]).forEach(date => dates.add(date));
  });
  const sortedDates = Array.from(dates).sort();

  // Son 7 günün verilerini al
  const last7Days = sortedDates.slice(-7);
  const thisWeekData = devices.map(device => ({
    name: `Cihaz ${device}`,
    data: last7Days.map(date => deviceData[device][date] || 0)
  }));

  const options = {
    series: thisWeekData,
    chart: {
      type: 'bar',
      height: 450,
      toolbar: {
        show: false
      }
    },
    colors: ['#4b2e83', '#8ec5fc'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: last7Days,
      labels: {
        style: {
          colors: '#666'
        },
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Satış Adedi',
        style: {
          color: '#666'
        }
      }
    },
    legend: {
      position: 'top'
    }
  };

  const chart = new ApexCharts(document.querySelector("#comparison-chart"), options);
  chart.render();
}

// İlk yükleme
updateCharts();

// Her 30 saniyede bir güncelle
setInterval(updateCharts, 30000);

// MQTT mesajı geldiğinde grafikleri güncelle
window.addEventListener('mqttMessage', function(e) {
  updateCharts();
});
