// game.js

// Get session ID from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session");
const sessionRef = db.ref("sessions/" + sessionId);

// DOM elements
const puzzleArea = document.getElementById("puzzleArea");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");

// Ensure user is logged in
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// -------------------
// Real-time puzzle sync
// -------------------
sessionRef.child("puzzles").on("value", snap => {
  const puzzles = snap.val();
  renderPuzzles(puzzles);
});

// -------------------
// Real-time chat
// -------------------
const chatRef = sessionRef.child("chat");

// Listen for new messages
chatRef.on("child_added", snap => {
  const msg = snap.val();
  messagesDiv.innerHTML += `<p><b>${msg.user}:</b> ${msg.message}</p>`;
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // auto scroll
});

// Send chat message
sendBtn.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatRef.push({
    user: auth.currentUser.email,
    message: text
  });
  chatInput.value = "";
});

// -------------------
// Render puzzles
// -------------------
function renderPuzzles(puzzles) {
  puzzleArea.innerHTML = "";
  let allSolved = true;

  for (let room in puzzles) {
    const p = puzzles[room];
    if (!p.solved) allSolved = false;

    puzzleArea.innerHTML += `
      <div class="puzzle">
        <h3>${room}</h3>
        ${renderPuzzle(p, room)}
      </div>
      <hr>
    `;
  }

  if (allSolved) {
    puzzleArea.innerHTML += "<h2>🎉 You Escaped! 🎉</h2>";
  }
}

// -------------------
// Render individual puzzle
// -------------------
function renderPuzzle(p, room) {
  if (p.solved) return "<p>Solved!</p>";

  switch (p.type) {
    case "logic":
      return `
        <p>Sequence: ${p.data.sequence.join(", ")}</p>
        <input id="${room}" placeholder="Your answer">
        <button onclick="submitAnswer('${room}')">Submit</button>
      `;
    case "scramble":
      return `
        <p>Unscramble: ${p.data.scrambled}</p>
        <input id="${room}" placeholder="Your answer">
        <button onclick="submitAnswer('${room}')">Submit</button>
      `;
    case "cipher":
      return `
        <p>Decode: ${p.data.encoded}</p>
        <input id="${room}" placeholder="Your answer">
        <button onclick="submitAnswer('${room}')">Submit</button>
      `;
    default:
      return "<p>Unknown puzzle type</p>";
  }
}

// -------------------
// Submit answer
// -------------------
function submitAnswer(room) {
  const roomRef = sessionRef.child("puzzles/" + room);

  roomRef.once("value", snap => {
    const data = snap.val();
    const userAnswer = document.getElementById(room).value.trim().toUpperCase();

    // Accept correct answer
    if (userAnswer === data.data.answer.toString().toUpperCase()) {
      roomRef.update({ solved: true });
    } else {
      alert("Try again!");
    }
  });
}
