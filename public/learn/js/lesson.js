/* ==========================================================================
   lesson.js  —  Makes the lesson pages work
   --------------------------------------------------------------------------
   What this file does:
   1. Shows ONE lesson page at a time (like a slideshow).
   2. Makes the "Back" and "Next" buttons move between pages.
   3. Shows "Page 2 of 6" so the learner knows where they are.
   4. Checks the quiz answers and shows "Correct!" or "Not right".

   The SAME file is used by every topic (Proprietorship, Partnership,
   Company). It looks at the page and works automatically. So when we add a
   new topic, we do NOT need to write new JavaScript.

   This file also prints messages to the browser "Console" (press F12 to see
   them). This is called LOGGING. It helps us check that everything works.
   ========================================================================== */

/* --------------------------------------------------------------------------
   A small helper to print a log message with a clear label and the time.
   Example output:  [LESSON 10:05:31] Showing page 2 of 6
   -------------------------------------------------------------------------- */
function log(message) {
  var now = new Date().toLocaleTimeString(); // current time as text
  console.log("[LESSON " + now + "] " + message);
}

/* "DOMContentLoaded" means: wait until the whole page is loaded, THEN run
   our code. If we run too early, the buttons may not exist yet. */
document.addEventListener("DOMContentLoaded", function () {
  log("Page loaded. Starting lesson script.");

  /* ------------------------------------------------------------------
     STEP 1: Find all the lesson pages on this screen.
     ------------------------------------------------------------------ */
  var pages = document.querySelectorAll(".lesson .page");

  /* If there are no lesson pages, we are probably on the HOME page.
     There is nothing for this script to do, so we stop here. */
  if (pages.length === 0) {
    log("No lesson pages found (this is likely the home page). Nothing to do.");
    setUpQuiz(); // (safe to call; it also does nothing if there is no quiz)
    return;
  }

  log("Found " + pages.length + " lesson pages.");

  /* ------------------------------------------------------------------
     STEP 2: Get the buttons and the progress text.
     ------------------------------------------------------------------ */
  var backBtn = document.getElementById("backBtn");
  var nextBtn = document.getElementById("nextBtn");
  var progress = document.getElementById("progress");

  /* "currentIndex" remembers which page we are showing right now.
     We start at 0, which means the FIRST page (computers count from 0). */
  var currentIndex = 0;

  /* ------------------------------------------------------------------
     STEP 3: A function that shows one page and hides the rest.
     ------------------------------------------------------------------ */
  function showPage(index) {
    /* Go through every page. Add the "active" class to the one we want,
       and remove it from all the others. The CSS shows only ".active". */
    for (var i = 0; i < pages.length; i++) {
      if (i === index) {
        pages[i].classList.add("active");
      } else {
        pages[i].classList.remove("active");
      }
    }

    /* Update the "Page X of Y" text.
       We add 1 to index because people count from 1, not 0. */
    progress.textContent = "Page " + (index + 1) + " of " + pages.length;

    /* On the FIRST page, there is nothing before it, so turn off "Back". */
    backBtn.disabled = (index === 0);

    /* On the LAST page, there is nothing after it, so turn off "Next". */
    nextBtn.disabled = (index === pages.length - 1);

    /* Scroll back to the top so the learner sees the start of the new page. */
    window.scrollTo(0, 0);

    log("Showing page " + (index + 1) + " of " + pages.length);
  }

  /* ------------------------------------------------------------------
     STEP 4: Make the buttons work.
     ------------------------------------------------------------------ */
  nextBtn.addEventListener("click", function () {
    /* Only move forward if we are NOT already on the last page. */
    if (currentIndex < pages.length - 1) {
      currentIndex = currentIndex + 1;
      showPage(currentIndex);
    }
  });

  backBtn.addEventListener("click", function () {
    /* Only move back if we are NOT already on the first page. */
    if (currentIndex > 0) {
      currentIndex = currentIndex - 1;
      showPage(currentIndex);
    }
  });

  /* ------------------------------------------------------------------
     STEP 5: Show the first page when the lesson opens.
     ------------------------------------------------------------------ */
  showPage(currentIndex);

  /* ------------------------------------------------------------------
     STEP 6: Set up the quiz (if this topic has one).
     ------------------------------------------------------------------ */
  setUpQuiz();
});

/* ==========================================================================
   setUpQuiz()  —  Makes the quiz answer buttons work.
   --------------------------------------------------------------------------
   How the quiz is written in the HTML:
     - Each question is a box with class "quiz-question".
     - Each answer is a <button class="option">.
     - The RIGHT answer has an extra attribute: data-correct="true".
     - Each question has an empty <p class="feedback"> for the message.

   When the learner clicks an answer:
     - If it is right  -> turn it green and say "Correct!"
     - If it is wrong  -> turn it red, show the green right answer, and say so.
     - Then lock the buttons so they cannot change the answer.
   ========================================================================== */
function setUpQuiz() {
  var questions = document.querySelectorAll(".quiz-question");

  if (questions.length === 0) {
    return; // this topic has no quiz; nothing to do
  }

  log("Setting up quiz with " + questions.length + " question(s).");

  /* Go through each question one by one. */
  questions.forEach(function (question, qNumber) {
    var options = question.querySelectorAll(".option");
    var feedback = question.querySelector(".feedback");

    /* For each answer button inside this question... */
    options.forEach(function (option) {
      option.addEventListener("click", function () {
        /* Read whether THIS button is the correct answer.
           getAttribute returns the text "true" for the right answer. */
        var isCorrect = option.getAttribute("data-correct") === "true";

        if (isCorrect) {
          option.classList.add("correct");
          feedback.textContent = "Correct! Well done.";
          feedback.className = "feedback ok"; // green message
          log("Question " + (qNumber + 1) + ": answered CORRECTLY.");
        } else {
          option.classList.add("wrong");
          feedback.textContent = "Not right. The green answer is correct.";
          feedback.className = "feedback no"; // red message
          log("Question " + (qNumber + 1) + ": answered wrongly.");

          /* Also show the learner which one WAS correct (make it green). */
          options.forEach(function (other) {
            if (other.getAttribute("data-correct") === "true") {
              other.classList.add("correct");
            }
          });
        }

        /* Lock all the buttons for this question so the answer cannot
           be changed after the learner has tried once. */
        options.forEach(function (other) {
          other.disabled = true;
        });
      });
    });
  });
}
