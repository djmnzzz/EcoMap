// Array, se guardan los datos de la bitácora
let bitacora = []
let TodosLosCentros = []

// Lee el localStorage y carga los registros guardados previamente
function cargarBitacoraDeStorage() {
    const datosGuardados = localStorage.getItem("ecomap_bitacora");

    if (datosGuardados) {
        bitacora = JSON.parse(datosGuardados);
    }

    // Actualiza la tabla, el resumen y el desglose con los datos cargados
    actualizarInterfaz();
}

// Carga los centros desde el JSON, extrae los materiales únicos
// y llena el select de materiales del formulario
async function cargarDatosDelJSON() {

    // fetch busca y carga el archivo
    const respuesta = await fetch("data/centros.json");

    // .json() convierte la respuesta en un objeto JavaScript
    const datos = await respuesta.json();

    // Guarda todos los centros en la variable global para usarlos después
    TodosLosCentros = datos.centros_reciclaje;

    // Recorre todos los centros y recolecta los materiales sin repetir
    const materialesUnicos = [];
    for (const centro of TodosLosCentros) {
        const materiales = centro.materiales_aceptados ?? [];
        for (const material of materiales) {
            // Solo agrega el material si no está ya en la lista
            if (!materialesUnicos.includes(material)) {
                materialesUnicos.push(material);
            }
        }
    }

    // Llena el select de materiales con los valores únicos encontrados
    const selectMaterial = document.getElementById("selectMaterial");
    for (const material of materialesUnicos) {
        const opcion = document.createElement("option");
        opcion.value = material;
        opcion.textContent = material;
        selectMaterial.appendChild(opcion);
    }

    // Al inicio el select de centros está vacío, se llenará cuando se elija un material
}

// Cuando el usuario elige un material, filtra y muestra solo los centros
// que aceptan ese material en el select de centros
function actualizarCentrosPorMaterial() {

    const materialElegido = document.getElementById("selectMaterial").value;
    const selectCentro = document.getElementById("selectCentro");

    // Limpia el select de centros antes de llenarlo de nuevo
    selectCentro.innerHTML = "<option value=''>Seleccione un centro de acopio</option>";

    // Si no eligió ningún material, no muestra centros
    if (materialElegido === "") return;

    // Filtra los centros que aceptan el material elegido
    const centrosFiltrados = TodosLosCentros.filter(centro =>
        (centro.materiales_aceptados ?? []).includes(materialElegido)
    );

    // Agrega cada centro filtrado como opción en el select
    for (const centro of centrosFiltrados) {
        const opcion = document.createElement("option");
        opcion.value = centro.nombre;
        opcion.textContent = centro.nombre;
        selectCentro.appendChild(opcion);
    }
}

// Escucha el cambio en el select de material para actualizar los centros disponibles
document.getElementById("selectMaterial").addEventListener("change", function () {

    // Actualiza los centros según el material elegido
    actualizarCentrosPorMaterial();

    // Validación en tiempo real: verifica que el campo no quede vacío
    if (this.value === "") {
        mostrarErrorCampo("selectMaterial", "errorMaterial", "Selecciona un material.");
    } else {
        limpiarErrorCampo("selectMaterial", "errorMaterial");
    }
});

// Escucha cambios en la cantidad para validar en tiempo real
document.getElementById("cantidadMaterial").addEventListener("input", function () {
    if (this.value === "" || Number(this.value) <= 0) {
        mostrarErrorCampo("cantidadMaterial", "errorCantidad", "Ingresa una cantidad mayor a 0.");
    } else {
        limpiarErrorCampo("cantidadMaterial", "errorCantidad");
    }
});

// Escucha cambios en el select de centro para validar en tiempo real
document.getElementById("selectCentro").addEventListener("change", function () {
    if (this.value === "") {
        mostrarErrorCampo("selectCentro", "errorCentro", "Selecciona un centro de acopio.");
    } else {
        limpiarErrorCampo("selectCentro", "errorCentro");
    }
});

// Escucha cambios en la fecha para validar en tiempo real
document.getElementById("fechaAccion").addEventListener("change", function () {
    if (this.value === "") {
        mostrarErrorCampo("fechaAccion", "errorFecha", "Selecciona una fecha.");
    } else {
        limpiarErrorCampo("fechaAccion", "errorFecha");
    }
});

