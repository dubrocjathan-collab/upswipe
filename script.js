// JavaScript functionality for the user interface

// Function to display current date and time in UTC
function displayDateTime() {
    const now = new Date();
    const utcDateTime = now.toISOString().replace('T', ' ').substring(0, 19);
    document.getElementById('dateTimeDisplay').innerText = utcDateTime;
}

// Initialize the display
window.onload = displayDateTime;