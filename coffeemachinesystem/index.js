// Header componentini yükle
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    // Header yüklendikten sonra eventleri başlat
    if (window.setupHeaderEvents) window.setupHeaderEvents();
  });

// Coffee satış istatistiklerini güncelle
function updateCoffeeStats() {
  fetch('../coffee_message.json')
    .then(response => response.json())
    .then(data => {
      const now = new Date();
      
      // Son 24 saat, hafta ve ay için tarih sınırlarını hesapla
      const last24h = new Date(now - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now - 30 * 24 * 60 * 60 * 1000);

      // İstatistikleri hesapla
      let daily = 0, weekly = 0, monthly = 0;

      data.forEach(entry => {
        try {
          const messageData = JSON.parse(entry.message);
          const timestamp = new Date(entry.timestamp.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
          const count = parseInt(messageData.count) || 0;

          if (timestamp >= last24h) {
            daily += count;
          }
          if (timestamp >= lastWeek) {
            weekly += count;
          }
          if (timestamp >= lastMonth) {
            monthly += count;
          }
        } catch (error) {
          console.error('Veri işleme hatası:', error);
        }
      });

      // Widget değerlerini güncelle
      document.getElementById('coffee-24h').textContent = daily.toString();
      document.getElementById('coffee-week').textContent = weekly.toString();
      document.getElementById('coffee-month').textContent = monthly.toString();

      // Aktif cihaz sayısını güncelle
      document.getElementById('active-devices').textContent = '2';

      // Cihaz durumlarını güncelle - her zaman cihaz-1 ve cihaz-2'yi göster
      const deviceStatusList = document.getElementById('device-status-list');
      deviceStatusList.innerHTML = '';
      
      // Sabit cihaz listesi
      const devices = ['0000001', '0000002'];
      
      devices.forEach(deviceId => {
        const statusRow = document.createElement('div');
        statusRow.className = 'device-status-row';
        statusRow.innerHTML = `
          <span class="status-circle online"></span>
          <span class="device-label">cihaz-${deviceId}</span>
        `;
        deviceStatusList.appendChild(statusRow);
      });
    })
    .catch(error => console.error('Veri yüklenirken hata:', error));
}

// İlk yükleme
updateCoffeeStats();

// Her 2 saniyede bir güncelle
setInterval(updateCoffeeStats, 2000);

// MQTT mesajı geldiğinde istatistikleri güncelle
window.addEventListener('mqttMessage', function(e) {
  const { topic, payload } = e.detail;
  console.log('[index.js] MQTT Mesajı:', topic, payload);
  updateCoffeeStats();
}); 