// Maneja el envío del formulario: valida, crea el registro y lo guarda
document.querySelector(".bitacora-form").addEventListener("submit", function (evento) {

    // Evita que la página se recargue al enviar el formulario
    evento.preventDefault();

    const material = document.getElementById("selectMaterial").value;
    const cantidad = document.getElementById("cantidadMaterial").value;
    const centro = document.getElementById("selectCentro").value;
    const fecha = document.getElementById("fechaAccion").value;

    // Valida cada campo y marca los que tengan error
    let hayErrores = false;

    if (material === "") {
        mostrarErrorCampo("selectMaterial", "errorMaterial", "Selecciona un material.");
        hayErrores = true;
    } else {
        limpiarErrorCampo("selectMaterial", "errorMaterial");
    }

    if (cantidad === "" || Number(cantidad) <= 0) {
        mostrarErrorCampo("cantidadMaterial", "errorCantidad", "Ingresa una cantidad mayor a 0.");
        hayErrores = true;
    } else {
        limpiarErrorCampo("cantidadMaterial", "errorCantidad");
    }

    if (centro === "") {
        mostrarErrorCampo("selectCentro", "errorCentro", "Selecciona un centro de acopio.");
        hayErrores = true;
    } else {
        limpiarErrorCampo("selectCentro", "errorCentro");
    }

    if (fecha === "") {
        mostrarErrorCampo("fechaAccion", "errorFecha", "Selecciona una fecha.");
        hayErrores = true;
    } else {
        limpiarErrorCampo("fechaAccion", "errorFecha");
    }

    // Si hay errores detiene el proceso y muestra mensaje general
    if (hayErrores) {
        mostrarMensajeFormulario("Por favor completa todos los campos correctamente.", "error-global");
        return;
    }

    // Crea el nuevo registro con un id único basado en la fecha actual
    const nuevoRegistro = {
        id: Date.now(),
        material: material,
        cantidad: Number(cantidad),
        centro: centro,
        fecha: fecha
    };

    // Agrega el registro al arreglo global
    bitacora.push(nuevoRegistro);

    // Guarda el arreglo actualizado en localStorage
    guardarBitacoraEnStorage();

    // Actualiza la tabla, el resumen y el desglose en pantalla
    actualizarInterfaz();

    // Muestra un mensaje de confirmación visual
    mostrarMensajeFormulario("¡Acción registrada exitosamente!", "exito");

    // Quita las clases de validación visual de los campos
    const campos = ["selectMaterial", "cantidadMaterial", "selectCentro", "fechaAccion"];
    for (const id of campos) {
        document.getElementById(id).classList.remove("valido", "invalido");
    }

    // Limpia el formulario
    this.reset();

    // Limpia el select de centros porque el reset vacía el material
    document.getElementById("selectCentro").innerHTML =
        "<option value=''>Seleccione un centro de acopio</option>";
});

// Guarda el arreglo de bitácora en localStorage como texto JSON
function guardarBitacoraEnStorage() {
    localStorage.setItem("ecomap_bitacora", JSON.stringify(bitacora));
}

// Llama a las tres funciones de visualización para refrescar toda la interfaz
function actualizarInterfaz() {
    mostrarTabla();
    mostrarResumen();
    mostrarDesglose();
}

// Recorre el arreglo de bitácora y muestra cada registro como fila en la tabla
function mostrarTabla() {
    const tbody = document.getElementById("bitacoraBody");

    // Limpia la tabla antes de volver a dibujarla
    tbody.innerHTML = "";

    // Si no hay registros, muestra un mensaje informativo
    if (bitacora.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">Aún no has registrado ninguna acción.</td></tr>`;
        return;
    }

    // Recorre cada registro y agrega una fila a la tabla
    for (const registro of bitacora) {
        tbody.innerHTML += `
            <tr>
                <td>${registro.fecha}</td>
                <td>${registro.material}</td>
                <td>${registro.cantidad} kg</td>
                <td>${registro.centro}</td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarRegistro(${registro.id})">Eliminar</button>
                </td>
            </tr>
        `;
    }
}

// Calcula y muestra las estadísticas: total acumulado, veces reciclado y material top
function mostrarResumen() {

    // Si no hay registros pone todo en cero
    if (bitacora.length === 0) {
        document.querySelector("#totalAcumulado strong").textContent = "0 kg";
        document.querySelector("#vecesReciclado strong").textContent = "0";
        document.querySelector("#materialMasReciclado strong").textContent = "-";
        document.querySelector("#cantidadMaterialTop strong").textContent = "0 kg";
        return;
    }

    // Suma todas las cantidades de la bitácora
    let total = 0;
    for (const registro of bitacora) {
        total += registro.cantidad;
    }

    // Cuenta cuántas veces se ha reciclado
    const veces = bitacora.length;

    // Crea un objeto para sumar la cantidad por cada material
    const totalesPorMaterial = {};
    for (const registro of bitacora) {
        if (totalesPorMaterial[registro.material]) {
            totalesPorMaterial[registro.material] += registro.cantidad;
        } else {
            totalesPorMaterial[registro.material] = registro.cantidad;
        }
    }

    // Busca el material con la cantidad más alta
    let materialTop = "";
    let cantidadTop = 0;
    for (const mat in totalesPorMaterial) {
        if (totalesPorMaterial[mat] > cantidadTop) {
            materialTop = mat;
            cantidadTop = totalesPorMaterial[mat];
        }
    }

    // Muestra los resultados en el HTML
    document.querySelector("#totalAcumulado strong").textContent = total + " kg";
    document.querySelector("#vecesReciclado strong").textContent = veces;
    document.querySelector("#materialMasReciclado strong").textContent = materialTop;
    document.querySelector("#cantidadMaterialTop strong").textContent = cantidadTop + " kg";
}

