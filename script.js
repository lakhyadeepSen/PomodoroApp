let startTime = null; // Timestamp when the timer starts
let elapsedMilliseconds = 0; // Total elapsed time
let timer = null;
let pauseTimer = null;
let pausedMilliseconds = 0;
let isPaused = false;
let completedSessions = 0;
let sessionData = JSON.parse(localStorage.getItem("sessionData")) || [];

const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");
const minutesSpan = document.getElementById("minutes");
const secondsSpan = document.getElementById("seconds");
const millisecondsSpan = document.getElementById("milliseconds");
const messageDiv = document.getElementById("message");
const quoteContainer = document.getElementById("quote-container");
const alarmSound = document.getElementById("alarm-sound");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Load Saved State
const savedState = JSON.parse(localStorage.getItem("pomodoroState")) || {};
if (savedState.totalMilliseconds) {
    elapsedMilliseconds = savedState.totalMilliseconds;
    updateTimerDisplay();
    startButton.disabled = false;
    pauseButton.disabled = false;
    stopButton.disabled = false;
}

// Apply Saved Dark Mode
const savedDarkMode = localStorage.getItem("darkMode");
if (savedDarkMode === "enabled") {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "Light Mode";
}

// Toggle Dark Mode
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const darkModeEnabled = document.body.classList.contains("dark-mode");
    darkModeToggle.textContent = darkModeEnabled ? "Light Mode" : "Dark Mode";
    localStorage.setItem("darkMode", darkModeEnabled ? "enabled" : "disabled");
});

// Fetch Inspirational Quotes
async function fetchRandomQuote() {
    try {
        const response = await fetch("https://api.quotable.io/random?tags=education,hard-work");
        if (!response.ok) throw new Error("Failed to fetch a quote");
        const data = await response.json();
        quoteContainer.textContent = `${data.content} - ${data.author}`;
    } catch (error) {
        console.error("Error fetching quote:", error);
        quoteContainer.textContent = "Hard work beats talent when talent doesn't work hard. - Anonymous";
    }
}

// Timer Functions
function startTimer() {
    if (isPaused) {
        // Resume from where we left off
        startTime = performance.now() - elapsedMilliseconds;
        isPaused = false;
    } else {
        // Start the timer from scratch
        startTime = performance.now();
        elapsedMilliseconds = 0;
    }

    startButton.disabled = true;
    pauseButton.disabled = false;
    stopButton.disabled = false;

    timer = requestAnimationFrame(updateTimer);
}

function updateTimer() {
    if (!isPaused) {
        const currentTime = performance.now();
        elapsedMilliseconds = currentTime - startTime; // Calculate total elapsed time
        updateTimerDisplay();
        saveState();
        timer = requestAnimationFrame(updateTimer);
    }
}

function pauseOrResumeTimer() {
    if (isPaused) {
        // Resume
        isPaused = false;
        pauseButton.textContent = "Pause";
        startTime = performance.now() - elapsedMilliseconds; // Adjust startTime to account for paused time
        timer = requestAnimationFrame(updateTimer);
    } else {
        // Pause
        isPaused = true;
        cancelAnimationFrame(timer);
        pauseButton.textContent = "Resume";
    }
}

function stopTimer() {
    cancelAnimationFrame(timer);
    clearInterval(pauseTimer);
    const workSeconds = Math.floor(elapsedMilliseconds / 1000);
    const workMinutes = Math.floor(workSeconds / 60);
    const restNeeded = calculateRestTime(workSeconds);

    completedSessions++;
    sessionData.push({ session: completedSessions, duration: workSeconds });
    localStorage.setItem("sessionData", JSON.stringify(sessionData));

    messageDiv.textContent = `You worked for ${workMinutes} minutes. Rest needed: ${restNeeded} seconds.`;
    if (confirm(`Start ${restNeeded} seconds of rest?`)) startRestTimer(restNeeded);
    resetTimer();
}

function startPauseTimer() {
    pauseTimer = setInterval(() => {
        pausedMilliseconds += 10;
        messageDiv.textContent = `Paused for ${Math.floor(pausedMilliseconds / 1000)} seconds`;
    }, 100);
}

function resetTimer() {
    elapsedMilliseconds = 0;
    pausedMilliseconds = 0;
    isPaused = false;
    cancelAnimationFrame(timer);
    clearInterval(pauseTimer);
    pauseButton.textContent = "Pause";
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;
    updateTimerDisplay();
    saveState(true);
}

function updateTimerDisplay() {
    const totalSeconds = Math.floor(elapsedMilliseconds / 1000);  // Get total seconds
    const milliseconds = Math.floor(elapsedMilliseconds % 1000);  // Get the milliseconds part

    const minutes = Math.floor(totalSeconds / 60);  // Get minutes
    const seconds = totalSeconds % 60;  // Get seconds

    // Update the display
    minutesSpan.textContent = minutes.toString().padStart(2, "0");
    secondsSpan.textContent = seconds.toString().padStart(2, "0");
    millisecondsSpan.textContent = milliseconds.toString().padStart(3, "0");
}


// Rest Timer Functions
function calculateRestTime(workSeconds) {
    if (workSeconds < 300) return 0; // Less than 5 minutes
    return Math.floor(workSeconds * 0.2); // 20% of work time
}

function startRestTimer(restSeconds) {
    let remainingTime = restSeconds;
    fetchRandomQuote();
    quoteContainer.style.display = "block";

    const restInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(restInterval);
            alarmSound.play();
            messageDiv.textContent = "Rest is over! Get back to work.";
            quoteContainer.style.display = "none";
        } else {
            messageDiv.textContent = `Resting... ${remainingTime--} seconds remaining.`;
        }
    }, 1000);
}

// Save State
function saveState(reset = false) {
    if (reset) {
        localStorage.removeItem("pomodoroState");
    } else {
        localStorage.setItem("pomodoroState", JSON.stringify({ totalMilliseconds: elapsedMilliseconds }));
    }
}

// Event Listeners
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseOrResumeTimer);
stopButton.addEventListener("click", stopTimer);