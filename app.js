import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATEkMaa_PRw1T2-sZ1CyhdRElG4COJwqA",
  authDomain: "bpuntito-8131c.firebaseapp.com",
  projectId: "bpuntito-8131c",
  storageBucket: "bpuntito-8131c.firebasestorage.app",
  messagingSenderId: "10419604048",
  appId: "1:10419604048:web:0e618d96e966d4b8261f55"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elementos del DOM
const input = document.getElementById("inputFrase");
const boton = document.getElementById("btnEnviar");
const frasesLayer = document.getElementById("frasesLayer");
const mensajeEstado = document.getElementById("mensajeEstado");

const frasesMostradas = new Map();
const MAX_FRASES_EN_PANTALLA = 40;

// Función para generar número aleatorio
function numeroRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Obtener tamaño del área donde se colocan las frases
function obtenerDimensionesLayer() {
  const ancho = frasesLayer.offsetWidth || window.innerWidth;
  const alto = frasesLayer.offsetHeight || window.innerHeight;

  return { ancho, alto };
}

// Generar una posición segura dentro de la pantalla
function generarPosicionAleatoria() {
  const { ancho, alto } = obtenerDimensionesLayer();

  const x = numeroRandom(20, Math.max(40, ancho - 220));
  const y = numeroRandom(20, Math.max(40, alto - 120));

  return { x, y };
}

// Formatear fecha
function formatearFecha(timestamp) {
  if (!timestamp) return "";

  const fecha = timestamp.toDate();

  return fecha.toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  });
}

// Crear elemento visual de una frase
function crearElementoFrase(data, id) {
  const frase = document.createElement("div");
  frase.className = "frase";
  frase.dataset.id = id;

  const texto = document.createElement("div");
  texto.textContent = data.texto || "";
  frase.appendChild(texto);

  if (data.createdAt) {
    const fecha = document.createElement("span");
    fecha.className = "fecha";
    fecha.textContent = formatearFecha(data.createdAt);
    frase.appendChild(fecha);
  }

  // Si la frase ya tiene posición guardada, se usa.
  // Si no, se le asigna una aleatoria para que no se amontone.
  const posicion = generarPosicionAleatoria();
  const x = data.x ?? posicion.x;
  const y = data.y ?? posicion.y;

  frase.style.position = "absolute";
  frase.style.left = `${x}px`;
  frase.style.top = `${y}px`;

  return frase;
}

// Renderizar frases
function renderizarFrases(docs) {
  frasesLayer.innerHTML = "";
  frasesMostradas.clear();

  docs.forEach((docItem) => {
    const data = docItem.data();
    const id = docItem.id;

    const frase = crearElementoFrase(data, id);
    frasesLayer.appendChild(frase);
    frasesMostradas.set(id, frase);
  });
}

// Guardar frase nueva
async function guardarFrase() {
  const texto = input.value.trim().slice(0, 120);

  if (!texto) {
    mensajeEstado.textContent = "Escribe algo primero.";
    return;
  }

  boton.disabled = true;
  mensajeEstado.textContent = "Enviando...";

  try {
    const { x, y } = generarPosicionAleatoria();

    await addDoc(collection(db, "miedos"), {
      texto,
      x,
      y,
      createdAt: serverTimestamp()
    });

    input.value = "";
    mensajeEstado.textContent = "Guardado.";
  } catch (error) {
    console.error("Error al guardar frase:", error);
    mensajeEstado.textContent = "No se pudo guardar.";
  } finally {
    boton.disabled = false;
  }
}

// Eventos
boton.addEventListener("click", guardarFrase);

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    guardarFrase();
  }
});

// Consulta de frases
const q = query(
  collection(db, "miedos"),
  orderBy("createdAt", "desc"),
  limit(MAX_FRASES_EN_PANTALLA)
);

// Escuchar cambios en tiempo real
onSnapshot(q, (snapshot) => {
  renderizarFrases(snapshot.docs);
});
