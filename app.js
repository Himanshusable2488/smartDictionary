// Get references to the necessary DOM elements
const inputEl = document.getElementById("word-input");
const searchButton = document.getElementById("search-button");
const definitionEl = document.getElementById("definition");
const exampleSentencesEl = document.getElementById("example-sentences");
const synonymsEl = document.getElementById("synonyms");
const antonymsEl = document.getElementById("antonyms");
const definitionContainer = document.getElementById("definition-container");
const loadingSpinner = document.getElementById("loading-spinner");
const errorMessageEl = document.getElementById("error-message");
const searchedWordEl = document.getElementById("searched-word");
const searchHistoryEl = document.getElementById("search-history");
const clearButtonEl = document.getElementById("clear-button");

// Function to search for a word
function searchWord() {
    const word = inputEl.value.trim(); // Get the word from the input field

    // Clear previous results but keep the word visible
    definitionContainer.style.display = 'none';
    errorMessageEl.style.display = 'none';
    definitionEl.innerText = '';
    exampleSentencesEl.innerHTML = '';
    synonymsEl.innerHTML = '';
    antonymsEl.innerHTML = '';
    loadingSpinner.style.display = 'block';

    // Ensure the user entered a word
    if (!word) {
        showError('Please enter a word.');
        loadingSpinner.style.display = 'none';
        return;
    }

    // Add to search history
    addToSearchHistory(word);

    // Fetch data from the server
    fetch(`http://localhost:3001/api/word/${word}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Word not found.'); // Throw an error if response is not OK
            }
            return response.json(); // Parse the response as JSON
        })
        .then(data => {
            loadingSpinner.style.display = 'none';
            if (data.message) {
                showError(data.message);
            } else {
                displayWordDetails(data, word);
                inputEl.value = '';
            }
        })
        .catch(err => {
            loadingSpinner.style.display = 'none';
            showError('Error fetching word data. Please try again.'); // Show generic error message
        });
}

// Event listeners
searchButton.addEventListener("click", searchWord);

// Add keyboard enter functionality
inputEl.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        searchWord();
    }
});

// Clear button functionality
clearButtonEl.addEventListener("click", () => {
    inputEl.value = '';
    inputEl.focus();
});

// Function to display the details of the searched word
function displayWordDetails(data, word) {
    // Display the searched word with proper capitalization
    searchedWordEl.innerText = word.charAt(0).toUpperCase() + word.slice(1);

    // Set the definition text
    definitionEl.innerText = data.definition;

    // Handle example sentences
    if (data.examples) {
        let examplesArray = data.examples.split(',');
        exampleSentencesEl.innerHTML = examplesArray
            .map(example => `<li class="example-item">${example.trim()}</li>`)
            .join('');
    } else {
        exampleSentencesEl.innerHTML = '<li class="text-muted">No examples available.</li>';
    }

    // Handle synonyms
    if (data.synonyms) {
        let synonymsArray = data.synonyms.split(',');
        synonymsEl.innerHTML = synonymsArray
            .map(synonym => `<span class="badge bg-info text-dark m-1">${synonym.trim()}</span>`)
            .join('');
    } else {
        synonymsEl.innerHTML = '<span class="text-muted">No synonyms available.</span>';
    }

    // Handle antonyms
    if (data.antonyms) {
        let antonymsArray = data.antonyms.split(',');
        antonymsEl.innerHTML = antonymsArray
            .map(antonym => `<span class="badge bg-danger m-1">${antonym.trim()}</span>`)
            .join('');
    } else {
        antonymsEl.innerHTML = '<span class="text-muted">No antonyms available.</span>';
    }

    // Reset the fade-in class first
    definitionContainer.classList.remove('fade-in');

    // Show the definition container with a fade-in effect
    definitionContainer.style.display = 'block';

    // Use requestAnimationFrame for smoother animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            definitionContainer.classList.add('fade-in');
        });
    });

    // Scroll to the results
    definitionContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Function to display error messages
function showError(message) {
    errorMessageEl.innerText = message; // Set the error message text
    errorMessageEl.style.display = 'block'; // Display the error message
}

// Function to add a word to search history
function addToSearchHistory(word) {
    // Get existing history from localStorage or initialize empty array
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

    // Remove the word if it already exists (to avoid duplicates)
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== word.toLowerCase());

    // Add the new word at the beginning
    searchHistory.unshift(word);

    // Keep only the last 5 searches
    searchHistory = searchHistory.slice(0, 5);

    // Save back to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));

    // Update the UI
    updateSearchHistoryUI();
}

// Function to update the search history UI
function updateSearchHistoryUI() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');

    // Clear the current history
    searchHistoryEl.innerHTML = '';

    // If there's no history, hide the container
    if (searchHistory.length === 0) {
        document.getElementById('history-container').style.display = 'none';
        return;
    }

    // Show the container
    document.getElementById('history-container').style.display = 'block';

    // Add each word to the history list
    searchHistory.forEach(word => {
        const historyItem = document.createElement('button');
        historyItem.className = 'btn btn-sm btn-outline-secondary me-2 mb-2';
        historyItem.textContent = word;
        historyItem.addEventListener('click', () => {
            inputEl.value = word;
            searchWord();
        });
        searchHistoryEl.appendChild(historyItem);
    });
}

// Initialize search history on page load
document.addEventListener('DOMContentLoaded', updateSearchHistoryUI);
