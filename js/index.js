let ListaCentros = [];
let listaActual = [];

async function cargarCentros() {

    const respuesta = await fetch("data/centros.json");
    const centros = await respuesta.json();

    ListaCentros = centros.centros_reciclaje;

    listaActual = ListaCentros.filter(
        centro => centro.destacado === true
    );

    mostrarCentros(listaActual);
}

function mostrarCentros(lista) {

    const contenedor = document.getElementById("centros");
    contenedor.innerHTML = "";

    lista.forEach(centro => {

        contenedor.innerHTML += `
        <div class="carta">

            <a href="detalle.html?id=${centro.id}" class="carta-link">

                <img src="${centro.imagen}" alt="${centro.nombre}">

                <div class="carta-info">
                    <h3>${centro.nombre}</h3>
                    <p class="carta-ubicacion">
                        ${centro.ubicacion_completa}
                    </p>
                </div>

            </a>

            <div class="materiales">
                ${centro.materiales_aceptados
                    .map(material => `<span>${material}</span>`)
                    .join("")}
            </div>

            <a
                href="https://www.google.com/maps?q=${centro.latitud},${centro.longitud}"
                target="_blank"
                class="botton-mapa"
            >
                Ver ubicación
            </a>

        </div>
        `;
    });
}

cargarCentros();