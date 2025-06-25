// Header componentini yükle
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-container').innerHTML = data;
    // Header yüklendikten sonra header.js'i yükle
    var script = document.createElement('script');
    script.src = 'header.js';
    script.onload = function() {
      if (window.setupHeaderEvents) window.setupHeaderEvents();
    };
    document.body.appendChild(script);
  }); 