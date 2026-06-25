let ListaCentros = [];
let listaActual = [];

async function cargarCentros() {

    const respuesta = await fetch("data/centros.json");
    const centros = await respuesta.json();

    ListaCentros = centros.centros_reciclaje;

    listaActual = ListaCentros.filter(
        centro => centro.Pagan === true
    );

    mostrarCentros(listaActual);
}

function mostrarCentros(lista) {

    const contenedor = document.getElementById("centros");
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

// Menú hamburguesa
document.getElementById("btnHamburguesa").addEventListener("click", function () {
    const nav = document.querySelector(".main-nav");
    nav.classList.toggle("abierto");
});