const rutaBase = '../archive2/';
let datosCargados = false;
let paises = new Set();

function cargarDatos() {
    if (datosCargados) {
        return;
    }
    Papa.parse(rutaBase + '12_solar_energy_consumption.csv', {
        download: true,
        header: true,
        complete: function (results) {
            if (results.errors.length > 0) {
                mostrarErrores(results.errors);
                return;
            }
            let data = results.data;

            // Agregar países al select (usando sort para ordenar alfabeticamente)
            data.forEach(item => paises.add(item.Entity));
            const paisesArray = [...paises].sort(); // ordena alfabeticamente
            actualizarSelectPaises(paisesArray);

            // Establecer Colombia como seleccionado
            const selectPais = document.getElementById('paisFiltro');
            const colombiaOption = selectPais.querySelector(`option[value="Colombia"]`);
            if (colombiaOption) {
                colombiaOption.selected = true;
            } else {
                console.warn("No se encontró la opción 'Colombia' en el CSV.");
            }

            // Filtrar con Colombia por defecto
            filtrarDatos();
            datosCargados = true;
        },
        error: function (error) {
            const errorMensaje = `Error al cargar el archivo CSV: ${error.message}`;
            mostrarErrores([{ message: errorMensaje }]);
        }
    });
}


function actualizarSelectPaises(paises) {
    const selectPais = document.getElementById('paisFiltro');
    paises.forEach(pais => {
        const option = document.createElement('option');
        option.value = pais;
        option.text = pais;
        selectPais.appendChild(option);
    });
}


function filtrarDatos() {
    const paisSeleccionado = document.getElementById('paisFiltro').value;
    const yearInicio = parseInt(document.getElementById('yearInicio').value, 10) || 1965;
    const yearFin = parseInt(document.getElementById('yearFin').value, 10) || 2022;

    Papa.parse(rutaBase + '12_solar_energy_consumption.csv', {
        download: true,
        header: true,
        complete: function(results){
            if (results.errors.length > 0) {
                mostrarErrores(results.errors);
                return;
            }
            const dataFiltrada = results.data.filter(item => {
                const cumplePais = paisSeleccionado === '' || item.Entity === paisSeleccionado;
                const cumpleAnio = item.Year >= yearInicio && item.Year <= yearFin;
                return cumplePais && cumpleAnio;
            });
            mostrarDatos(dataFiltrada);
        },
        error: function(error){
            mostrarErrores([{ message: `Error al filtrar datos: ${error.message}`}]);
        }
    });
}

function mostrarDatos(data) {
    const tablaDatos = document.getElementById('tabla-datos');
    tablaDatos.innerHTML = ''; // Limpia la tabla antes de mostrar los datos
    data.forEach(item => {
        const row = tablaDatos.insertRow();
        Object.values(item).forEach(value => {
            const cell = row.insertCell();
            cell.textContent = value === undefined || value === null ? "" : value;
        });
    });
}


function mostrarErrores(errores) {
    const erroresContainer = document.createElement('div');
    erroresContainer.classList.add('alert', 'alert-danger');
    erroresContainer.style.marginTop = '20px';
    erroresContainer.innerHTML = '<h4>Errores al cargar los datos:</h4><ul>';
    errores.forEach(error => {
        erroresContainer.innerHTML += `<li>${error.message || error}</li>`;
    });
    erroresContainer.innerHTML += '</ul>';
    document.querySelector('main').appendChild(erroresContainer);
}

// Carga automática al iniciar
window.onload = cargarDatos;