// Elimina el registro con el id dado usando .filter() y actualiza la interfaz
function eliminarRegistro(id) {
    bitacora = bitacora.filter(registro => registro.id !== id);
    guardarBitacoraEnStorage();
    actualizarInterfaz();
}

// Calcula el total por material y muestra una barra de progreso por cada uno
function mostrarDesglose() {
    const contenedor = document.getElementById("desgloseLista");

    // Limpia el contenedor antes de dibujarlo de nuevo
    contenedor.innerHTML = "";

    // Si no hay registros muestra un mensaje
    if (bitacora.length === 0) {
        contenedor.innerHTML = `<p>Aún no hay datos para mostrar.</p>`;
        return;
    }

    // Suma la cantidad por cada material
    const totalesPorMaterial = {};
    for (const registro of bitacora) {
        if (totalesPorMaterial[registro.material]) {
            totalesPorMaterial[registro.material] += registro.cantidad;
        } else {
            totalesPorMaterial[registro.material] = registro.cantidad;
        }
    }

    // Calcula el total general para sacar el porcentaje de cada material
    let totalGeneral = 0;
    for (const mat in totalesPorMaterial) {
        totalGeneral += totalesPorMaterial[mat];
    }

    // Crea una fila con barra de progreso para cada material
    for (const mat in totalesPorMaterial) {
        const cantidad = totalesPorMaterial[mat];
        const porcentaje = (cantidad / totalGeneral) * 100;

        contenedor.innerHTML += `
            <div class="desglose-fila">
                <span class="desglose-nombre">${mat}</span>
                <div class="desglose-barra-fondo">
                    <div class="desglose-barra-relleno" style="width: ${porcentaje}%;"></div>
                </div>
                <span class="desglose-valor">${cantidad} kg (${porcentaje.toFixed(0)}%)</span>
            </div>
        `;
    }
}

// Vacía toda la bitácora después de pedir confirmación al usuario
document.getElementById("btnVaciar").addEventListener("click", function () {

    if (bitacora.length === 0) {
        mostrarMensajeFormulario("No hay registros para eliminar.", "error-global");
        return;
    }

    const confirmar = confirm("¿Estás seguro de que quieres vaciar toda tu bitácora? Esta acción no se puede deshacer.");

    if (confirmar) {
        bitacora = [];
        guardarBitacoraEnStorage();
        actualizarInterfaz();
        mostrarMensajeFormulario("La bitácora ha sido vaciada.", "exito");
    }
});

// Muestra el texto de error debajo de un campo y lo marca visualmente
function mostrarErrorCampo(idCampo, idError, mensaje) {
    const campo = document.getElementById(idCampo);
    const error = document.getElementById(idError);
    campo.classList.add("invalido");
    campo.classList.remove("valido");
    error.textContent = mensaje;
}

// Quita el error de un campo y lo marca como válido
function limpiarErrorCampo(idCampo, idError) {
    const campo = document.getElementById(idCampo);
    const error = document.getElementById(idError);
    campo.classList.remove("invalido");
    campo.classList.add("valido");
    error.textContent = "";
}

// Muestra un mensaje de éxito o error dentro del formulario
// y lo oculta automáticamente después de 3 segundos
function mostrarMensajeFormulario(texto, tipo) {
    const msg = document.getElementById("mensajeFormulario");
    msg.textContent = texto;
    msg.className = "mensaje-formulario " + tipo;
    msg.style.display = "block";
    setTimeout(() => { msg.style.display = "none"; }, 3000);
}

// Menú hamburguesa: abre o cierra el nav en pantallas pequeñas
document.getElementById("btnHamburguesa").addEventListener("click", function () {
    const nav = document.querySelector(".main-nav");
    nav.classList.toggle("abierto");
});

// Cuando todo el HTML está listo, carga los datos y la bitácora guardada
document.addEventListener("DOMContentLoaded", () => {
    cargarDatosDelJSON();
    cargarBitacoraDeStorage();
});