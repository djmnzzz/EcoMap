// Array, se guardan los datos de la bitácora
let bitacora = [];

// Materiales para el forms
const materialesDisponibles = ["Papel", "Cartón", "Plástico", "Vidrio", "Aluminio", "Metales"];

// Llena los materiales
function llenarSelectMateriales() {
    const select = document.getElementById("selectMaterial");

    materialesDisponibles.forEach(material => {
        const opcion = document.createElement("option");
        opcion.value = material;
        opcion.textContent = material;
        select.appendChild(opcion);
    });
}

// lee el localstorage y lo guarda en bitácora
function cargarBitacoraDeStorage() {
    const datosGuardados = localStorage.getItem("ecomap_bitacora");

    if (datosGuardados) {
        bitacora = JSON.parse(datosGuardados);
    }

    actualizarInterfaz(); // actualiza la tabla y el resumen
}

// llena el select de centros
async function cargarCentrosParaSelect() { // async es para que no se congele mientras carga datos
    const respuesta = await fetch("data/centros.json"); // await dice que no siga hasta que esten esos datos listos
    const datos = await respuesta.json();
    const centros = datos.centros_reciclaje;

    const select = document.getElementById("selectCentro");

    centros.forEach(centro => {
        const opcion = document.createElement("option");
        opcion.value = centro.nombre;
        opcion.textContent = centro.nombre;
        select.appendChild(opcion);
    });
}

// se agrega para enviar el forms
document.querySelector(".bitacora-form").addEventListener("submit", function (evento) {
    evento.preventDefault(); // evita que la página se recargue

    const material = document.getElementById("selectMaterial").value;
    const cantidad = document.getElementById("cantidadMaterial").value;
    const centro = document.getElementById("selectCentro").value;
    const fecha = document.getElementById("fechaAccion").value;

    // que ninguno este vacio
    if (material === "" || cantidad === "" || centro === "" || fecha === "") {
        alert("Por favor completa todos los campos.");
        return; // detiene la función 
    }

    // que sea mas de 0 
    if (Number(cantidad) <= 0) {
        alert("La cantidad debe ser mayor a 0.");
        return;
    }

    // se crea si todo esta validado
    const nuevoRegistro = {
        id: Date.now(), // id único usando la fecha 
        material: material,
        cantidad: Number(cantidad),
        centro: centro,
        fecha: fecha
    };

    // agregar al arreglo
    bitacora.push(nuevoRegistro);

    // guardar en localstorage
    guardarBitacoraEnStorage();

    // se actualiza todo
    actualizarInterfaz();

    // ae limpia el forms
    this.reset();
});

// guarda en localstorage
function guardarBitacoraEnStorage() {
    localStorage.setItem("ecomap_bitacora", JSON.stringify(bitacora));
}

// actualiza los datos
function actualizarInterfaz() {
    mostrarTabla();
    mostrarResumen();
    mostrarDesglose();
}

function mostrarTabla() {
    const tbody = document.getElementById("bitacoraBody");
    tbody.innerHTML = ""; // limpiamos antes

    // si no hay se muestra mensaje
    if (bitacora.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Aún no has registrado ninguna acción.</td></tr>`;
        return;
    }

    bitacora.forEach(registro => {
        tbody.innerHTML += `
            <tr>
                <td>${registro.fecha}</td>
                <td>${registro.material}</td>
                <td>${registro.cantidad} kg</td>
                <td>${registro.centro}</td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarRegistro(${registro.id})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// estadisticas
function mostrarResumen() {
    // si no hay nada se pone en 0
    if (bitacora.length === 0) {
        document.querySelector("#totalAcumulado strong").textContent = "0 kg";
        document.querySelector("#vecesReciclado strong").textContent = "0";
        document.querySelector("#materialMasReciclado strong").textContent = "-";
        document.querySelector("#cantidadMaterialTop strong").textContent = "0 kg";
        return;
    }

    // se suman todos los totales de materiales
    let total = 0;
    bitacora.forEach(registro => {
        total += registro.cantidad;
    });

    // el número de acciones
    const veces = bitacora.length;

    // material más reciclado - sumar por material y encontrar el mayor
    const totalesPorMaterial = {}; 

    bitacora.forEach(registro => {
        if (totalesPorMaterial[registro.material]) {
            totalesPorMaterial[registro.material] += registro.cantidad;
        } else {
            totalesPorMaterial[registro.material] = registro.cantidad;
        }
    });

    // busca el mas alto 
    let materialTop = "";
    let cantidadTop = 0;

    for (const material in totalesPorMaterial) {
        if (totalesPorMaterial[material] > cantidadTop) {
            materialTop = material;
            cantidadTop = totalesPorMaterial[material];
        }
    }

    //se muestran los resultados en el html
    document.querySelector("#totalAcumulado strong").textContent = total + " kg";
    document.querySelector("#vecesReciclado strong").textContent = veces;
    document.querySelector("#materialMasReciclado strong").textContent = materialTop;
    document.querySelector("#cantidadMaterialTop strong").textContent = cantidadTop + " kg";
}

// por si se quiere borrar un dato
function eliminarRegistro(id) {
    // filtrar dejando todos menos el que tiene ese id
    bitacora = bitacora.filter(registro => registro.id !== id);

    guardarBitacoraEnStorage();
    actualizarInterfaz();
}

// mostrar resumen - desglose
function mostrarDesglose() {
    const contenedor = document.getElementById("desgloseLista");
    contenedor.innerHTML = ""; // limpiar antes

    if (bitacora.length === 0) {
        contenedor.innerHTML = `<p>Aún no hay datos para mostrar.</p>`;
        return;
    }

    // sumar por material
    const totalesPorMaterial = {};

    bitacora.forEach(registro => {
        if (totalesPorMaterial[registro.material]) {
            totalesPorMaterial[registro.material] += registro.cantidad;
        } else {
            totalesPorMaterial[registro.material] = registro.cantidad;
        }
    });

    // calcular total para sacar el porcentaje
    let totalGeneral = 0;
    for (const material in totalesPorMaterial) {
        totalGeneral += totalesPorMaterial[material];
    }

    // para cada material se crea su linea
    for (const material in totalesPorMaterial) {
        const cantidad = totalesPorMaterial[material];
        const porcentaje = (cantidad / totalGeneral) * 100;

        contenedor.innerHTML += `
            <div class="desglose-fila">
                <span class="desglose-nombre">${material}</span>
                <div class="desglose-barra-fondo">
                    <div class="desglose-barra-relleno" style="width: ${porcentaje}%;"></div>
                </div>
                <span class="desglose-valor">${cantidad} kg (${porcentaje.toFixed(0)}%)</span>
            </div>
        `;
    }
}

// boton para vaciar los registros 
document.getElementById("btnVaciar").addEventListener("click", function () {
    if (bitacora.length === 0) {
        alert("No hay registros para eliminar.");
        return;
    }

    const confirmar = confirm("¿Estás seguro de que quieres vaciar toda tu bitácora? Esta acción no se puede deshacer.");

    if (confirmar) {
        bitacora = [];
        guardarBitacoraEnStorage();
        actualizarInterfaz();
    }
});


// cuando todo esté cargado
document.addEventListener("DOMContentLoaded", () => {
    llenarSelectMateriales();
    cargarCentrosParaSelect();
    cargarBitacoraDeStorage();
});