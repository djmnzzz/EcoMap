// Listas
let ListaCentros = [];
let listaActual = [];
let materialesActuales = "Todos";

// Carga el archivo JSON con todos los centros
// async/await: espera que el archivo cargue antes de continuar
async function cargarCentros() {

    // fetch busca y carga el archivo
    const respuesta = await fetch("data/centros.json");

    // .json() convierte la respuesta en un objeto JavaScript
    const datos = await respuesta.json();

    // Guarda el arreglo de centros en la variable global
    ListaCentros = datos.centros_reciclaje;

    // RECUPERACIÓN AUTOMÁTICA: restaura el filtro y búsqueda guardados en localStorage
    const filtroGuardado = localStorage.getItem("filtroActivo");
    const busquedaGuardada = localStorage.getItem("busquedaActiva");
    const paganGuardado = localStorage.getItem("filtroPagan");
    const activosGuardado = localStorage.getItem("filtroActivos");

    if (paganGuardado === "true") {
        const pagan = document.getElementById("soloPagan");
        if (pagan) pagan.checked = true;
    }
    if (activosGuardado === "true") {
        const activos = document.getElementById("soloActivos");
        if (activos) activos.checked = true;
    }

    if (filtroGuardado) {
        materialesActuales = filtroGuardado;

        // Marca visualmente el botón que corresponde al filtro guardado
        for (const boton of document.querySelectorAll(".filtros button")) {
            const onclickStr = boton.getAttribute("onclick") || "";
            if (onclickStr.includes(`'${filtroGuardado}'`)) {
                boton.classList.add("activo");
            } else {
                boton.classList.remove("activo");
            }
        }
    }

    if (busquedaGuardada) {
        document.getElementById("busqueda").value = busquedaGuardada;
    }

    actualizarCentros();
}

