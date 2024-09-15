const apiKey = "8720b07b16bdf0a10bba8bac23c90ec3a68b47b8"; // Replace with your API key
const secret = "37b68ff5d722c507800731842ca6626013ef915d"; // Replace with your API secret

// Function to generate a random 6-character string
function getRandomString(length) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get the current Unix timestamp in seconds
function getTime() {
  return Math.floor(Date.now() / 1000);
}

// Function to create SHA-512 hash
async function createHash(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-512", dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Function to generate the apiSig
async function generateApiSig(methodName, params, secret) {
  const rand = getRandomString(6);
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const stringToHash = `${rand}/${methodName}?${sortedParams}#${secret}`;
  const hash = await createHash(stringToHash);
  return rand + hash;
}

// Function to make the private API request
async function makeApiRequest(methodName, additionalParams = {}) {
  const time = getTime();

  // Add the required parameters for authentication
  const params = {
    apiKey,
    time,
    ...additionalParams,
  };

  // Generate the apiSig
  const apiSig = await generateApiSig(methodName, params, secret);

  // Construct the URL
  const baseUrl = `https://codeforces.com/api/${methodName}`;
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const url = `${baseUrl}?${queryString}&apiSig=${apiSig}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error making API request:", error);
    return { status: "FAILED", comment: error.message };
  }
}

// Fetch user friends
async function fetchUserFriends() {
  const handleInput = document.getElementById("handle");
  const onlyOnline = document.getElementById("onlyOnline").checked;
  const handle = handleInput.value.trim();
  const userFriendsData = document.getElementById("userFriendsData");

  if (!handle) {
    userFriendsData.textContent = "Please enter a user handle.";
    return;
  }

  // Show loading message
  userFriendsData.textContent = "Loading...";

  const data = await makeApiRequest("user.friends", { onlyOnline });

  // Display the response data
  if (data.status === "OK") {
    userFriendsData.textContent = JSON.stringify(data.result, null, 2);
    handleInput.value = ""; // Clear the input field
  } else {
    userFriendsData.textContent = `Error: ${
      data.comment || "Failed to fetch data"
    }`;
  }
}

// Fetch user info
async function fetchUserInfo() {
  const handlesInput = document.getElementById("userHandles");
  const checkHistoricHandles = document.getElementById(
    "checkHistoricHandles"
  ).checked;
  const userInfoData = document.getElementById("userInfoData");

  const handles = handlesInput.value.trim();

  if (!handles) {
    userInfoData.textContent = "Please enter user handles.";
    return;
  }

  // Show loading message
  userInfoData.textContent = "Loading...";

  const data = await makeApiRequest("user.info", {
    handles,
    checkHistoricHandles,
  });

  // Function to display user info in a beautiful format
  function displayUserInfo(data) {
    const userInfoDataDiv = document.getElementById("userInfoData");
    userInfoDataDiv.innerHTML = ""; // Clear previous data

    const user = data.result[0]; // Assuming single user data

    const userInfoHTML = `
    <div style="
      border: 1px solid #ddd;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      margin-top: 20px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <img src="${user.avatar}" alt="Avatar" style="
        width: 150px;
        height: 150px;
        border-radius: 50%;
        border: 2px solid #ddd;
        margin-bottom: 10px;
      ">
      <h2 style="
        font-size: 24px;
        color: #333;
        margin: 0 0 10px 0;
      ">${user.firstName || ""} ${user.lastName || ""} (@${user.handle})</h2>
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Country:</strong> ${
          user.country || "N/A"
        }</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">City:</strong> ${user.city || "N/A"}</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Rating:</strong> ${user.rating}</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Max Rating:</strong> ${
          user.maxRating
        }</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Rank:</strong> ${user.rank}</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Max Rank:</strong> ${user.maxRank}</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Contribution:</strong> ${
          user.contribution
        }</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Friends:</strong> ${
          user.friendOfCount
        }</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Organization:</strong> ${
          user.organization || "N/A"
        }</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Last Online:</strong> ${formatDate(
          user.lastOnlineTimeSeconds
        )}</p>
        <p style="
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        "><strong style="color: #333;">Registered On:</strong> ${formatDate(
          user.registrationTimeSeconds
        )}</p>
      </div>
    </div>
  `;

    userInfoDataDiv.innerHTML = userInfoHTML;
  }

  // Function to format timestamp into a human-readable date
  function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  if (data.status === "OK") {
    displayUserInfo(data);
    handlesInput.value = ""; // Clear the input field
  } else {
    userInfoData.textContent = `Error: ${
      data.comment || "Failed to fetch data"
    }`;
  }
}
