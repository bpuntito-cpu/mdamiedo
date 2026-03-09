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

// PEGA AQUI TU CONFIG REAL DE FIREBASE
const firebaseConfig = {
  apiKey: "AQUI_TU_API_KEY",
  authDomain: "AQUI_TU_AUTH_DOMAIN",
  projectId: "AQUI_TU_PROJECT_ID",
  storageBucket: "AQUI_TU_STORAGE_BUCKET",
  messagingSenderId: "AQUI_TU_MESSAGING_SENDER_ID",
  appId: "AQUI_TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const input = document.getElementById("inputFrase");
const boton = document.getElementById("btnEnviar");
const frasesLayer = document.getElementById("frasesLayer");
const mensajeEstado = document.getElementById("mensajeEstado");

const frasesMostradas = new Map();
const MAX_FRASES_EN_PANTALLA = 40;

function numeroRandom(min, max) {
  return Math.random() * (max - min) + min;
}

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

  frase.style.left = `${data.x || 20}px`;
  frase.style.top = `${data.y || 20}px`;

  return frase;
}

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

async function guardarFrase() {
  const texto = input.value.trim().slice(0, 120);

  if (!texto) {
    mensajeEstado.textContent = "Escribe algo primero.";
    return;
  }

  boton.disabled = true;
  mensajeEstado.textContent = "Enviando...";

  try {
    const anchoPantalla = window.innerWidth;
    const altoPantalla = window.innerHeight;

    const x = numeroRandom(20, Math.max(40, anchoPantalla - 220));
    const y = numeroRandom(20, Math.max(40, altoPantalla - 120));

    await addDoc(collection(db, "miedos"), {
      texto,
      x,
      y,
      createdAt: serverTimestamp()
    });

    input.value = "";
    mensajeEstado.textContent = "Guardado.";
  } catch (error) {
    console.error(error);
    mensajeEstado.textContent = "No se pudo guardar.";
  } finally {
    boton.disabled = false;
  }
}

boton.addEventListener("click", guardarFrase);

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    guardarFrase();
  }
});

// SOLO ESCUCHA LAS ULTIMAS FRASES
const q = query(
  collection(db, "miedos"),
  orderBy("createdAt", "desc"),
  limit(MAX_FRASES_EN_PANTALLA)
);

onSnapshot(q, (snapshot) => {
  renderizarFrases(snapshot.docs);
});

