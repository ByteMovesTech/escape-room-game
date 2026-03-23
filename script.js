// Firebase config (v8 style)
const firebaseConfig = {
  apiKey: "AIzaSyCNvc-KTRnSrQfU0lIkK9I-t4qSdx1cG4s",
  authDomain: "cookiecuttervault.firebaseapp.com",
  databaseURL: "https://cookiecuttervault-default-rtdb.firebaseio.com/",
  projectId: "cookiecuttervault",
  storageBucket: "cookiecuttervault.firebasestorage.app",
  messagingSenderId: "900114441261",
  appId: "1:900114441261:web:fd4f37af79e928933344a4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let room = "";
let playerName = "";
let chatRef;

// CREATE ROOM
function createRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  room = Math.random().toString(36).substring(2,6).toUpperCase();
  document.getElementById("status").innerText = "Room Code: " + room;

  // Clear any old data
  firebase.database().ref("rooms/" + room).set({
    puzzle: generatePuzzle(),
    chat: {}
  });

  listenToRoom();
}

// JOIN ROOM
function joinRoom() {
  playerName = document.getElementById("playerName").value || "Player";
  room = document.getElementById("roomCode").value.toUpperCase();
  if (!room) {
    alert("Enter a room code first");
    return;
  }
  document.getElementById("status").innerText = "Joined Room: " + room;

  listenToRoom();
}

// LISTEN FOR UPDATES
function listenToRoom() {
  // Clear previous chat UI
  document.getElementById("chat").innerHTML = "";

  // Puzzle updates
  const puzzleRef = firebase.database().ref("rooms/" + room + "/puzzle");
  puzzleRef.on("value", snap => {
    document.getElementById("puzzle").innerText = snap.val();
  });

  // Chat updates
  chatRef = firebase.database().ref("rooms/" + room + "/chat");
  chatRef.on("child_added", snap => {
    const data = snap.val();
    if (data && data.name && data.message) {
      const msgText = `<b>${data.name}:</b> ${data.message}`;
      document.getElementById("chat").innerHTML += "<div>" + msgText + "</div>";
      document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
    }
  });
}

// SEND MESSAGE
function sendMessage() {
  const msg = document.getElementById("message").value;
  if (!msg || !chatRef) return;

  chatRef.push({
    name: playerName,
    message: msg
  });

  document.getElementById("message").value = "";
}

// RANDOM PUZZLES
function generatePuzzle() {
  const puzzles = [
    "I speak without a mouth. What am I?",
    "What has keys but can't open locks?",
    "What gets wetter the more it dries?"
  ];
  return puzzles[Math.floor(Math.random() * puzzles.length)];
}
