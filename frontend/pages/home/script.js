await window.loadChartJS();

const treatmentCanvas = document.getElementById('treatmentChart');
if (treatmentCanvas) {
  const chart = new Chart(treatmentCanvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Ages 18–25 treated', 'Ages 18–25 untreated', 'Ages 26–49 treated', 'Ages 26–49 untreated', 'Ages 50+ treated', 'Ages 50+ untreated'],
      datasets: [{
        data: [0, 0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(13,110,253,0.8)', 'rgba(13,110,253,0.15)',
          'rgba(25,135,84,0.8)',  'rgba(25,135,84,0.15)',
          'rgba(255,193,7,0.8)',  'rgba(255,193,7,0.15)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } }
      }
    }
  });

  let animated = false;

  function checkInView() {
    if (animated) return;
    const rect = treatmentCanvas.getBoundingClientRect();
    // console.log('rect.top:', rect.top, 'scrollY:', window.scrollY);
    // only trigger if user has scrolled at least a bit AND element is in view
    if (window.scrollY > 100 && rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
      animated = true;
      chart.data.datasets[0].data = [49.9, 50.1, 57.3, 42.7, 48.1, 51.9];
      chart.update();
    }
  }

  document.addEventListener('scroll', checkInView, true);
}