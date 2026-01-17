// --------------------
// GAME CLOCK STATE
// --------------------
let gameRunning = false;
let gameStartTime = 0;
let gameElapsed = 0;
let clockInterval = null;

// --------------------
// SEGMENTS
// --------------------
const segments = ["Q1-A", "Q1-B", "Q2-A", "Q2-B", "Q3-A", "Q3-B", "Q4-A", "Q4-B"];
let currentSegment = "Q1-A";

// --------------------
// PLAYERS
// --------------------
const players = [];

for (let i = 1; i <= 9; i++) {
    players.push({
        id: i,
        isIn: false,
        totalTime: 0,
        lastInTimestamp: null,
        segmentTimes: {
            "Q1-A": 0,
            "Q1-B": 0,
            "Q2-A": 0,
            "Q2-B": 0,
            "Q3-A": 0,
            "Q3-B": 0,
            "Q4-A": 0,
            "Q4-B": 0,
        }
    });
}

// --------------------
// DOM ELEMENTS
// --------------------
const clockDiv = document.getElementById("clock");
const startPauseBtn = document.getElementById("startPauseBtn");
const playersDiv = document.getElementById("players");
const segmentsDiv = document.getElementById("segments");

// --------------------
// PLAYER BUTTONS
// --------------------
players.forEach(player => {
    const btn = document.createElement("button");
    btn.classList.add("player-btn", "out");

    btn.addEventListener("click", () => {
        togglePlayer(player, btn);
    });

    playersDiv.appendChild(btn);
});

// --------------------
// SEGMENT BUTTONS
// --------------------
segments.forEach(seg => {
    const btn = document.createElement("button");
    btn.innerText = seg;
    btn.classList.add("segment-btn");

    if (seg === currentSegment) {
        btn.classList.add("active-segment");
    }

    btn.addEventListener("click", () => {
        switchSegment(seg);
    });

    segmentsDiv.appendChild(btn);
});

// --------------------
// START / PAUSE BUTTON
// --------------------
startPauseBtn.addEventListener("click", () => {
    if (!gameRunning) {
        startGame();
    } else {
        pauseGame();
    }
});

// --------------------
// FUNCTIONS
// --------------------
function startGame() {
    gameRunning = true;
    startPauseBtn.innerText = "Pause";
    gameStartTime = Date.now() - gameElapsed;

    const now = Date.now();
    players.forEach(player => {
        if (player.isIn) {
            player.lastInTimestamp = now;
        }
    });

    clockInterval = setInterval(updateClock, 500);
}

function pauseGame() {
    gameRunning = false;
    startPauseBtn.innerText = "Start";
    clearInterval(clockInterval);

    const now = Date.now();
    gameElapsed = now - gameStartTime;

    players.forEach(player => {
        if (player.isIn && player.lastInTimestamp) {
            const elapsed = now - player.lastInTimestamp;
            player.totalTime += elapsed;
            player.segmentTimes[currentSegment] += elapsed;
            player.lastInTimestamp = null;
        }
    });

    updatePlayerDisplay();
}

function updateClock() {
    gameElapsed = Date.now() - gameStartTime;
    clockDiv.innerText = formatTime(gameElapsed);
    updatePlayerDisplay();
}

function togglePlayer(player, btn) {
    const now = Date.now();

    if (!player.isIn) {
        player.isIn = true;
        btn.classList.remove("out");
        btn.classList.add("in");

        if (gameRunning) {
            player.lastInTimestamp = now;
        }
    } else {
        player.isIn = false;
        btn.classList.remove("in");
        btn.classList.add("out");

        if (player.lastInTimestamp) {
            const elapsed = now - player.lastInTimestamp;
            player.totalTime += elapsed;
            player.segmentTimes[currentSegment] += elapsed;
            player.lastInTimestamp = null;
        }
    }

    updatePlayerDisplay();
}

function updatePlayerDisplay() {
    const buttons = document.querySelectorAll(".player-btn");

    players.forEach((player, index) => {
        let time = player.totalTime;

        if (player.isIn && player.lastInTimestamp) {
            time += Date.now() - player.lastInTimestamp;
        }

        buttons[index].innerText =
           `Player ${player.id}\n${formatTime(time)}\n` +
            Object.entries(player.segmentTimes)
                  .map(([seg, t]) => `${seg}: ${formatTime(t)}`)
                  .join("\n");
    });
}

function switchSegment(newSegment) {
    if (newSegment === currentSegment) return;

    const now = Date.now();

    players.forEach(player => {
        if (player.isIn && player.lastInTimestamp) {
            const elapsed = now - player.lastInTimestamp;
            player.totalTime += elapsed;
            player.segmentTimes[currentSegment] += elapsed;
            player.lastInTimestamp = now;
        }
    });

    currentSegment = newSegment;

    document.querySelectorAll(".segment-btn").forEach(btn => {
        btn.classList.toggle(
            "active-segment",
            btn.innerText === currentSegment
        );
    });

    updatePlayerDisplay();
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
