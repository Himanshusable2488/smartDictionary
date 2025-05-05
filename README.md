# Smart Dictionary

An interactive online English dictionary application that allows users to search for word definitions, synonyms, antonyms, and example sentences.

![Smart Dictionary](https://via.placeholder.com/800x400?text=Smart+Dictionary+Screenshot)

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [External API Integration](#external-api-integration)
- [Contributing](#contributing)
- [License](#license)

## Features

- Search for word definitions
- View synonyms and antonyms
- See example sentences for each word
- Search history tracking
- Responsive design for all devices
- Automatic data fetching from external API when words are not in the local database
- Local database storage for faster subsequent lookups

## Technologies Used

- **Frontend**:
  - HTML5
  - CSS3 (with Bootstrap 5)
  - JavaScript (Vanilla)
  - Font Awesome for icons

- **Backend**:
  - Node.js
  - Express.js
  - MySQL (with mysql2 driver)

- **External API**:
  - [Dictionary API](https://api.dictionaryapi.dev/) for fetching word data

## Project Structure

```
smartDictionary/
├── app.js                # Frontend JavaScript
├── index.html            # Main HTML file
├── server.js             # Express server and API endpoints
├── package.json          # Project dependencies
├── package-lock.json     # Dependency lock file
└── README.md             # Project documentation
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smartDictionary.git
   cd smartDictionary
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the MySQL database (see [Database Setup](#database-setup))

4. Start the server:
   ```bash
   node server.js
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

## Database Setup

1. Install MySQL if you haven't already.

2. Create a new database:
   ```sql
   CREATE DATABASE dictionary_db;
   USE dictionary_db;
   ```

3. Create the necessary tables:
   ```sql
   CREATE TABLE words (
     word_id INT AUTO_INCREMENT PRIMARY KEY,
     word VARCHAR(255) NOT NULL UNIQUE,
     definition TEXT NOT NULL
   );

   CREATE TABLE synonyms (
     synonym_id INT AUTO_INCREMENT PRIMARY KEY,
     word_id INT,
     synonym VARCHAR(255) NOT NULL,
     FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE
   );

   CREATE TABLE antonyms (
     antonym_id INT AUTO_INCREMENT PRIMARY KEY,
     word_id INT,
     antonym VARCHAR(255) NOT NULL,
     FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE
   );

   CREATE TABLE examples (
     example_id INT AUTO_INCREMENT PRIMARY KEY,
     word_id INT,
     example_sentence TEXT NOT NULL,
     FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE
   );
   ```

4. Update the database connection settings in `server.js` if needed:
   ```javascript
   const connection = mysql.createConnection({
     host: 'localhost',
     user: 'root',  // Replace with your MySQL username
     password: 'ROOT',  // Replace with your MySQL password
     database: 'dictionary_db'
   });
   ```

## Usage

1. Enter a word in the search box and press Enter or click the Search button.
2. The application will display the definition, example sentences, synonyms, and antonyms for the word.
3. If the word is not in the local database, the application will fetch it from the external API and save it for future use.
4. Your search history will be displayed below the search box for quick access to previously searched words.

## API Endpoints

### GET `/api/word/:word`

Retrieves information about a specific word.

**Parameters**:
- `word`: The word to look up

**Response**:
```json
{
  "word": "example",
  "definition": "a thing characteristic of its kind or illustrating a general rule",
  "synonyms": "sample,instance,case",
  "antonyms": "exception,anomaly",
  "examples": "this is an example of how the system works"
}
```

## External API Integration

The application uses the [Free Dictionary API](https://api.dictionaryapi.dev/) to fetch word data when it's not available in the local database. The fetched data is then stored in the database for faster subsequent lookups.

```javascript
async function fetchWordFromAPI(word) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    // Process and return the data
  } catch (error) {
    console.error(`Error fetching word from API: ${error}`);
    return null;
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created by [Your Name](https://github.com/yourusername)
