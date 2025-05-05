const express = require('express');
const mysql = require('mysql2'); // Use mysql2 for better performance
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // For making API requests
const path = require('path');

const app = express();
const port = process.env.PORT || 3001; // Set server port

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all requests
app.use(express.static(path.join(__dirname))); // Serve static files from the public folder

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL connection setup
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Replace with your MySQL username
    password: 'ROOT',  // Replace with your MySQL password
    database: 'dictionary_db'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Function to fetch word data from external API
async function fetchWordFromAPI(word) {
    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const apiData = response.data[0];  // Get the first result from the API

        // Extract relevant data from API response
        return {
            word,
            definition: apiData.meanings[0]?.definitions[0]?.definition || '',
            synonyms: apiData.meanings[0]?.synonyms.join(',') || '',
            antonyms: apiData.meanings[0]?.antonyms.join(',') || '',
            examples: apiData.meanings[0]?.definitions[0]?.example || ''
        };
    } catch (error) {
        console.error(`Error fetching word from API: ${error}`);
        return null; // Return null if there is an error
    }
}

// Endpoint to search for a word
app.get('/api/word/:word', (req, res) => {
    const word = req.params.word;

    // Query database for the word
    const query = `
        SELECT w.word, w.definition, 
            GROUP_CONCAT(DISTINCT s.synonym) AS synonyms, 
            GROUP_CONCAT(DISTINCT a.antonym) AS antonyms,
            GROUP_CONCAT(DISTINCT e.example_sentence) AS examples
        FROM words w
        LEFT JOIN synonyms s ON w.word_id = s.word_id
        LEFT JOIN antonyms a ON w.word_id = a.word_id
        LEFT JOIN examples e ON w.word_id = e.word_id
        WHERE w.word = ?
        GROUP BY w.word, w.definition;
    `;

    connection.query(query, [word], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length > 0) {
            // Word found in the database
            console.log(`Word "${word}" found in the database.`);
            return res.json(results[0]);
        } 

        // Word not found, fetch from external API
        console.log(`Word "${word}" not found in the database. Fetching from API...`);
        const wordData = await fetchWordFromAPI(word);

        if (wordData) {
            console.log('Fetched API Data:', wordData);

            // Insert word into the database
            const insertWordQuery = `INSERT INTO words (word, definition) VALUES (?, ?)`;
            connection.query(insertWordQuery, [wordData.word, wordData.definition], (err, result) => {
                if (err) {
                    console.error('Error inserting word:', err);
                    return res.status(500).json({ error: 'Failed to insert word' });
                }

                const wordId = result.insertId;
                console.log(`Inserted word "${word}" with ID ${wordId} into the database`);

                // Insert antonyms
                if (wordData.antonyms) {
                    const antonymArray = wordData.antonyms.split(','); // Convert to array
                    antonymArray.forEach((ant) => {
                        const insertAntonymQuery = `INSERT INTO antonyms (word_id, antonym) VALUES (?, ?)`;
                        connection.query(insertAntonymQuery, [wordId, ant.trim()], (err) => {
                            if (err) console.error('Error inserting antonym:', err);
                        });
                    });
                }

                // Insert synonyms
                if (wordData.synonyms) {
                    const synonymArray = wordData.synonyms.split(','); // Convert to array
                    synonymArray.forEach((syn) => {
                        const insertSynonymQuery = `INSERT INTO synonyms (word_id, synonym) VALUES (?, ?)`;
                        connection.query(insertSynonymQuery, [wordId, syn.trim()], (err) => {
                            if (err) console.error('Error inserting synonym:', err);
                        });
                    });
                }

                // Insert example sentences
                if (wordData.examples) {
                    const exampleArray = wordData.examples.split(','); // Convert to array
                    exampleArray.forEach((example) => {
                        const insertExampleQuery = `INSERT INTO examples (word_id, example_sentence) VALUES (?, ?)`;
                        connection.query(insertExampleQuery, [wordId, example.trim()], (err) => {
                            if (err) console.error('Error inserting example sentence:', err);
                        });
                    });
                }

                // Send the inserted word data back as a response
                res.json(wordData);
            });
        } else {
            console.log('Word not found in API or database.');
            res.status(404).json({ message: 'Word not found in the API or database.' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
