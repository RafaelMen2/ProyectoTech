document.addEventListener('DOMContentLoaded', function() {
    // Gráfico de estadísticas rápidas
    const ctx = document.getElementById('renewableChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Solar', 'Eólica', 'Hidroeléctrica', 'Geotérmica'],
            datasets: [{
                data: [30, 25, 35, 10],
                backgroundColor: [
                    '#ffd700',
                    '#90caf9',
                    '#4caf50',
                    '#f44336'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
});