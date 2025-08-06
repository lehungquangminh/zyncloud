const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));

// Handle auth callback route
app.get('/auth/callback', (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.redirect('/auth/error?message=No token provided');
  }
  
  // Render a success page with the token
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Success</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .success-message {
            background-color: #dff0d8;
            color: #3c763d;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .token-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            word-break: break-all;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
          }
          button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="success-message">
          <h2>✅ Authentication Successful!</h2>
          <p>You have been successfully authenticated.</p>
        </div>
        
        <h3>Your JWT Token:</h3>
        <div class="token-box">
          ${token}
        </div>
        
        <h3>Actions:</h3>
        <button onclick="window.localStorage.setItem('jwt_token', '${token}'); alert('Token saved!')">
          Save Token
        </button>
        <button onclick="window.location.href = '/'">
          Return to Home
        </button>

        <script>
          // Store the token in localStorage automatically
          window.localStorage.setItem('jwt_token', '${token}');
        </script>
      </body>
    </html>
  `);
});

// Handle auth error route
app.get('/auth/error', (req, res) => {
  const message = req.query.message || 'Unknown error occurred';
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Authentication Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .error-message {
            background-color: #f2dede;
            color: #a94442;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="error-message">
          <h2>❌ Authentication Error</h2>
          <p>${message}</p>
        </div>
        
        <button onclick="window.location.href = '/'">
          Return to Home
        </button>
      </body>
    </html>
  `);
});

app.listen(5173, () => {
  console.log('Test server running on http://localhost:5173');
});
