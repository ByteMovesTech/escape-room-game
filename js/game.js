const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session");
const sessionRef = db.ref("sessions/" + sessionId);

const puzzleArea = document.getElementById("puzzleArea");
const sendBtn = document.getElementById("sendBtn");
const chatInput = document.getElementById("chatInput");
const messagesDiv = document.getElementById("messages");

auth.onAuthStateChanged(user => {
  if (!user) window.location.href = "index.html";
});

sessionRef.on("value", snap => {
  const data = snap.val();
  renderPuzzles(data.puzzles);
  renderChat(data.chat);
});

function renderPuzzles(puzzles) {
  puzzleArea.innerHTML = "";
  let allSolved = true;

  for (let room in puzzles) {
    const p = puzzles[room];
    if (!p.solved) allSolved = false;

    puzzleArea.innerHTML += `
      <div>
        <h3>${room}</h3>
        ${renderPuzzle(p, room)}
      </div>
    `;
  }

  if (allSolved) {
    puzzleArea.innerHTML += "<h2>🎉 You Escaped! 🎉</h2>";
  }
}

function renderPuzzle(p, room) {
  if (p.solved) return "<p>Solved!</p>";

  if (p.type === "logic") {
    return `
      <p>${p.data.sequence.join(", ")}</p>
      <input id="${room}">
      <button onclick="submitAnswer('${room}')">Submit</button>
    `;
  }

  if (p.type === "scramble") {
    return `
      <p>Unscramble: ${p.data.scrambled}</p>
      <input id="${room}">
      <button onclick="submitAnswer('${room}')">Submit</button>
    `;
  }

  if (p.type === "cipher") {
    return `
      <p>Decode: ${p.data.encoded}</p>
      <input id="${room}">
      <button onclick="submitAnswer('${room}')">Submit</button>
    `;
  }
}

function submitAnswer(room) {
  sessionRef.child("puzzles/" + room).once("value", snap => {
    const data = snap.val();
    const userAnswer = document.getElementById(room).value.toUpperCase();

    if (userAnswer == data.data.answer) {
      sessionRef.child("puzzles/" + room).update({ solved: true });
    } else {
      alert("Try again!");
    }
  });
}

sendBtn.addEventListener("click", () => {
  if (!chatInput.value) return;
  sessionRef.child("chat").push({
    user: auth.currentUser.email,
    message: chatInput.value
  });
  chatInput.value = "";
});

function renderChat(chat) {
  messagesDiv.innerHTML = "";
  for (let key in chat) {
    messagesDiv.innerHTML += `<p><b>${chat[key].user}:</b> ${chat[key].message}</p>`;
  }
}
