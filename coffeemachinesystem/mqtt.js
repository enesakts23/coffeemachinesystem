// MQTT.js - Global MQTT Client
// Paho MQTT client'ı eklemek için CDN'den script eklenmeli
// Bu dosya, global bir mqttClient nesnesi oluşturur ve mesajları konsola loglar

(function(global) {
  function startMQTT() {
    if (
      typeof global.Paho === 'undefined' ||
      typeof global.Paho.MQTT === 'undefined' ||
      typeof global.Paho.MQTT.Client === 'undefined'
    ) {
      console.error('Paho MQTT kütüphanesi yüklenmedi!');
      return;
    }

    // Bağlantı ayarları
    const host = '213.142.151.191';
    const port = 9001;
    const topic = 'coffee';
    const clientId = 'webclient-' + Math.random().toString(16).substr(2, 8);

    // Global client
    const mqttClient = new global.Paho.MQTT.Client(host, port, clientId);

    mqttClient.onConnectionLost = function(responseObject) {
      if (responseObject.errorCode !== 0) {
        console.error('MQTT Bağlantı kayboldu:', responseObject.errorMessage);
      }
    };

    mqttClient.onMessageArrived = function(message) {
      console.log('[MQTT] Mesaj geldi:', message.destinationName, message.payloadString);
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        const event = new CustomEvent('mqttMessage', {
          detail: { topic: message.destinationName, payload: message.payloadString }
        });
        window.dispatchEvent(event);
      }
    };

    mqttClient.connect({
      onSuccess: function() {
        console.log('MQTT bağlantısı başarılı!');
        mqttClient.subscribe(topic);
      },
      onFailure: function(e) {
        console.error('MQTT bağlantı hatası:', e.errorMessage);
      },
      useSSL: false
    });

    // Global erişim
    global.mqttClient = mqttClient;
  }

  // Paho yüklenene kadar bekle (polling)
  function waitForPaho(retry) {
    if (
      typeof global.Paho !== 'undefined' &&
      typeof global.Paho.MQTT !== 'undefined' &&
      typeof global.Paho.MQTT.Client !== 'undefined'
    ) {
      startMQTT();
    } else if (retry < 50) { // 5 saniye boyunca dene (100ms arayla)
      setTimeout(function() { waitForPaho(retry + 1); }, 100);
    } else {
      console.error('Paho MQTT kütüphanesi 5 saniye içinde yüklenmedi!');
    }
  }
  waitForPaho(0);
})(window);
