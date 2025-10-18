let faceMesh, video, faces = [];

let velocidad = 1;
// distancia de la boca
let distBoca;

// pancho
let panchito;
let panchitoPuntos = 0;
let contadorPanchos = 0;

// hamburguesa
let hamburguesa;
let hamburguesaPuntos = 0;
let contadorHamburguesas = 0;

// poop
let poop;
let poopPuntos = 1;
let posXpo;
let posYpo;
let contadorPoop = 0;

let puntaje;

// fuente
let fuente;

// Variables para la posición de la boca
let bocaX, bocaY;

let panchos = [];
let hamburguesasArr = [];

function preload(){
  faceMesh = ml5.faceMesh(); // modelo FaceMesh (ml5 v1.x)
  panchito   = loadImage('assets/images/panchito.png');
  hamburguesa= loadImage('assets/images/hamburguesa.png');
  poop       = loadImage('assets/images/poop.png');
  fuente     = loadFont("assets/ARCADE_N.TTF");
}

function setup(){
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
  noFill();
  strokeWeight(3);

  // inicializo posiciones
  posYp = random(height);
  posXh = width;
  posYh = random(height);
  posXpo = 0;
  posYpo = random(height);

  //panchos saliendo por izquierda, espaciados
  for (let i = 0; i < 3; i++) {
    panchos.push({ x: -220 * i, y: random(height) });
  }
  //hamburguesas saliendo por derecha
  for (let i = 0; i < 3; i++) {
    hamburguesasArr.push({ x: width + 220 * i, y: random(height) });
  }

  textAlign(CENTER);
  textFont(fuente);
  rectMode(CENTER);
}

function draw(){
  // espejo para la cámara
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (faces.length > 0){
    let f = faces[0];

    // 13 (labio sup), 14 (labio inf)
    let U = getPt(f, 13);
    let D = getPt(f, 14);

    if (U && D){
      stroke(255, 0, 255);
      distBoca = dist(U.x, U.y, D.x, D.y);
      // guía rápida
      line(U.x, U.y, D.x, D.y);
      stroke(0, 255, 0);
      point(U.x, U.y);
      point(D.x, D.y);

      // posición de la boca (centro)
      bocaX = (U.x + D.x) / 2;
      bocaY = (U.y + D.y) / 2;
    }
  }
  pop();

  // panchito
  for (let i = 0; i < panchos.length; i++) {
    const p = panchos[i];
    image(panchito, p.x, p.y, 70, 70);
    p.x += velocidad;

    if (colisionComidaBoca(p.x, p.y, "pancho")) {
      panchitoPuntos++;
      p.x = 0;
      p.y = random(height);
      velocidad += 0.2;
    }
    if (p.x > width) {
      p.x = 0;
      p.y = random(height);
      if (i === 0) velocidad = 1;
    }
  }

  // hamburguesas
  for (let i = 0; i < hamburguesasArr.length; i++) {
    const h = hamburguesasArr[i];
    image(hamburguesa, h.x, h.y, 70, 70);
    h.x -= velocidad;

    if (colisionComidaBoca(h.x, h.y, "hamburguesa")) {
      hamburguesaPuntos++;
      h.x = width;
      h.y = random(height);
      velocidad += 0.2;
    }
    if (h.x < 0) {
      h.x = width;
      h.y = random(height);
    }
  }

  // poop
  image(poop, posXpo, posYpo, 70, 70);
  posYpo += velocidad * 5;
  if (posYpo > height) {
    posYpo = 0;
    posXpo = random(50, width - 70);
  }
  if (colisionComidaBoca(posXpo, posYpo, "poop")) {
    contadorPoop++;
    posYpo = 0;
    posXpo = random(50, width - 70);
  }

  // puntaje
  puntaje = hamburguesaPuntos + panchitoPuntos - contadorPoop;

  mostrarPuntos();
}

function colisionComidaBoca(comidaX, comidaY, tipoComida) {
  // ajustar X por espejo
  let bocaXAjustada = width - bocaX;

  // centro aproximado del sprite (70x70)
  let centroComidaX = comidaX + 35;
  let centroComidaY = comidaY + 35;

  let distancia = dist(centroComidaX, centroComidaY, bocaXAjustada, bocaY);

  // umbrales
  let umbralColision = 50;  // por defecto
  let umbralAperturaBoca = 10;

  if (tipoComida === "hamburguesa") {
    umbralColision = 60;
  }
  // si querés ajustar el poop:
  // else if (tipoComida === "poop") { umbralColision = 55; }

  return (distancia < umbralColision && distBoca > umbralAperturaBoca);
}

function mostrarPuntos() {
  push();
  fill("yellow");
  noStroke();
  rect(83, 43, 140, 40, 10);
  pop();

  push();
  fill("#e185c7");
  noStroke();
  textSize(12);
  text("PUNTAJE:" + puntaje, 80, 50);
  pop();

  push();
  image(hamburguesa, 20, 70, 25, 25);
  image(panchito,   18, 100, 30, 30);
  noStroke();
  textSize(12);
  fill('yellow');
  text(' X ' + hamburguesaPuntos, 65,  90);
  text(' X ' + panchitoPuntos,    65, 120);
  pop();
}

function gotFaces(results){
  faces = results;
}

// helper de puntos (v1.x -> .keypoints; fallback .scaledMesh)
function getPt(face, idx){
  if (face.keypoints && face.keypoints[idx]) return face.keypoints[idx];
  if (face.scaledMesh && face.scaledMesh[idx]) {
    let p = face.scaledMesh[idx]; return { x:p[0], y:p[1], z:p[2] };
  }
  return null;
}
