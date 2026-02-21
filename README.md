# Remember This - Scheduled Memory Sharing

"Remember This" is a web application that allows users to send scheduled digital memories (images) to other registered users. These memories only appear on or after a specific future date, creating a nostalgic surprise for the recipient.

## Features
- **User Authentication:** Simple registration and login system.
- **Schedule Memories:** Upload an image, pick a date, and choose a recipient.
- **Automatic Notifications:** Real-time popup notifications when you log in and have a memory waiting for you.
- **Memory History:** View all memories you have received in a gallery.
- **Sent Items Tracking:** Track the memories you've sent and see if they've been viewed.
- **SQLite Database:** Reliable storage for users and memories.

## Technical Stack
- **Backend:** Node.js, Express.js
- **Database:** SQLite (file-based)
- **Image Uploads:** Multer
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)

---

## Step-by-Step Instructions

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Installation
1.  **Clone or Download** the project files to your local machine.
2.  Open your terminal/command prompt in the project directory.
3.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Running the Application
1.  Start the server:
    ```bash
    node server.js
    ```
2.  Open your browser and go to: `http://localhost:3000`

---

## How to Use Each Feature

### 1. Registration & Login
- On the home page, click **"Register here"** to create a new account.
- Enter a **Username**, **Email**, and **Password**.
- Once registered, log in with your credentials. You will be redirected to the **Dashboard**.

### 2. Scheduling a Memory
- On the **Dashboard**:
    1.  Click **"Choose File"** and select an image from your computer.
    2.  Select a **Future Date** using the date picker.
    3.  Enter the **Username** of another registered user. (Note: You can register a second account in a private/incognito window to test this!)
    4.  Click **"Send Memory"**.
![alt](<img width="1920" height="1080" alt="Screenshot 2026-02-21 160104" src="https://github.com/user-attachments/assets/43a05177-051a-4da3-a26f-4ccbab5924ba" />
)
### 3. Receiving a Memory (The Popup)
- Log in as the **Recipient** user.
- If the current date is **on or after** the date selected by the sender, a **popup notification** will automatically appear as soon as you land on any page (Dashboard, History, etc.).
- The popup will show the image and the sender's name.

### 4. Viewing Received History
- Click on **"Received"** in the navigation bar.
- Here you can see a gallery of all memories that have been "unlocked" for you.

### 5. Tracking Sent Memories
- Click on **"Sent"** in the navigation bar.
- You will see a list of all memories you have scheduled.
- Each memory shows a **Status Badge**:
    - **Pending:** The recipient hasn't seen it yet (either the date hasn't arrived, or they haven't logged in).
    - **Seen:** The recipient has seen the popup notification.

---

## Project Structure
- `server.js`: The Express server and API endpoints.
- `database.js`: SQLite database initialization and connection.
- `public/`: Contains the frontend files (HTML, CSS, JS).
- `uploads/`: Stores the uploaded images.
- `data/`: Stores the SQLite database file (`remember_this.db`).
