// Header componentini yükle
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    // Header yüklendikten sonra eventleri başlat ve grafikleri oluştur
    if (window.setupHeaderEvents) window.setupHeaderEvents();
    createCharts();
  });

// Grafikleri oluştur
function createCharts() {
  // 1. Günlük Kahve Satış Grafiği (Line Chart)
  const dailySalesOptions = {
    series: [{
      name: 'Kahve Satışı',
      data: [12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 60, 58, 65, 62, 70, 68, 75, 72, 80, 78, 85, 82, 90]
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
      categories: Array.from({length: 30}, (_, i) => `${i + 1} Gün`),
      labels: {
        style: {
          colors: '#666'
        }
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

  // 2. Aylık Satış Trendi (Area Chart)
  const monthlyTrendOptions = {
    series: [{
      name: 'Ocak', data: [120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340]
    }, {
      name: 'Şubat', data: [150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350, 370]
    }, {
      name: 'Mart', data: [180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380, 400]
    }],
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

  // 3. Günlük Satış Karşılaştırması (Bar Chart)
  const comparisonOptions = {
    series: [{
      name: 'Bu Hafta',
      data: [44, 55, 57, 56, 61, 58, 63]
    }, {
      name: 'Geçen Hafta',
      data: [35, 41, 36, 26, 45, 48, 52]
    }],
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
      categories: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
      labels: {
        style: {
          colors: '#666'
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
    },
    legend: {
      position: 'top'
    }
  };

  // Grafikleri oluştur
  new ApexCharts(document.querySelector("#daily-sales-chart"), dailySalesOptions).render();
  new ApexCharts(document.querySelector("#monthly-trend-chart"), monthlyTrendOptions).render();
  new ApexCharts(document.querySelector("#comparison-chart"), comparisonOptions).render();
}

// MQTT mesajlarını sadece konsolda görmek için event listener ekle
window.addEventListener('mqttMessage', function(e) {
  const { topic, payload } = e.detail;
  console.log('[history.js] MQTT Mesajı:', topic, payload);
});
