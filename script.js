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

// List of quotes
const quotes = [
    "Karm karo, phal ki icha mat karo.",
    "Har vakt apne kaam mein samarpit raho.",
    "Karm mein mahatva rakho, usme hi yog hai.",
    "Dhairya, Veer, Tapas aur Dharm, yeh sab ek vyakti ko badiya banate hain.",
    "Apne karm par adhikar hai, par uske phal par nahi.",
    "Sachchi bhakti se hi mahatva milta hai.",
    "Dhairya aur tapasya se hi manushya jeevan mein unchiyaon ko praapt karta hai.",
    "Prem se hi jeevan ki achchai praapt hoti hai.",
    "Har paristithi mein manushya ko satya aur karm mein vishwas rakhna chahiye.",
    "Saphalta ki raah kathin hoti hai, lekin asambhav nahi.",
    "Jeevan mein har chuneeti ko dhairya se swikar karo.",
    "Saty ka marg hi sabse kathin hota hai, lekin sacha sukh ismein hi hai.",
    "Har samasya ka samadhan hota hai, usse dhairya aur vishwas se dekho.",
    "Sachha jeevan wahi hota hai jo dharm ke marg par chale.",
    "Jeevan ki saphalta mein sachai aur dharm ka palan sabse mahatvapurn hai.",
    "Karm hi asli puja hai, usse poori nishtha se karo.",
    "Manushya ko kathinaiyon se nahi darrna chahiye, balki unka samna karna chahiye.",
    "Dhairya manushya ka asli mitr hai.",
    "Saphalta ke peeche ki raah hamesha kathin hoti hai, parantu usse tay karna hi asli sahas hai.",
    ""
];

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

// Function to display a random quote
function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quoteContainer.textContent = randomQuote; // Set quote in the quote container
}

// Ensure quote is displayed initially but does not change until a new Pomodoro starts
if (!quoteContainer.textContent) {
    displayRandomQuote();
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

        // Change the quote only for a new Pomodoro session
        displayRandomQuote();
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

        clearInterval(pauseTimer); // Stop counting pause time

        // Prompt user to deduct paused time
        if (pausedMilliseconds > 0) {
            const deduct = confirm(`You paused for ${Math.floor(pausedMilliseconds / 1000)} seconds. Deduct this time from your work session?`);
            if (deduct) {
                elapsedMilliseconds -= pausedMilliseconds; // Deduct paused time
                if (elapsedMilliseconds < 0) elapsedMilliseconds = 0; // Ensure no negative time
            }
            pausedMilliseconds = 0; // Reset paused time
        }

        startTime = performance.now() - elapsedMilliseconds; // Adjust start time to account for elapsed time
        timer = requestAnimationFrame(updateTimer); // Resume main timer
    } else {
        // Pause
        isPaused = true;
        cancelAnimationFrame(timer); // Stop main timer
        pauseButton.textContent = "Resume";

        // Start counting pause time
        startPauseTimer();
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
        pausedMilliseconds += 1000; // Increment paused time (in milliseconds)
        messageDiv.textContent = `Paused for ${Math.floor(pausedMilliseconds / 1000)} seconds.`;
    }, 1000); // Update every second
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
    quoteContainer.style.display = "block";

    const restInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(restInterval);
            alarmSound.play();
            messageDiv.textContent = "Rest is over! Get back to work.";
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