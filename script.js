// Your Firebase v8 config
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

// CREATE ROOM
function createRoom() {
  room = Math.random().toString(36).substring(2,6).toUpperCase();
  document.getElementById("status").innerText = "Room Code: " + room;

  const puzzle = generatePuzzle();

  firebase.database().ref("rooms/" + room).set({
    puzzle: puzzle
  });

  listenToRoom();
}

// JOIN ROOM
function joinRoom() {
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
  // Listen for puzzle updates
  const puzzleRef = firebase.database().ref("rooms/" + room + "/puzzle");
  puzzleRef.on("value", snap => {
    document.getElementById("puzzle").innerText = snap.val();
  });

  // Listen for chat updates
  const chatRef = firebase.database().ref("rooms/" + room + "/chat");
  chatRef.on("child_added", snap => {
    const msg = snap.val();
    document.getElementById("chat").innerHTML += "<div>" + msg + "</div>";
    document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
  });
}

// SEND MESSAGE
function sendMessage() {
  const msg = document.getElementById("message").value;
  if (!msg) return;

  firebase.database().ref("rooms/" + room + "/chat").push(msg);
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
