// Header componentini yükle
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    // Header yüklendikten sonra eventleri başlat
    if (window.setupHeaderEvents) window.setupHeaderEvents();
  });

// MQTT mesajlarını sadece konsolda görmek için event listener ekle
window.addEventListener('mqttMessage', function(e) {
  const { topic, payload } = e.detail;
  console.log('[index.js] MQTT Mesajı:', topic, payload);
}); 