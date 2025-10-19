let faceMesh, video, faces = [];

let panchos = [];
let hamburguesasArr = [];

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

let puntaje = 0; 

//sonidos
let crunchy;
let arcada;
let ambiente;
let looseSound;
let winSound;

// fuente
let fuente;

// Variables para la posición de la boca
let bocaX, bocaY;

let mostrarlose = false;
let mostrarwin = false;

function preload(){
  faceMesh = ml5.faceMesh(); // modelo FaceMesh (ml5 v1.x)
  panchito = loadImage('assets/images/panchito.png');
  hamburguesa = loadImage('assets/images/hamburguesa.png');
  poop = loadImage('assets/images/poop.png');
  fuente = loadFont("assets/ARCADE_N.TTF");
  crunchy = loadSound('assets/sound/crunchy.mp3');
  arcada =  loadSound('assets/sound/arcada.mp3');
  ambiente = loadSound('assets/sound/ambiente2.mp3')
  winSound =  loadSound('assets/sound/win2.mp3')
  looseSound = loadSound('assets/sound/loose.mp3')
}

function setup(){
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  faceMesh.detectStart(video, gotFaces);
  noFill();
  strokeWeight(3);

  // poop
  posXpo = 0;
  posYpo = random(height);

  // 3 panchos por izquierda, espaciados
  for (let i = 0; i < 3; i++) {
    panchos.push({ x: -220 * i, y: random(height) });
  }
  // 3 hamburguesas por derecha, espaciadas
  for (let i = 0; i < 3; i++) {
    hamburguesasArr.push({ x: width + 220 * i, y: random(height) });
  }

  textAlign(CENTER);
  textFont(fuente);
  rectMode(CENTER);

  //ambiente.play()
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
      puntaje++;             
      p.x = 0;
      p.y = random(height);
      velocidad += 0.2;
      crunchy.play()
      arcada.stop()
      if (puntaje > 0) { mostrarlose = false; mostrarwin = false; }
    }
    if (p.x > width) {
      p.x = 0;
      p.y = random(height);
      if (i === 0) velocidad = 1;
    }
  }

  // hamburguesa
  for (let i = 0; i < hamburguesasArr.length; i++) {
    const h = hamburguesasArr[i];
    image(hamburguesa, h.x, h.y, 70, 70);
    h.x -= velocidad;

    if (colisionComidaBoca(h.x, h.y, "hamburguesa")) {
      hamburguesaPuntos++;
      puntaje++;              
      h.x = width;
      h.y = random(height);
      velocidad += 0.2;
      crunchy.play()
      arcada.stop()
      if (puntaje > 0) { mostrarlose = false; mostrarwin = false; }
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
    puntaje = max(0, puntaje - 1);  
    posYpo = 0;
    posXpo = random(50, width - 70);
    velocidad ++
    arcada.play()
    crunchy.stop()
  }

  mostrarPuntos();

let buenas = panchitoPuntos + hamburguesaPuntos;
if (!mostrarwin && !mostrarlose) {
  if (buenas >= 20) {
    mostrarwin = true;
    winSound.play()
    puntaje = 0;
    panchitoPuntos = 0;         
    hamburguesaPuntos = 0;     
    contadorPoop = 0;         
    velocidad = 1;              
  } else if (contadorPoop > 5) {
    mostrarlose = true;
    looseSound.play()
    puntaje = 0;
    panchitoPuntos = 0;         
    hamburguesaPuntos = 0;   
    contadorPoop = 0;           
    velocidad = 1;         
  }
}

  if (mostrarlose) {
    push();
    noStroke();
    fill("yellow");
    textAlign(CENTER, CENTER);
    textFont(fuente);
    textSize(50);
    text("you loose", width / 2, height / 2);
    pop();
  }

  if (mostrarwin) {
    push();
    noStroke();
    fill("yellow");
    textAlign(CENTER, CENTER);
    textFont(fuente);
    textSize(50);
    text("you win", width / 2, height / 2);
    pop();
  }
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
  image(panchito, 18, 90, 30, 30);
  image(poop, 20, 115, 25,25);
  noStroke();
  textSize(12);
  fill('yellow');
  text(' X ' + hamburguesaPuntos, 65,  90);
  text(' X ' + panchitoPuntos, 65, 110);
  text(' X ' + contadorPoop, 65, 135);
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
