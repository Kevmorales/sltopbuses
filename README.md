# SL Bus Lines App

This is a React and Node.js application that displays the top 10 SL bus lines based on their stops. The frontend fetches data from the backend, which in turn queries the SL API.

## Running the App Locally

### Prerequisites

- Node.js and npm
- A `.env` file with the necessary API key (`API_STOPSTWO`)

### Setup and Configuration

1. **Clone the repository**:

   ```bash
   git clone <your-repository-url>
   cd <your-repository-directory>
   ```

2. **Install the dependencies**:

   ```bash
   npm install
   ```

3. **Update API calls in `App.js`**:

   Replace the production API URLs:

  ```javascript
 const response = await axios.get("https://sl-top-bus-5ae71ac43dba.herokuapp.com/top-bus-lines");
```

   and:

   ```javascript
const response = await axios.get("https://sl-top-bus-5ae71ac43dba.herokuapp.com/${lineNumber}/${direction}");
```
With the local urls:
	
  ```javascript
 const response = await axios.get("http://localhost:3002/top-bus-lines");
```

   and:

  ```javascript
 const response = await axios.get(`http://localhost:3002/${lineNumber}/${direction}`);
```

4. **Update CORS settings in server.js**:

Change:

   ```javascript
cors({
    origin: "https://sbab-sl-buses.surge.sh",
})
```
to: 

   ```javascript
cors({
    origin: "http://localhost:3000", // Assuming React app is running on port 3000
})
```

5. **Run the backend server**:
    ```bash
   node server.js
   ```
6. **Run the React app:**
In a new terminal window, and within the project directory, run:

```bash
npm start
```

### Notes
Ensure you have your .env file set up in the root of the project (or where necessary) with your API key:

```
API_STOPSTWO=your_api_key_here
```
