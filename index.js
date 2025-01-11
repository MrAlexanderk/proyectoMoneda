const resultado = document.getElementById('resultado');
const btn = document.getElementById('agregar');
const select = document.getElementById('moneda');
const graficoCanvas = document.getElementById('grafico');
const info = document.getElementById('info');

let chart = null;
let hoy;
let fechas = [];
let datas = [];

btn.addEventListener('click', () => {
    actualizarLosDatos(select.value);
});

const actualizarLosDatos = async (moneda) => {
    let mValue = await obtenerValoresMonedas(select.value);
    let cantidad = document.getElementById('cantidad').value;
    resultado.innerHTML = (cantidad / mValue).toFixed(2);

    await calcularFechas(moneda);
    await graficarDatos();

}

const calcular = async function () {
    await calcularFechas(select.value);
    await actualizarDatos();

    let mValue = await obtenerValoresMonedas(select.value);
    let cantidad = document.getElementById('cantidad').value;
    resultado.innerHTML = (cantidad / mValue).toFixed(2);

};

const calcularFechas = async (moneda) => {
    info.innerHTML = 'Calculando...';
    let hoy = new Date();
    fechas = [];
    datas = [];
    let completadas = 0;
    let revisadas = 0;

    while(completadas < 10) {
        let fechaPorRevisar = new Date();
        fechaPorRevisar.setDate(hoy.getDate() - revisadas);
        console.log(`${fechaPorRevisar}`);
        revisadas++;
        try {
            const dia = fechaPorRevisar.getDate().toString().padStart(2, '0');
            const mes = (fechaPorRevisar.getMonth() + 1).toString().padStart(2, '0');
            const año = fechaPorRevisar.getFullYear();
            const fechaFormateada = `${dia}-${mes}-${año}`;
            const res = await fetch(`https://mindicador.cl/api/${moneda}/${fechaFormateada}`);

            const data = await res.json();

            fechas[completadas] = `${dia}-${mes}-${año}`;
            datas[completadas] = parseFloat(data.serie[0].valor);
            completadas++;

        } catch (error) {
            console.error(`El día ${fechas[completadas]} no tiene datos. Revisando siguiente fecha...`);
            continue;
        }
    }
    datas.reverse();
    fechas.reverse();
    info.innerHTML = 'Actualizado.';
}

const graficarDatos = async () => {
    if (!chart) {
        chart = new Chart(graficoCanvas, {
            type: 'line',
            data: {
                labels: fechas,
                datasets: [{
                    label: 'Cambio durante el año',
                    data: datas,
                    fill: false,
                    tension: 0.5,
                    borderWidth: 1,
                    borderColor: 'blue'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    } else {
        chart.data.datasets[0].data = datas;
        chart.update();
    }
}

async function obtenerValoresMonedas(moneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        const data = await res.json();
        const valor = parseFloat(data.serie[0].valor);
        return valor;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        return null;
    }
}



const actualizarDatos = async () => {
    let datosAnuales = await obtenerDatosDelAno(select.value);

    if (!chart) {
        let hoy = new Date();
        fechas = [];
        
        for (let i = 0; i < 10; i++) {
            // Crear una nueva instancia de la fecha para evitar modificar la original
            let fecha = new Date(hoy);
        
            // Restar i días
            fecha.setDate(hoy.getDate() - i);
        
            const dia = fecha.getDate().toString().padStart(2, '0'); // Añade 0 si el día tiene 1 dígito
            const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11, por eso sumamos 1
            const año = fecha.getFullYear();
        
            // Guardar la fecha en el arreglo
            fechas[i] = `${dia}-${mes}-${año}`;
        }
        fechas.reverse();
        console.log(fechas);

        chart = new Chart(graficoCanvas, {
            type: 'line',
            data: {
                labels: fechas,
                datasets: [{
                    label: 'Cambio durante el año',
                    data: datosAnuales,
                    fill: false,
                    tension: 0.5,
                    borderWidth: 1,
                    borderColor: 'blue'
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    } else {

        chart.data.datasets[0].data = datosAnuales;
        chart.update();
    }
};

async function obtenerDatosDelAno(moneda) {
    let datas = [];
    for(let i = 0; i < fechas.length; i++) {
        let index = i < 10 ? `0${i}` : i.toString();
        try {
            const res = await fetch(`https://mindicador.cl/api/${moneda}/${fechas[i]}`);
            const data = await res.json();
            console.log(data.serie[0].valor);
            datas.push(parseFloat(data.serie[0].valor));
        } catch (error) {
            console.error('Error al obtener los datos:', error);
            datas.push(0);
        }
    }
    return datas;
}



actualizarLosDatos(select.value);
