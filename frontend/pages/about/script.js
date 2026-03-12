await window.loadChartJS();

const suicideCanvas = document.getElementById('suicideRatesChart');
if (suicideCanvas) {
  const chart = new Chart(suicideCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: [
        '2000','2001','2002','2003','2004','2005','2006','2007','2008','2009',
        '2010','2011','2012','2013','2014','2015','2016','2017','2018','2019',
        '2020','2021','2022','2023','2024*'
      ],
      datasets: [{
        label: 'Suicide Rate (per 100,000)',
        data: new Array(25).fill(0),
        borderColor: 'rgba(220,53,69,0.8)',
        backgroundColor: 'rgba(220,53,69,0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(220,53,69,1)',
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      }]
    },
    options: {
      responsive: true,
      animation: { duration: 1400, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} per 100,000` } }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 9,
          ticks: { callback: val => val },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 10 }
        }
      }
    }
  });

  let animated = false;
  function checkInView() {
    if (animated) return;
    const rect = suicideCanvas.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0 && window.scrollY > 50) {
      animated = true;
      chart.data.datasets[0].data = [
        10.4, 10.8, 10.9, 10.8, 10.9, 11.0, 11.1, 11.3, 11.6, 12.0,
        12.1, 12.3, 12.6, 12.6, 13.0, 13.3, 13.5, 14.0, 14.2, 13.9,
        13.5, 14.1, 14.2, 14.1, 14.7
      ];
      chart.update();
      document.removeEventListener('scroll', checkInView, true);
    }
  }
  document.addEventListener('scroll', checkInView, true);
}