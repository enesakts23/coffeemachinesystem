import paho.mqtt.client as mqtt
import json
import os
from datetime import datetime
import pytz
import random

# MQTT Broker ayarları
BROKER_HOST = "213.142.151.191"
BROKER_PORT = 1883
TOPIC = "coffee"
CLIENT_ID = f"coffee_listener_{random.randint(1000, 9999)}"

# JSON dosya ayarları
JSON_FILE = "coffee_message.json"

class MQTTListener:
    def __init__(self):
        self.client = mqtt.Client(client_id=CLIENT_ID)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message
        self.is_connected = False
        self.message_count = 0
        
        # Türkiye saat dilimi
        self.turkey_timezone = pytz.timezone('Europe/Istanbul')
        
        # JSON dosyasını kontrol et ve yoksa oluştur
        self.initialize_json_file()
        
    def initialize_json_file(self):
        """JSON dosyasını kontrol et ve yoksa oluştur"""
        if not os.path.exists(JSON_FILE):
            with open(JSON_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f, ensure_ascii=False, indent=2)
            print(f"📁 {JSON_FILE} dosyası oluşturuldu")
        else:
            print(f"📁 {JSON_FILE} dosyası mevcut")
    
    def get_turkey_time(self):
        """Türkiye saatini al"""
        turkey_time = datetime.now(self.turkey_timezone)
        return turkey_time.strftime("%d/%m/%Y %H:%M:%S")
    
    def save_message_to_json(self, message):
        """Mesajı JSON dosyasına kaydet"""
        try:
            # Mevcut verileri oku
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Yeni mesaj verisini oluştur
            new_message = {
                "message": message,
                "timestamp": self.get_turkey_time(),
                "message_id": self.message_count
            }
            
            # Yeni mesajı listeye ekle
            data.append(new_message)
            
            # Güncellenmiş verileri dosyaya yaz
            with open(JSON_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"💾 Mesaj JSON dosyasına kaydedildi: {JSON_FILE}")
            
        except Exception as e:
            print(f"❌ JSON kaydetme hatası: {e}")
    
    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f"✅ MQTT Broker'a başarıyla bağlandı: {BROKER_HOST}:{BROKER_PORT}")
            print(f"📡 Topic: {TOPIC}")
            print(f"🆔 Client ID: {CLIENT_ID}")
            print("-" * 50)
            self.is_connected = True
            
            # Topic'e abone ol
            client.subscribe(TOPIC)
            print(f"🔔 {TOPIC} topic'ine abone olundu")
            print("-" * 50)
        else:
            print(f"❌ Bağlantı hatası! Kod: {rc}")
            self.is_connected = False
    
    def on_disconnect(self, client, userdata, rc):
        print("🔌 MQTT Broker bağlantısı kesildi")
        self.is_connected = False
    
    def on_message(self, client, userdata, msg):
        """Mesaj geldiğinde çalışır"""
        try:
            # Mesajı decode et
            message = msg.payload.decode('utf-8')
            self.message_count += 1
            
            # Türkiye saatini al
            turkey_time = self.get_turkey_time()
            
            # Konsola yazdır
            print(f"[{turkey_time}] #{self.message_count} 📨 Mesaj alındı:")
            print(f"📋 Topic: {msg.topic}")
            print(f"📄 Mesaj: {message}")
            print("-" * 50)
            
            # JSON dosyasına kaydet
            self.save_message_to_json(message)
            
        except Exception as e:
            print(f"❌ Mesaj işleme hatası: {e}")
    
    def connect(self):
        """MQTT Broker'a bağlan"""
        try:
            print(f"🔄 MQTT Broker'a bağlanılıyor: {BROKER_HOST}:{BROKER_PORT}")
            self.client.connect(BROKER_HOST, BROKER_PORT, 60)
            return True
        except Exception as e:
            print(f"❌ Bağlantı hatası: {e}")
            return False
    
    def start_listening(self):
        """Mesaj dinlemeyi başlat"""
        print("🎧 Mesaj dinleme başladı... (Durdurmak için Ctrl+C)")
        print(f"📁 Mesajlar {JSON_FILE} dosyasına kaydedilecek")
        print("-" * 50)
        
        try:
            # Bağlantı döngüsünü başlat
            self.client.loop_forever()
            
        except KeyboardInterrupt:
            print("\n\n⏹️  Mesaj dinleme durduruldu!")
            print(f"📊 Toplam {self.message_count} mesaj alındı")
        except Exception as e:
            print(f"❌ Hata oluştu: {e}")
        finally:
            self.disconnect()
    
    def disconnect(self):
        """MQTT bağlantısını kapat"""
        if self.client:
            self.client.disconnect()
            print("🔌 MQTT bağlantısı kapatıldı")

def main():
    print("☕ MQTT Coffee Mesaj Dinleyici")
    print("=" * 50)
    
    listener = MQTTListener()
    
    if listener.connect():
        listener.start_listening()
    else:
        print("❌ MQTT Broker'a bağlanılamadı!")

if __name__ == "__main__":
    main()