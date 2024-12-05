document.addEventListener('DOMContentLoaded', () => {
    const chartData = {
        bar: {
            elementId: 'bar-chart',
            title: 'Producción de Energía Renovable por Fuente (Colombia, 2021)',
            csvFiles: [
                '08_wind_generation.csv',
                '12_solar_energy_consumption.csv',
                '05_hydropower_consumption.csv',
                '16_biofuel_production.csv',
                '17_installed_geothermal_capacity.csv'
            ]
        },
        pie: {
            elementId: 'pie-chart',
            title: 'Participación de Energías Renovables (Colombia, 2021)',
            csvFiles: [
                '04_share_electricity_renewables.csv',
                '11_share_electricity_wind.csv',
                '15_share_electricity_solar.csv',
                '07_share-electricity-hydro.csv'
            ]
        },
        line: {
            elementId: 'line-chart',
            title: 'Tendencia en la Capacidad Instalada (Colombia)',
            csvFiles: [
                '09_cumulative_installed_wind_energy_capacity_gigawatts.csv',
                '13_installed_solar_PV_capacity.csv',
                '17_installed_geothermal_capacity.csv'
            ]
        },
        area: {
            elementId: 'area-chart',
            title: 'Comparación entre Consumo de Energía Renovable y Convencional (Colombia)',
            csvFiles: [
                '02_modern_renewable_energy_consumption.csv',
                '03_modern_renewable_prod.csv'
            ]
        }
    };

    async function fetchCSV(filePath) {
        try {
            const response = await fetch(`../archive2/${filePath}`);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Error loading file ${filePath}:`, error);
            return null;
        }
    }

    function parseCSV(csvText, filterByCountry = false, year = null) {
        const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim()));
        const labels = rows[0];
        let dataRows = rows.slice(1);

        if (filterByCountry) {
            dataRows = dataRows.filter(row => row.includes('Colombia') && (!year || row.includes(year.toString())));
        } else {
            dataRows = dataRows.filter(row => row.includes('Colombia'));
        }

        if (dataRows.length === 0) {
            dataRows = [[labels[0], 'Colombia', year || 'N/A', 0]];
        }

        const data = dataRows.map(row => row.map((value, index) => (index > 1 ? parseFloat(value) || 0 : value)));
        return { labels, data };
    }

    async function createChart(config, type) {
        const datasets = await Promise.all(config.csvFiles.map(fetchCSV));
        const parsedDatasets = datasets
            .filter(csv => csv)
            .map(csv => parseCSV(csv, type !== 'line' && type !== 'area', 2021));
    
        const labels = parsedDatasets[0]?.labels.slice(2) || [];
        const data = parsedDatasets.map(({ data }) => data.map(row => row.slice(2)).flat());
    
        const ctx = document.getElementById(config.elementId)?.getContext('2d');
        if (!ctx) {
            console.error(`No se encontró el elemento con ID: ${config.elementId}`);
            return;
        }
    
        // Colores personalizados para gráficos de tipo "pie" (solo dos colores)
        const pieColors = [
            'rgba(0, 200, 83, 0.6)',    // Verde
            'rgba(255, 235, 59, 0.6)'   // Amarillo
        ];
        
    
        // Colores personalizados para otros tipos de gráficos (diferentes colores para más de dos datos)
        const otherColors = [
            'rgba(0, 123, 255, 0.6)',    // Azul
            'rgba(40, 167, 69, 0.6)',    // Verde
            'rgba(255, 193, 7, 0.6)',    // Amarillo
            'rgba(255, 87, 34, 0.6)',    // Rojo anaranjado
            'rgba(0, 188, 212, 0.6)',   // Cian
            'rgba(156, 39, 176, 0.6)',   // Púrpura
            'rgba(233, 30, 99, 0.6)'     // Rosa fuerte
        ];
    
        new Chart(ctx, {
            type,
            data: {
                labels,
                datasets: data.map((values, index) => ({
                    label: config.csvFiles[index].replace('.csv', ''),
                    data: values,
                    backgroundColor: type === 'pie'
                        ? pieColors[index % pieColors.length]  // Usa solo dos colores para gráficos tipo "pie"
                        : otherColors[index % otherColors.length], // Usa diferentes colores para otros tipos
                    borderColor: type === 'pie'
                        ? pieColors[index % pieColors.length].replace('0.6', '1')  // Bordes más fuertes para "pie"
                        : otherColors[index % otherColors.length].replace('0.6', '1'), // Bordes más fuertes para otros gráficos
                    borderWidth: 2,
                    fill: type === 'line' && config.elementId === 'area-chart'
                }))
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: config.title
                    }
                },
                responsive: true,
                scales: type !== 'pie' ? {
                    y: {
                        beginAtZero: true
                    }
                } : {}
            }
        });
    }
    
    
    

    Object.entries(chartData).forEach(([type, config]) => {
        createChart(config, type === 'area' ? 'line' : type);
    });
});