// Recibe un arreglo de centros y los muestra como tarjetas en el HTML
function mostrarCentros(lista) {

    // Busca el contenedor donde se insertan las tarjetas
    const contenedor = document.getElementById("centros");

    // Limpia el contenedor para evitar tarjetas duplicadas
    contenedor.innerHTML = "";

    // Si no hay resultados, muestra un mensaje de estado vacío
    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="estado-vacio">
                <i class="fa-solid fa-box-open"></i>
                <p>No se encontraron centros con ese criterio.</p>
            </div>`;
        return;
    }

    // Recorre cada centro del arreglo y genera su tarjeta
    for (const centro of lista) {

        // Revisa si este centro está guardado como favorito
        const favs = JSON.parse(localStorage.getItem("favoritos") || "[]");
        const esFavorito = favs.includes(centro.id);

        // Genera los spans de materiales como texto HTML
        const materiales = centro.materiales_aceptados ?? [];
        let materialesHTML = "";
        for (const material of materiales) {
            materialesHTML += `<span>${material}</span>`;
        }

        contenedor.innerHTML += `
    <div class="carta">

        <div class="carta-link">

            <div class="carta-img">
                <img src="${centro.imagen}" alt="${centro.nombre}">
            </div>

            <div class="carta-info">
                <h3>${centro.nombre}</h3>
                <p class="carta-ubicacion">
                    <i class="fa-solid fa-location-dot"></i>
                    ${centro.ubicacion_completa ?? "Ubicación no disponible"}
                </p>
            </div>

        </div>

        <div class="carta-extra">

            <p class="descripcion">
                ${centro.descripcion ?? "Sin descripción disponible"}
            </p>

            <div class="materiales">
                ${materialesHTML}
            </div>

            <div class="info-centro">

                <div class="info-item">
                    <i class="fa-solid fa-clock"></i>
                    <span>${centro.horario ?? "Horario no disponible"}</span>
                </div>

                <div class="info-item">
                    <i class="fa-solid fa-phone"></i>
                    <span>${centro.contacto ?? "Sin contacto"}</span>
                </div>

                <div class="info-item">
                    <i class="fa-solid fa-coins"></i>
                    <span>${centro.pagan ? "Paga por reciclaje" : "No paga por reciclaje"}</span>
                </div>

                <div class="info-item">
                    <i class="fa-solid fa-list-check"></i>
                    <span>${centro.estado ?? "Inactivo"}</span>
                </div>
            </div>

            <button class="btn-favorito ${esFavorito ? 'guardado' : ''}"
                    onclick="toggleFavorito(${centro.id}, this)">
                <i class="fa-${esFavorito ? 'solid' : 'regular'} fa-heart"></i>
                ${esFavorito ? 'Guardado' : 'Guardar'}
            </button>

        ${centro.latitud && centro.longitud ? `
            <a href="https://www.google.com/maps?q=${centro.latitud},${centro.longitud}"
                target="_blank"
                rel="noopener noreferrer"
                class="boton-mapa">

                <i class="fa-solid fa-map-location-dot"></i>
                Ver ubicación
            </a>
        ` : `
            <button class="boton-mapa boton-sin-ubicacion" onclick="mostrarToast('Ubicación exacta no disponible para este centro')">
                <i class="fa-solid fa-map-location-dot"></i>
                Ubicación no disponible
            </button>
        `}

        </div>
    </div>
    `;
    }
}

// Llama la carga de datos al iniciar la página
cargarCentros();

// Guarda el material seleccionado y actualiza el catálogo
function filtrar(materiales_aceptados) {
    materialesActuales = materiales_aceptados;
    localStorage.setItem("filtroActivo", materiales_aceptados);

    if (materiales_aceptados === "Todos") {
        // Limpia el campo de búsqueda
        const busqueda = document.getElementById("busqueda");
        if (busqueda) busqueda.value = "";
        localStorage.removeItem("busquedaActiva");

        // Desmarca los checkboxes de filtros extra
        const pagan = document.getElementById("soloPagan");
        const activos = document.getElementById("soloActivos");
        if (pagan) pagan.checked = false;
        if (activos) activos.checked = false;
        localStorage.setItem("filtroPagan", false);
        localStorage.setItem("filtroActivos", false);
    }

    actualizarCentros();

}

// Aplica el filtro de material y la búsqueda de texto al mismo tiempo
// y muestra los centros que cumplan ambas condiciones
function actualizarCentros() {

    // Lee el texto escrito en el campo de búsqueda
    const busqueda = document.getElementById("busqueda");
    const termino = busqueda ? busqueda.value.toLowerCase() : "";

    // Guarda el texto de búsqueda en localStorage
    if (busqueda) localStorage.setItem("busquedaActiva", busqueda.value);

    const soloPagan = document.getElementById("soloPagan")?.checked || false;
    const soloActivos = document.getElementById("soloActivos")?.checked || false;

    // Guarda el estado de los checkboxes
    localStorage.setItem("filtroPagan", soloPagan);
    localStorage.setItem("filtroActivos", soloActivos);

    let resultado = [...ListaCentros];

    // Filtra por material si hay uno seleccionado
    // .includes() revisa si el arreglo de materiales del centro contiene el elegido
    if (materialesActuales !== "Todos") {
        resultado = resultado.filter(centro =>
            (centro.materiales_aceptados ?? []).includes(materialesActuales)
        );
    }

    // Filtra por texto de búsqueda si el usuario escribió algo
    if (termino) {
        resultado = resultado.filter(centro =>
            centro.nombre.toLowerCase().includes(termino) ||
            (centro.ubicacion_completa ?? "").toLowerCase().includes(termino)
        );
    }

    if (soloPagan) {
        resultado = resultado.filter(centro => centro.pagan === true);
    }

    if (soloActivos) {
        resultado = resultado.filter(centro => centro.estado === "Activo");
    }


    listaActual = resultado;

    const conteo = document.getElementById("conteo-centros");
    if (conteo) {
        conteo.textContent = resultado.length === 0
            ? ""
            : `${resultado.length} centro${resultado.length !== 1 ? "s" : ""} encontrado${resultado.length !== 1 ? "s" : ""}`;
    }
    mostrarCentros(listaActual);
}

// Quita la clase activo de todos los botones y la pone solo en el presionado
function activarBoton(btn) {
    for (const boton of document.querySelectorAll(".filtros button")) {
        boton.classList.remove("activo");
    }
    btn.classList.add("activo");
}

function toggleFavorito(id, btn) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(f => f !== id);
        btn.innerHTML = '<i class="fa-regular fa-heart"></i> Guardar';
        btn.classList.remove("guardado");
        mostrarToast("Centro eliminado de favoritos");
    } else {
        favoritos.push(id);
        btn.innerHTML = '<i class="fa-solid fa-heart"></i> Guardado';
        btn.classList.add("guardado");
        mostrarToast("¡Centro guardado en favoritos!");
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

function mostrarToast(mensaje) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("toast-visible"), 10);
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Menú hamburguesa
document.getElementById("btnHamburguesa").addEventListener("click", function () {
    const nav = document.querySelector(".main-nav");
    nav.classList.toggle("abierto");
});