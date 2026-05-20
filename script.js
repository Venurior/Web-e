const galleryGrid = document.getElementById('card-display');
const searchBar = document.getElementById('searchBar');
const filterReino = document.getElementById('filterReino');
const filterClase = document.getElementById('filterClase');
const filterHabilidad = document.getElementById('filterHabilidad');
const filterFuerza = document.getElementById('filterFuerza');
const modal = document.getElementById('card-modal');

// 1. Renderizar Galería (Usa cartasEterrion de datos.js)
function renderCards(lista) {
    galleryGrid.innerHTML = "";

    if (lista.length === 0) {
        galleryGrid.innerHTML = '<p class="no-results">No se encontraron héroes.</p>';
        return;
    }

    // Limitamos a 130 según tu Excel
    const dataAMostrar = lista.slice(0, 130);
    const fragment = document.createDocumentFragment();

    // Agrupar cartas por rareza
    const cartasPorRareza = {};
    dataAMostrar.forEach(carta => {
        const rareza = carta.rareza || "Desconocida";
        if (!cartasPorRareza[rareza]) cartasPorRareza[rareza] = [];
        cartasPorRareza[rareza].push(carta);
    });

    // Orden de rarezas deseado
    const ordenRarezas = ["Común", "Rara", "Hito", "Épica", "Legendaria"];
    const rarezasPresentes = Object.keys(cartasPorRareza).sort((a, b) => {
        let indexA = ordenRarezas.indexOf(a);
        let indexB = ordenRarezas.indexOf(b);
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
    });

    rarezasPresentes.forEach(rareza => {
        // Título de la rareza
        const titulo = document.createElement('h2');
        titulo.className = 'rarity-title';
        titulo.innerText = rareza;
        fragment.appendChild(titulo);

        // Cartas de esa rareza
        cartasPorRareza[rareza].forEach(carta => {
            const div = document.createElement('div');
            div.className = 'card-item';
            if (carta.clase === 'Hito') {
                div.classList.add('hito');
            }
            div.tabIndex = 0; // Para accesibilidad con teclado
            // Buscamos la imagen por el nombre de archivo que viene en el JS
            div.innerHTML = `<img src="img/cartas/${carta.img}" alt="Carta de ${carta.nombre}" loading="lazy">`;
            div.onclick = () => openModal(carta);
            div.onkeydown = (e) => { if (e.key === 'Enter') openModal(carta); };
            fragment.appendChild(div);
        });
    });
    
    galleryGrid.appendChild(fragment);
}

// 2. Abrir Ficha de Personaje
function openModal(carta) {
    if (carta.clase === 'Hito') {
        modal.classList.add('hito-modal');
    } else {
        modal.classList.remove('hito-modal');
    }

    // Imagen de la carta
    document.getElementById("modal-img").src = `img/cartas/${carta.img}`;
    
    // Imagen del personaje (Usando su NOMBRE)
    const bgArt = document.getElementById("modal-bg-art");
    bgArt.style.backgroundImage = `url("img/personajes/${carta.nombre}.png")`;
    
    // Icono del Reino
    document.getElementById("modal-reino-icon").src = `img/iconos/${carta.reino}.png`;

    // Textos
    document.getElementById("modal-name").innerText = carta.nombre;
    document.getElementById("modal-tags").innerText = `${carta.reino} | ${carta.clase}`;
    document.getElementById("modal-fuerza").innerText = carta.fuerza;
    document.getElementById("modal-rareza").innerText = carta.rareza;
    document.getElementById("modal-tecnica-tit").innerText = carta.tecnica_1;
    document.getElementById("modal-tecnica-desc").innerText = carta.expl_tec_1;
    document.getElementById("modal-lore").innerText = carta.lore;

    modal.classList.add("show");
    document.body.classList.add("modal-open"); // Bloquea scroll fondo
}

// 3. Cerrar Modal
function closeModal() {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
}

document.querySelector(".close-btn").onclick = closeModal;

window.onclick = (e) => {
    if (e.target == modal) {
        closeModal();
    }
};

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
        closeModal();
    }
});

// 4. Buscador y Filtros
function filtrar() {
    const busqueda = searchBar.value.toLowerCase();
    const reinoSel = filterReino.value;
    const claseSel = filterClase.value;
    const habSel = filterHabilidad.value;
    const fuerzaSel = filterFuerza.value;

    const filtradas = cartasEterrion.filter(c => {
        const matchNombre = c.nombre.toLowerCase().includes(busqueda);
        const matchReino = (reinoSel === "all" || c.reino === reinoSel);
        const matchClase = (claseSel === "all" || c.clase === claseSel);
        const matchHab = (habSel === "all" || c.habilidad_1 === habSel || c.habilidad_2 === habSel);
        
        let matchFuerza = true;
        if (fuerzaSel !== "all") {
            const f = parseInt(c.fuerza);
            if (isNaN(f)) {
                matchFuerza = false;
            } else {
                if (fuerzaSel === "0-3" && (f < 0 || f > 3)) matchFuerza = false;
                if (fuerzaSel === "4-6" && (f < 4 || f > 6)) matchFuerza = false;
                if (fuerzaSel === "7+" && f < 7) matchFuerza = false;
            }
        }

        return matchNombre && matchReino && matchClase && matchHab && matchFuerza;
    });

    renderCards(filtradas);
}

searchBar.oninput = filtrar;
filterReino.onchange = filtrar;
filterClase.onchange = filtrar;
filterHabilidad.onchange = filtrar;
filterFuerza.onchange = filtrar;

// Inicio
renderCards(cartasEterrion);