const mysql = require('mysql2');
const axios = require('axios');

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Birthdays'
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }

  // Get today's date in MM-DD format
  const today = new Date().toISOString().slice(5, 10);
  console.log('Today:', today);

  // MySQL query to fetch employees with birthdays today
  const query = `
    SELECT name
    FROM employees
    WHERE DATE_FORMAT(Dob, '%m-%d') = ?
  `;

  // Execute MySQL query
  connection.query(query, [today], async (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      connection.end();
      return;
    }

    if (results.length > 0) {
      const birthdayNames = results.map(row => row.name);
      console.log(`Today's List: ${birthdayNames.join(', ')}`);

      // Prepare data for Facebook Graph API request
      const data = {
        "messaging_product": "whatsapp",
        "to": "917219709493", 
        "type": "template",
        "template": {
          "name": "default_marketing",
          "language": {
            "code": "en_US"
          },
          "components": [{
            "type": "body",
            "parameters": [{
              "type": "text",
              "text": `Today's birthdays: ${birthdayNames.join(', ')}`
            }]
          }]
        }
      };

      try {
        // Make POST request to Facebook Graph API
        const response = await axios.post('https://graph.facebook.com/v19.0/108073845361065/messages', data, {
          headers: {
            'Authorization': 'Bearer EAAQA89po4g8BADaGA4K7NVKx2xPAxZBO6EhXBfZArNFsi5cJmjM1CiZAIfTfLcMIGZBdgQ0yjDhCjzlywDB24yL0M61u7EE9wwSZCX5lTP1vdPxKVkROAuDyAF2YQ9BZA1qvjyLOMEKrUBw1cp7dUwBFwOQkG4z4bdbr7d0VtNmHU0y4ppJurggCgCMKuLdoDPCRTRfenohAZDZD',
            'Content-Type': 'application/json'
          }
        });

        console.log('API Response:', response.data);
      } catch (error) {
        console.error('Error sending API request:', error.response ? error.response.data : error.message);
      }
    } else {
      console.log(`No birthdays today (${today}).`);
    }

    // Close MySQL connection
    connection.end();
  });
});
