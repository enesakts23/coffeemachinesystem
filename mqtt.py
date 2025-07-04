import paho.mqtt.client as mqtt
import time
import random
import json
from datetime import datetime

# MQTT Broker ayarları
BROKER_HOST = "213.142.151.191"   #213.142.151.191
BROKER_PORT = 1883
TOPIC = "coffee"
CLIENT_ID = f"coffee_sender_{random.randint(1000, 9999)}"

# Mesaj gönderme aralığı (saniye)
MESSAGE_INTERVAL = 20

class MQTTSender:
    def __init__(self):
        self.client = mqtt.Client(client_id=CLIENT_ID)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_publish = self.on_publish
        self.is_connected = False
        self.message_count = 0
        
        # Gönderilecek mesaj verileri
        self.messages = [
            {"firma_adi": "espressolab", "sube_adi": "tuzla", "device_id": "0000001", "count": 1},
            {"firma_adi": "espressolab", "sube_adi": "tuzla", "device_id": "0000002", "count": 1}
        ]
        self.current_message_index = 0
        
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✅ MQTT Broker'a başarıyla bağlandı: {BROKER_HOST}:{BROKER_PORT}")
            print(f"📡 Topic: {TOPIC}")
            print(f"🆔 Client ID: {CLIENT_ID}")
            print("-" * 50)
            self.is_connected = True
        else:
            print(f"❌ Bağlantı hatası! Kod: {rc}")
            self.is_connected = False
    
    def on_disconnect(self, client, userdata, rc):
        print("🔌 MQTT Broker bağlantısı kesildi")
        self.is_connected = False
    
    def on_publish(self, client, userdata, mid):
        print(f"📤 Mesaj gönderildi (ID: {mid})")
    
    def connect(self):
        try:
            print(f"🔄 MQTT Broker'a bağlanılıyor: {BROKER_HOST}:{BROKER_PORT}")
            self.client.connect(BROKER_HOST, BROKER_PORT, 60)
            self.client.loop_start()
            
            # Bağlantı kontrolü
            timeout = 10
            while not self.is_connected and timeout > 0:
                time.sleep(1)
                timeout -= 1
                
            if not self.is_connected:
                print("❌ Bağlantı zaman aşımına uğradı!")
                return False
                
            return True
            
        except Exception as e:
            print(f"❌ Bağlantı hatası: {e}")
            return False
    
    def get_next_message(self):
        """Sıradaki mesajı al"""
        message = self.messages[self.current_message_index]
        # Sıradaki mesaja geç
        self.current_message_index = (self.current_message_index + 1) % len(self.messages)
        return json.dumps(message)
    
    def send_messages(self):
        """Sürekli mesaj gönder"""
        print("🚀 Mesaj gönderme başladı... (Durdurmak için Ctrl+C)")
        print("-" * 50)
        
        try:
            while True:
                if self.is_connected:
                    # Sıradaki mesajı al
                    message = self.get_next_message()
                    
                    # Mesaj gönder
                    result = self.client.publish(TOPIC, message)
                    
                    if result.rc == mqtt.MQTT_ERR_SUCCESS:
                        self.message_count += 1
                        current_time = datetime.now().strftime("%H:%M:%S")
                        print(f"[{current_time}] #{self.message_count} -> {message}")
                    else:
                        print(f"❌ Mesaj gönderilemedi! Hata kodu: {result.rc}")
                else:
                    print("⚠️  Bağlantı kesildi, yeniden bağlanılıyor...")
                    if not self.connect():
                        print("❌ Yeniden bağlantı başarısız!")
                        break
                
                time.sleep(MESSAGE_INTERVAL)
                
        except KeyboardInterrupt:
            print("\n\n⏹️  Mesaj gönderme durduruldu!")
            print(f"📊 Toplam {self.message_count} mesaj gönderildi")
        except Exception as e:
            print(f"❌ Hata oluştu: {e}")
        finally:
            self.disconnect()
    
    def disconnect(self):
        """MQTT bağlantısını kapat"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            print("🔌 MQTT bağlantısı kapatıldı")

def main():
    print("☕ MQTT Coffee Mesaj Gönderici")
    print("=" * 50)
    
    sender = MQTTSender()
    
    if sender.connect():
        sender.send_messages()
    else:
        print("❌ MQTT Broker'a bağlanılamadı!")

if __name__ == "__main__":
    main()