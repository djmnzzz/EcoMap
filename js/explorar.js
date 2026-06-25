// Listas
let ListaCentros = [];
let listaActual = [];

// Carga el JSON
//async = funcion asincronica y permite utilizar 
//await = Espera hasta que el archivo se haya cargado antes de continuar
//se utiliza para leer archivos o consultar una API.
async function cargarCentros() {

    //fetch busca y carga archivos
    const respuesta = await fetch("data/centros.json");

    //.json conviertes a un objeto JavaScript
    const datos = await respuesta.json();

    //Extrae el arreglo de centros
    ListaCentros = datos.centros_reciclaje;

    // Crea una copia de referencia para trabajar con filtros o búsquedas.
    //listaActual = ListaCentros;

    mostrarCentros(ListaCentros);
}

// Muestra los centros
function mostrarCentros(lista) {

    //Busca en el HTML algo que tenga un div id=crentros y lo guarda en contenedor
    const contenedor = document.getElementById("centros");

    //Borra todo lo que haya dentro de div, evita que repita las tarjetas
    contenedor.innerHTML = "";

    //recorre los elementos del arroglo
    lista.forEach(centro => {

        contenedor.innerHTML += `
    <div class="carta">

        <a href="detalle.html?id=${centro.id}" class="carta-link">

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

        </a>

        <div class="carta-extra">

            <p class="descripcion">
                ${centro.descripcion ?? "Sin descripción disponible"}
            </p>

            <div class="materiales">
                ${(centro.materiales_aceptados ?? [])
                .map(m => `<span>${m}</span>`)
                .join("")}
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

</div>

            <a href="https://www.google.com/maps?q=${centro.latitud},${centro.longitud}"
               target="_blank"
               rel="noopener noreferrer"
               class="boton-mapa">

                <i class="fa-solid fa-map-location-dot"></i>
                Ver ubicación
            </a>

        </div>
    </div>
    `;
    });
}

cargarCentros();

//PARA FILTRAR POR CATEGORIA
function filtrar(materiales_aceptados) {

    materialesActuales = materiales_aceptados;
    actualizarCentros();

}

//ACTUALIZA EL CATALOGO EN TODAS LAS COMBINACIONES
function actualizarCentros() {

    let resultado = [...ListaCentros];

    // FILTRO DE MATERIALES

    if (materialesActuales !== "Todos") {

        resultado = resultado.filter(
            centro => centro.materiales_aceptados.includes(materialesActuales)
        );
    }

    listaActual = resultado;

    mostrarCentros(listaActual);
}

// Menú hamburguesa
document.getElementById("btnHamburguesa").addEventListener("click", function () {
    const nav = document.querySelector(".main-nav");
    nav.classList.toggle("abierto");
});