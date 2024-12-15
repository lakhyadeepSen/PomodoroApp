let timer;
let pauseTimer;
let totalMilliseconds = 0;
let pausedMilliseconds = 0;
let isPaused = false;

const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const stopButton = document.getElementById("stop");
const minutesSpan = document.getElementById("minutes");
const secondsSpan = document.getElementById("seconds");
const millisecondsSpan = document.getElementById("milliseconds");
const messageDiv = document.getElementById("message");

const alarmSound = document.getElementById("alarm-sound");

// Load saved state
const savedState = JSON.parse(localStorage.getItem("pomodoroState")) || {};
if (savedState.totalMilliseconds) {
    totalMilliseconds = savedState.totalMilliseconds;
    updateTimerDisplay();
    startButton.disabled = false;
    pauseButton.disabled = false;
    stopButton.disabled = false;
}

// Start Timer
startButton.addEventListener("click", () => {
    provideHapticFeedback();
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 10); // Update every 10ms
    startButton.disabled = true;
    pauseButton.disabled = false;
    stopButton.disabled = false;
    messageDiv.textContent = "";
});

function updateTimer() {
    totalMilliseconds += 10;
    updateTimerDisplay();
    saveState();
}

function updateTimerDisplay() {
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const milliseconds = totalMilliseconds % 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    minutesSpan.textContent = minutes.toString().padStart(2, "0");
    secondsSpan.textContent = seconds.toString().padStart(2, "0");
    millisecondsSpan.textContent = milliseconds.toString().padStart(3, "0");
}

// Pause Timer
pauseButton.addEventListener("click", () => {
    provideHapticFeedback();
    if (isPaused) {
        isPaused = false;
        clearInterval(pauseTimer);
        timer = setInterval(updateTimer, 10);
        pauseButton.textContent = "Pause";
        const deductTime = confirm(`Deduct ${Math.floor(pausedMilliseconds / 1000)} seconds from work time?`);
        if (deductTime) {
            totalMilliseconds = Math.max(totalMilliseconds - pausedMilliseconds, 0);
            updateTimerDisplay();
        }
        pausedMilliseconds = 0;
    } else {
        isPaused = true;
        clearInterval(timer);
        startPauseTimer();
        pauseButton.textContent = "Resume";
    }
});

function startPauseTimer() {
    pausedMilliseconds = 0;
    pauseTimer = setInterval(() => {
        pausedMilliseconds += 10;
        messageDiv.textContent = `Paused for ${Math.floor(pausedMilliseconds / 1000)} seconds`;
    }, 10);
}

// Stop Timer
stopButton.addEventListener("click", () => {
    provideHapticFeedback();
    clearInterval(timer);
    clearInterval(pauseTimer);
    const workSeconds = Math.floor(totalMilliseconds / 1000);
    const workMinutes = Math.floor(workSeconds / 60);
    const restNeeded = calculateRestTime(workSeconds);
    messageDiv.textContent = `You worked for ${workMinutes} minutes. Rest needed: ${restNeeded} seconds.`;
    const startRest = confirm(`Start ${restNeeded} seconds of rest?`);
    if (startRest) {
        startRestTimer(restNeeded);
    }
    resetTimer();
});

function calculateRestTime(workSeconds) {
    if (workSeconds < 300) return 0; // Less than 5 minutes
    return Math.floor(workSeconds * 0.2); // 1 second work = 0.2 seconds rest
}

function startRestTimer(restSeconds) {
    let restTime = restSeconds;
    const restInterval = setInterval(() => {
        if (restTime <= 0) {
            clearInterval(restInterval);
            messageDiv.textContent = "Rest is over! Get back to work.";
            alarmSound.play(); // Play alarm sound
        } else {
            restTime--;
            messageDiv.textContent = `Resting... ${restTime} seconds remaining.`;
        }
    }, 1000);
}

// Reset Timer
function resetTimer() {
    totalMilliseconds = 0;
    pausedMilliseconds = 0;
    isPaused = false;
    pauseButton.textContent = "Pause";
    startButton.disabled = false;
    pauseButton.disabled = true;
    stopButton.disabled = true;
    minutesSpan.textContent = "00";
    secondsSpan.textContent = "00";
    millisecondsSpan.textContent = "000";
    saveState(true);
}

// Save State
function saveState(reset = false) {
    if (reset) {
        localStorage.removeItem("pomodoroState");
    } else {
        localStorage.setItem(
            "pomodoroState",
            JSON.stringify({ totalMilliseconds })
        );
    }
}

// Provide Haptic Feedback
function provideHapticFeedback() {
    if ("vibrate" in navigator) {
        navigator.vibrate(100); // Vibrates for 100ms
    }
}
