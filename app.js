import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATEkMaa_PRw1T2-sZ1CyhdRElG4COJwqA",
  authDomain: "bpuntito-8131c.firebaseapp.com",
  projectId: "bpuntito-8131c",
  storageBucket: "bpuntito-8131c.firebasestorage.app",
  messagingSenderId: "10419604048",
  appId: "1:10419604048:web:0e618d96e966d4b8261f55"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const input = document.getElementById("inputFrase");
const boton = document.getElementById("btnEnviar");
const frasesLayer = document.getElementById("frasesLayer");
const mensajeEstado = document.getElementById("mensajeEstado");

const frasesMostradas = new Set();

function numeroRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function crearFraseEnPantalla(texto, idUnico) {
  if (frasesMostradas.has(idUnico)) return;
  frasesMostradas.add(idUnico);

  const frase = document.createElement("div");
  frase.className = "frase";
  frase.textContent = texto;

  const anchoPantalla = window.innerWidth;
  const altoPantalla = window.innerHeight;

  const zonaCentralX = anchoPantalla * 0.5;
  const zonaCentralY = altoPantalla * 0.46;

  let left = numeroRandom(20, anchoPantalla - 180);
  let top = numeroRandom(20, altoPantalla - 40);

  const dentroZonaCentral =
    left > zonaCentralX - 380 &&
    left < zonaCentralX + 280 &&
    top > zonaCentralY - 120 &&
    top < zonaCentralY + 120;

  if (dentroZonaCentral) {
    top = numeroRandom(altoPantalla * 0.72, altoPantalla - 40);
  }

  frase.style.left = `${left}px`;
  frase.style.top = `${top}px`;

  frasesLayer.appendChild(frase);
}

async function guardarFrase() {
  const texto = input.value.trim();

  if (!texto) {
    mensajeEstado.textContent = "Escribe algo primero.";
    return;
  }

  boton.disabled = true;
  mensajeEstado.textContent = "Enviando...";

  try {
    await addDoc(collection(db, "miedos"), {
      texto: texto,
      createdAt: serverTimestamp()
    });

    input.value = "";
    mensajeEstado.textContent = "Guardado.";
  } catch (error) {
    console.error(error);
    mensajeEstado.textContent = "No se pudo guardar. Revisa Firebase.";
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

const q = query(collection(db, "miedos"));

onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === "added") {
      const data = change.doc.data();

      if (data.texto) {
        crearFraseEnPantalla(data.texto, change.doc.id);
      }
    }
  });
});
