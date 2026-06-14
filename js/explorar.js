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

        //crea la tarjeta y las va agregando
        contenedor.innerHTML += `
        <div class="carta">

            <a href="detalle.html?id=${centro.id}" class="carta-link">

                <img src="${centro.imagen}" alt="${centro.nombre}">

                <div class="carta-info">
                    <h3>${centro.nombre}</h3>
                    <p class="carta-ubicacion">${centro.ubicacion_completa}</p>
                </div>

            </a>

            <div class="carta-extra">

                <p>${centro.descripcion}</p>

                <div class="materiales">
                    ${centro.materiales_aceptados
                        .map(material => `<span>${material}</span>`)
                        .join("")}
                </div>

                <div class="carta-extra-info">

                    <div class="info-centro">
                        <p>
                            <i class="fa-solid fa-clock"></i>
                            ${centro.horario}
                        </p>

                        <p>
                            <i class="fa-solid fa-phone"></i>
                            ${centro.numero_telefono}
                        </p>
                    </div>

                    <a href="https://www.google.com/maps?q=${centro.latitud},${centro.longitud}"
                       target="_blank"
                       class="botton-mapa">

                        <i class="fa-solid fa-location-dot"></i>
                        Ver ubicación

                    </a>

                </div>

            </div>

        </div>
        `;
    });
}

cargarCentros();