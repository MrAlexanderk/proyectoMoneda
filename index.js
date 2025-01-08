const resultado = document.getElementById('resultado');
const btn = document.getElementById('agregar');
const select = document.getElementById('moneda');

btn.addEventListener('click', () => {
    calcular();
});


const calcular = async function(){
    let cantidad = document.getElementById('cantidad').value;
    let mValue = await obtenerValoresMonedas(select.value);

    const formattedValue = new Intl.NumberFormat('es-CL', {
        style: 'decimal', // Formato decimal
        minimumFractionDigits: 2, // Mínimo de 2 decimales
        maximumFractionDigits: 2  // Máximo de 2 decimales
    }).format(Math.round(cantidad / mValue));

    resultado.innerHTML = formattedValue;
}

async function obtenerValoresMonedas(moneda) {
    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);
        
        if (!res.ok) {
            throw new Error(`Error al consultar el indicador: ${moneda}`);
        }
        
        const data = await res.json();

        if (!data.serie || data.serie.length === 0) {
            throw new Error(`No hay datos disponibles para la moneda: ${moneda}`);
        }

        const valor = parseFloat(data.serie[0].valor);

        if (isNaN(valor)) {
            throw new Error(`El valor de la moneda no es un número válido: ${data.serie[0].valor}`);
        }

        console.log('Datos obtenidos:', data);
        console.log('Valor de la moneda:', valor);

        return valor;
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        return null;
    }
}