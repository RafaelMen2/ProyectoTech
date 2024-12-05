async function calcularPorcentaje() {
    const consumoTotalKwhMes = parseFloat(document.getElementById('consumoTotalKwhMes').value);

    if (isNaN(consumoTotalKwhMes) || consumoTotalKwhMes <= 0) {
        alert("Por favor, ingresa un consumo válido.");
        return;
    }

    const valorUsuariosTwhAño = (consumoTotalKwhMes / 1000) * 12;
    const archivoSeleccionado = '12_solar_energy_consumption.csv';
    const rutaBase = '../archive2/';

    try {
        const response = await fetch(rutaBase + archivoSeleccionado);
        if (!response.ok) {
            throw new Error(`Error al obtener datos: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();
        const data = Papa.parse(csvText, { header: true }).data;

        console.log("Datos del CSV:", data);

        const registroColombia2021 = data.find(row => row.Entity === 'Colombia' && row.Year === '2021');
        if (!registroColombia2021) {
            throw new Error("Datos para Colombia en 2021 no encontrados.");
        }

        const energiaTwh = parseFloat(Object.values(registroColombia2021)[2]);

        console.log("Registro Colombia 2021:", registroColombia2021);
        console.log("Nombre de las columnas:", Object.keys(registroColombia2021));

        const energiaTwhString = registroColombia2021['Electricity from solar (TWh)'];
        console.log("Valor de la celda de energía antes del parseo:", energiaTwhString);

        if (isNaN(energiaTwh) || energiaTwh <= 0) {
            console.error(`Error al parsear el valor de energía: '${energiaTwhString}'`);
            alert("El archivo CSV contiene datos no válidos para Colombia en 2021. Por favor, revisa tu archivo.");
            return;
        }

        console.log("Valor de energía parseado:", energiaTwh);

        const porcentajeUsuario = (valorUsuariosTwhAño / energiaTwh) * 100;
        mostrarResultado(porcentajeUsuario, consumoTotalKwhMes);

    } catch (error) {
        console.error("Error al procesar los datos:", error);
        alert(`Hubo un error al calcular el porcentaje: ${error.message}`);
    }
}

function mostrarResultado(porcentaje, consumoUsuario) {
    const resultModal = document.getElementById('resultModal');
    const resultText = document.getElementById('resultText');

    console.log("Porcentaje calculado:", porcentaje);
    console.log("Consumo del usuario:", consumoUsuario);
    console.log("Elemento resultText:", document.getElementById('resultText'));
    const textoResultado = `Querido usuario usted ha consumido ${consumoUsuario} kWh/mes. Su consumo anual corresponde al ${porcentaje.toFixed(2)}% de la producción solar de Colombia en 2021.`;
    console.log("Texto que se intentará mostrar:", textoResultado);


    resultText.innerText = textoResultado;


    resultModal.classList.remove('hidden');
    document.getElementById('energyForm').classList.add('hidden');
}

document.getElementById('energyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    calcularPorcentaje();
});

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('resultModal').classList.add('hidden');
    document.getElementById('energyForm').classList.remove('hidden');
    document.getElementById('energyForm').reset();
});