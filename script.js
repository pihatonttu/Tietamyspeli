let data = [];
let selectedCategory = null;
let selectedTheme = null;
let playerCount = 0;
let players = [];
let i = 0;
let question_points = 0;

let player = players[i];

function loadQuestions() {
    fetch('questions.xml')
        .then(response => response.text())
        .then(xmlText => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "application/xml");
            data = Array.from(xmlDoc.getElementsByTagName("cat"));
            showStartScreen();
        })
        .catch(error => console.error('Error loading questions:', error));
}

function showStartScreen() {
    console.log("Showing start screen");
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('theme-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('player-names-screen').classList.add('hidden');
}

document.getElementById('submit-player-count').addEventListener('click', function() {
    playerCount = parseInt(document.getElementById('player-count').value);
    console.log("Player count selected:", playerCount);

    if (playerCount >= 2 && playerCount <= 4) {
        // Hide the start screen and proceed to the next step
        document.getElementById('start-screen').classList.add('hidden');
        showPlayerNameInputs();
    } else {
        alert("Please enter a valid player count between 2 and 4.");
    }
});

function showPlayerNameInputs() {
    console.log("Showing player name inputs");
    const playerNameInputsContainer = document.getElementById('player-names-container');
    playerNameInputsContainer.innerHTML = '';

    for (let i = 0; i < playerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} Name`;
        input.classList.add('player-input');
        playerNameInputsContainer.appendChild(input);
    }

    document.getElementById('player-names-screen').classList.remove('hidden');
}

document.getElementById('start-game').addEventListener('click', function() {
    const playerNameInputs = document.querySelectorAll('.player-input');
    // Get the player names (name: name, points: 0) from the input fields and store them in the players array
    players = Array.from(playerNameInputs).map(function(input) {
        dict = {name: input.value, points: 0};
        return dict;
    });
    
    if (players.some(player => player.name === "")) {
        alert("Please enter all player names.");
    } else {
        document.getElementById('player-names-screen').classList.add('hidden');
        loadRandomCategories();
    }
});

function loadRandomCategories() {
    const playerNameContainer = document.getElementById('player-name');
    playerNameContainer.textContent = "Nyt pelaa " + players[i].name;

    const playerPointsContainer = document.getElementById('player-points-container');
    playerPointsContainer.innerHTML = "";
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.textContent = player.name + ": " + player.points;
        playerPointsContainer.appendChild(playerElement);
    });

    const categoryButtonsContainer = document.getElementById('category-buttons');
    categoryButtonsContainer.innerHTML = ""; // Clear previous categories
    
    const randomCategories = data.sort(() => 0.5 - Math.random()).slice(0, 4);
    console.log("Random categories:", randomCategories);
    randomCategories.forEach(category => {
        const button = document.createElement('button');
        const categoryName = category.getAttribute('name');
        button.textContent = categoryName;
        button.setAttribute('data-category', categoryName);
        button.classList.add('category-button');
        button.addEventListener('click', function() {
            selectedCategory = category;
            loadThemesForCategory(category);
        });
        categoryButtonsContainer.appendChild(button);
    });

    document.getElementById('category-selection').classList.remove('hidden');
    document.getElementById('player-name').classList.remove('hidden');
    document.getElementById('player-points').classList.remove('hidden');
}

function loadThemesForCategory(category) {
    const themeButtonsContainer = document.getElementById('theme-buttons');
    themeButtonsContainer.innerHTML = "";
    themeButtonsContainer.classList.add('selection-container');

    const themes = Array.from(category.getElementsByTagName('thm'));
    const randomThemes = themes.sort(() => 0.5 - Math.random()).slice(0, 2);

    randomThemes.forEach(theme => {
        const button = document.createElement('button');
        const themeName = theme.getAttribute('name');
        button.textContent = themeName;
        button.classList.add('theme-button');
        button.addEventListener('click', () => selectTheme(theme));
        themeButtonsContainer.appendChild(button);
    });

    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('theme-selection').classList.remove('hidden');
}

function selectTheme(theme) {
    selectedTheme = theme;
    document.getElementById('theme-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.remove('hidden');
}

// Listen for the relinquish-turn button
document.getElementById('relinquish-turn').addEventListener('click', function() {
    i++;
    if (i == playerCount) {
        i = 0;
    }

    question_points = 0;

    restartProcess();
});

document.querySelectorAll('.difficulty-button').forEach(button => {
    button.addEventListener('click', function() {
        const selectedDifficulty = this.getAttribute('data-difficulty');
        const filteredQuestions = Array.from(selectedTheme.getElementsByTagName('q'))
            .filter(q => q.getAttribute('dif') === selectedDifficulty);

        if (filteredQuestions.length > 0) {
            const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
            document.getElementById('question').textContent = randomQuestion.getElementsByTagName('txt')[0].textContent;
            document.getElementById('answer').textContent = randomQuestion.getElementsByTagName('a')[0].textContent;
            document.getElementById('question-container').classList.remove('hidden');
            document.getElementById('answer').classList.add('hidden');
            document.getElementById('difficulty-selection').classList.add('hidden');
            document.getElementById('show-answer-button').classList.remove('hidden');
        } else {
            document.getElementById('question').textContent = "No questions available for this difficulty.";
            document.getElementById('answer').textContent = "";
            document.getElementById('question-container').classList.remove('hidden');
            document.getElementById('answer').classList.add('hidden');
            document.getElementById('difficulty-selection').classList.add('hidden');
        }

        console.log("Selected difficulty:", selectedDifficulty);
        if (selectedDifficulty === "easy") {
            question_points = 1;
        } else if (selectedDifficulty === "med") {
            question_points = 2;
        } else if (selectedDifficulty === "hard") {
            question_points = 3;
        } else if (selectedDifficulty === "vhard") {
            question_points = 4;
        }
    });
});

document.getElementById('show-answer-button').addEventListener('click', function() {
    document.getElementById('answer').classList.remove('hidden');
    document.getElementById('show-answer-button').classList.add('hidden');
    document.getElementById('answer-buttons').classList.remove('hidden');
});

document.getElementById('correct-button').addEventListener('click', function() {
    alert("Correct!");
    players[i].points += question_points;
    question_points = 0;
    document.getElementById('answer-buttons').classList.add('hidden');
    restartProcess();
});

document.getElementById('wrong-button').addEventListener('click', function() {
    alert("Incorrect!");
    i++;
    if (i == playerCount) {
        i = 0;
    }

    question_points = 0;
    document.getElementById('answer-buttons').classList.add('hidden');
    restartProcess();
});

function restartProcess() {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('theme-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('category-selection').classList.remove('hidden');
    loadRandomCategories();
}



// Load questions when the page loads
window.onload = loadQuestions;
