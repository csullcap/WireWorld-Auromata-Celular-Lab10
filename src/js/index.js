const AMARILLO = "#FCDF03";
const AZUL = "#07D7F7";
const ROJO = "#F70707";
const NEGRO = "#000000";
const BLANCO = "#FFFFFF";

const VACIO = 0;
const CABLE = 1;
const CABEZA = 2;
const COLA = 3;

let canvas;
let ctx;
let boton_limpiar;
let boton_iniciar_parar;
let interval_id;
let boton_iniciar_parar_activate = false;

let tileY = 15;
let tileX = 15;
let filas = 50;
let columnas = 40;

let celulas = Array.from(Array(filas), () => new Array(columnas));

class Celula {
  constructor(x, y, estado) {
    this.x = x;
    this.y = y;
    this.estado = estado;
    this.estadoProx = this.estado;
    this.vecinos = [];
  }

  addVecinos = () => {
    let xVecino;
    let yVecino;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        xVecino = (this.x + i + columnas) % columnas;
        yVecino = (this.y + j + filas) % filas;
        if (i != 0 || j != 0) {
          this.vecinos.push(celulas[xVecino][yVecino]);
        }
      }
    }
  };

  dibujar = () => {
    let color;
    if (this.estado == VACIO) color = NEGRO;
    if (this.estado == CABLE) color = AMARILLO;
    if (this.estado == CABEZA) color = AZUL;
    if (this.estado == COLA) color = ROJO;

    ctx.fillStyle = color;
    ctx.fillRect(this.x * tileX, this.y * tileY, tileX, tileY);
  };

  nuevoCiclo = () => {
    if (this.estado == VACIO) this.estadoProx = VACIO;
    if (this.estado == CABEZA) this.estadoProx = COLA;
    if (this.estado == COLA) this.estadoProx = CABLE;

    if (this.estado == CABLE) {
      let nroCabezas = this.vecinos.reduce(
        (sum, element) => (element.estado == CABEZA ? sum + 1 : sum),
        0
      );
      if (nroCabezas == 1 || nroCabezas == 2) this.estadoProx = CABEZA;
      else this.estadoProx = CABLE;
    }
  };

  cambiarEstado = () => {
    this.estado = this.estadoProx;
  };
}

function draw() {
  canvas = document.getElementById("canvas");
  boton_limpiar = document.getElementById("boton_limpiar");
  boton_iniciar_parar = document.getElementById("boton_iniciar_parar");

  if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    for (var i = 0; i < filas; i++) {
      for (var j = 0; j < columnas; j++) {
        celulas[i][j] = new Celula(i, j, 0);
        celulas[i][j].dibujar();
      }
    }
    for (var i = 0; i < filas; i++) {
      for (var j = 0; j < columnas; j++) {
        celulas[i][j].addVecinos();
      }
    }
  }
}

function actualizarCanvas() {
  for (const fila of celulas) {
    for (const celda of fila) {
      celda.dibujar();
      celda.nuevoCiclo();
    }
  }
  for (const fila of celulas) {
    for (const celda of fila) {
      celda.cambiarEstado();
    }
  }
}

window.addEventListener("load", () => {
  draw();
  boton_limpiar.addEventListener("click", function () {
    for (const fila of celulas) {
      for (const celda of fila) {
        celda.estado = 0;
        celda.dibujar();
      }
    }
  });

  boton_iniciar_parar.addEventListener("click", function () {
    if (!boton_iniciar_parar_activate) {
      boton_iniciar_parar_activate = true;
      boton_iniciar_parar.innerHTML = "Parar Automata";
      interval_id = setInterval(actualizarCanvas, 100);
    } else {
      interval_id = clearInterval(interval_id);
      boton_iniciar_parar_activate = false;
      boton_iniciar_parar.innerHTML = "Reanudar Automata";
    }
  });

  canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var xCelda = Math.floor(x / 15);
    var yCelda = Math.floor(y / 15);
    var celda = celulas[xCelda][yCelda];
    celda.estado = (celda.estado + 1) % 4;
    celda.estadoProx = celda.estado;
    celda.dibujar();
  });
});
