// Importar Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATEkMaa_PRw1T2-sZ1CyhdRElG4COJwqA",
  authDomain: "bpuntito-8131c.firebaseapp.com",
  projectId: "bpuntito-8131c",
  storageBucket: "bpuntito-8131c.firebasestorage.app",
  messagingSenderId: "10419604048",
  appId: "1:10419604048:web:0e618d96e966d4b8261f55"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const frasesCol = collection(db, "frases"); // tu colección

// Contenedor general
const contenedor = document.body;

// Función para mostrar frase flotante
function mostrarFrase(texto) {
  const div = document.createElement("div");
  div.className = "frase";
  div.innerText = texto;

  const ancho = contenedor.clientWidth - 200;
  const alto = contenedor.clientHeight - 50;
  div.style.left = Math.random() * ancho + "px";
  div.style.top = Math.random() * alto + "px";

  contenedor.appendChild(div);

  // Animación fade-in y ligero rebote
  requestAnimationFrame(() => {
    div.style.opacity = 1;
    div.style.transform = "translateY(-10px)";
    setTimeout(() => div.style.transform = "translateY(0px)", 200);
  });
}

// Cargar todas las frases existentes desde Firebase
async function cargarFrases() {
  const snapshot = await getDocs(frasesCol);
  snapshot.forEach(doc => mostrarFrase(doc.data().texto));
}

// Evento al presionar "Enviar"
document.getElementById("btnEnviar").addEventListener("click", async () => {
  const input = document.getElementById("inputFrase");
  const texto = input.value.trim();
  if(!texto) return;

  // Guardar en Firebase
  await addDoc(frasesCol, { texto: texto });

  // Mostrar inmediatamente en pantalla
  mostrarFrase(texto);
  input.value = "";
});

// Cargar las frases al inicio
cargarFrases();
