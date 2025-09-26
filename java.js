// Replace with your Firebase config from Firebase Console > Project Settings > Your apps > Web
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgzczZettUIqv2H_5m7MnBPgNitW6TDB4",
  authDomain: "doodlemasters-58be1.firebaseapp.com",
  databaseURL: "https://doodlemasters-58be1-default-rtdb.firebaseio.com",
  projectId: "doodlemasters-58be1",
  storageBucket: "doodlemasters-58be1.firebasestorage.app",
  messagingSenderId: "629477372515",
  appId: "1:629477372515:web:b1d76a4f5fad1b5e43fe56",
  measurementId: "G-4BZFF2NPFX"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const strokesData = firebase.database().ref("strokes");
let strokes = [];
let currentStroke = null;

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.background(255);
  canvas.mousePressed(startStroke);
  canvas.mouseReleased(endStroke);

  strokesData.on("child_added", (snapshot) => {
    let stroke = snapshot.val();
    stroke.points = stroke.points || []; // Ensure points array exists
    strokes.push(stroke);
  });

  strokesData.on("child_removed", () => {
    strokes = [];
    background(255);
  });

  $("#clearBtn").on("click", clearDrawing);
  $("#saveBtn").on("click", saveDrawing);
  $("#colorPicker").on("change", updateColor);
  $("#brushSize").on("change", updateBrushSize);
}

function draw() {
  // Draw all strokes
  for (let stroke of strokes) {
    stroke.points = stroke.points || []; // Ensure points array exists
    if (stroke.points.length > 0) {
      strokeWeight(stroke.brushSize);
      stroke(stroke.color.r, stroke.color.g, stroke.color.b);
      for (let i = 1; i < stroke.points.length; i++) {
        let p1 = stroke.points[i - 1];
        let p2 = stroke.points[i];
        line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  }

  // Draw current stroke in progress
  if (currentStroke && mouseIsPressed) {
    let point = { x: mouseX, y: mouseY };
    currentStroke.points.push(point);
    strokesData.child(currentStroke.id).set(currentStroke);
  }
}

function startStroke() {
  let color = $("#colorPicker").val().split(",").map(Number);
  currentStroke = {
    id: Date.now() + "-" + Math.random().toString(36).substr(2, 9), // Unique ID
    color: { r: color[0], g: color[1], b: color[2] },
    brushSize: parseInt($("#brushSize").val()),
    points: [{ x: mouseX, y: mouseY }]
  };
  strokes.push(currentStroke);
  strokesData.child(currentStroke.id).set(currentStroke);
}

function endStroke() {
  if (currentStroke) {
    strokesData.child(currentStroke.id).set(currentStroke);
    currentStroke = null;
  }
}

function updateColor() {
  // Color updates apply to new strokes
}

function updateBrushSize() {
  // Brush size updates apply to new strokes
}

function clearDrawing() {
  strokesData.remove();
  strokes = [];
  background(255);
}

function saveDrawing() {
  saveCanvas("collaborative-drawing", "png");
}
