function setupHeaderEvents() {
  const btnOverview = document.getElementById('btn-overview');
  const btnHistory = document.getElementById('btn-history');
  // const headerTitle = document.querySelector('.header-title'); // Gerekirse erişim için örnek

  if (btnOverview) {
    btnOverview.addEventListener('click', function() {
      window.location.href = 'index.html';
    });
  }
  if (btnHistory) {
    btnHistory.addEventListener('click', function() {
      window.location.href = 'history.html';
    });
  }
}

window.setupHeaderEvents = setupHeaderEvents; 