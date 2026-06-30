// Listas globales
let ListaCentros = [];
let listaActual = [];

// Carga el archivo JSON con todos los centros de reciclaje
// async/await se usa para esperar que el archivo cargue antes de continuar
async function cargarCentros() {

    // fetch busca y carga el archivo
    const respuesta = await fetch("data/centros.json");

    // .json() convierte la respuesta en un objeto JavaScript
    const centros = await respuesta.json();

    // Guarda el arreglo de centros en la variable global
    ListaCentros = centros.centros_reciclaje;

    // Filtra solo los centros que pagan por reciclaje para mostrar en el inicio
    listaActual = ListaCentros.filter(centro => centro.pagan === true);

    mostrarCentros(listaActual);
}

// Recibe un arreglo de centros y los muestra como tarjetas en el HTML
function mostrarCentros(lista) {

    // Busca el contenedor donde se van a insertar las tarjetas
    const contenedor = document.getElementById("centros");

    // Limpia el contenedor para evitar que se repitan las tarjetas
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="sin-resultados">No se encontraron centros disponibles.</p>`;
        return;
    }

    // Recorre cada centro del arreglo y crea su tarjeta en el HTML
    for (const centro of lista) {

        // Genera los spans de materiales como texto HTML
        let materialesHTML = "";
        const materiales = centro.materiales_aceptados ?? [];
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
    }

    // Expande la tarjeta al pasar el mouse o al tocarla en móvil
    const cartas = document.querySelectorAll(".carta");
    cartas.forEach((carta) => {
        const abrirCarta = () => {
            document.querySelectorAll(".carta-expandida").forEach((otraCarta) => {
                otraCarta.classList.remove("carta-expandida");
            });
            carta.classList.add("carta-expandida");
        };

        const cerrarCarta = () => {
            carta.classList.remove("carta-expandida");
        };

        carta.addEventListener("mouseenter", abrirCarta);
        carta.addEventListener("mouseleave", cerrarCarta);

        carta.addEventListener("click", (evento) => {
            evento.stopPropagation();
            if (carta.classList.contains("carta-expandida")) {
                cerrarCarta();
            } else {
                abrirCarta();
            }
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".carta-expandida").forEach((carta) => {
            carta.classList.remove("carta-expandida");
        });
    });
}

// Llama a la función principal para iniciar la carga
cargarCentros();

// Menú hamburguesa: abre o cierra el nav en pantallas pequeñas
document.getElementById("btnHamburguesa").addEventListener("click", function () {
    const nav = document.querySelector(".main-nav");
    nav.classList.toggle("abierto");
});