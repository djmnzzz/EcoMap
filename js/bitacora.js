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
    const hoy = new Date().toISOString().split("T")[0];
    if (this.value === "") {
        mostrarErrorCampo("fechaAccion", "errorFecha", "Selecciona una fecha.");
    } else if (this.value > hoy) {
        mostrarErrorCampo("fechaAccion", "errorFecha", "La fecha no puede ser futura.");
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

    const hoy = new Date().toISOString().split("T")[0];
    if (fecha === "") {
        mostrarErrorCampo("fechaAccion", "errorFecha", "Selecciona una fecha.");
        hayErrores = true;
    } else if (fecha > hoy) {
        mostrarErrorCampo("fechaAccion", "errorFecha", "La fecha no puede ser futura.");
        hayErrores = true;
    } else {
        limpiarErrorCampo("fechaAccion", "errorFecha");
    }

    // Si hay errores detiene el proceso y muestra mensaje general
    if (hayErrores) {
        mostrarMensajeFormulario("Por favor completa todos los campos correctamente.", "error-global");
        return;
    }
    // Muestra el resumen en el modal antes de confirmar
    document.getElementById("modalRegistrarTexto").textContent =
        `${cantidad} kg de ${material} en ${centro} el ${fecha}.`;

    abrirModal("modalRegistrar");

    // Al confirmar en el modal, guarda el registro
    document.getElementById("modalRegistrarConfirmar").onclick = function () {
        cerrarModal("modalRegistrar");

        const nuevoRegistro = {
            id: Date.now(),
            material,
            cantidad: Number(cantidad),
            centro,
            fecha
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
            const campo = document.getElementById(id);
            campo.classList.remove("valido", "invalido");

            if (id === "cantidadMaterial" || id === "fechaAccion") {
                campo.value = "";
            } else {
                campo.value = "";
            }
        }

        // Limpia el formulario y deja los campos listos para una nueva acción
        const formulario = document.querySelector(".bitacora-form");
        formulario.reset();

        // Reinicia el select de centros para que no conserve opciones previas
        document.getElementById("selectCentro").innerHTML =
            "<option value=''>Seleccione un centro de acopio</option>";

        // Limpia los mensajes de error visibles
        document.getElementById("errorMaterial").textContent = "";
        document.getElementById("errorCantidad").textContent = "";
        document.getElementById("errorCentro").textContent = "";
        document.getElementById("errorFecha").textContent = "";
    };
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

    // Actualiza las opciones del filtro con los materiales registrados
    const selectFiltro = document.getElementById("filtroBitacora");
    if (selectFiltro) {
        const materialesEnBitacora = [...new Set(bitacora.map(r => r.material))];
        selectFiltro.innerHTML = `<option value="Todos">Todos</option>`;
        for (const mat of materialesEnBitacora) {
            selectFiltro.innerHTML += `<option value="${mat}">${mat}</option>`;
        }
    }

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
    abrirModal("modalEliminar");

    document.getElementById("modalEliminarConfirmar").onclick = function () {
        cerrarModal("modalEliminar");
        bitacora = bitacora.filter(registro => registro.id !== id);
        guardarBitacoraEnStorage();
        actualizarInterfaz();
        mostrarMensajeFormulario("Registro eliminado.", "exito");
    };
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

    document.getElementById("modalEliminar").querySelector("p").textContent =
        "Se eliminarán todos los registros. Esta acción no se puede deshacer.";

    abrirModal("modalEliminar");

    document.getElementById("modalEliminarConfirmar").onclick = function () {
        cerrarModal("modalEliminar");
        // Restaura el texto original del modal para eliminaciones individuales
        document.getElementById("modalEliminar").querySelector("p").textContent =
            "Esta acción no se puede deshacer.";
        bitacora = [];
        guardarBitacoraEnStorage();
        actualizarInterfaz();
        mostrarMensajeFormulario("La bitácora ha sido vaciada.", "exito");
    };
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

// Filtra las filas de la tabla según el material seleccionado
function filtrarBitacora() {
    const filtro = document.getElementById("filtroBitacora").value;
    const lista = filtro === "Todos"
        ? bitacora
        : bitacora.filter(r => r.material === filtro);

    const tbody = document.getElementById("bitacoraBody");
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No hay registros para ese material.</td></tr>`;
        return;
    }

    for (const registro of lista) {
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

// Abre un modal por su id
function abrirModal(id) {
    document.getElementById(id).style.display = "flex";
}

// Cierra un modal por su id
function cerrarModal(id) {
    document.getElementById(id).style.display = "none";
}