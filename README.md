Syncho Workspace 🚀
An open-source, real-time, all-in-one workspace inspired by Notion and Trello. Syncho Workspace allows users to create unique, shareable workspaces identified by a SynchoID. Each workspace is a versatile container for documents, task boards, whiteboards, notes, and images, designed to be fully responsive for both desktop and mobile use.

✨ Core Features
ID-Based Workspaces: Create or access persistent, shareable workspaces using a unique SynchoID. No registration required.

📄 Notion-like Docs: A rich-text editor with Markdown support for creating detailed documents with embedded images.

📊 Kanban Boards: Manage tasks and workflows with draggable cards, columns, and assignee tracking, similar to Trello.

🎨 Digital Whiteboards: A freeform canvas for brainstorming, drawing, and visual collaboration, powered by an integrated library.

📝 Quick Notes & Images: Simple storage for quick text notes and images.

🏷️ Tagging System: Organize all items (Docs, Boards, etc.) with custom tags for easy filtering and searching.

📱 Fully Responsive: A mobile-first design ensures a seamless experience on any device, from phones to desktops.

☁️ Real-time Sync: All data is synchronized in real-time across all users in the same workspace, thanks to Firebase Firestore.

🛠️ Tech Stack
Frontend: React (with Vite)

Styling: Tailwind CSS

Backend & Database: Firebase (Firestore, Storage, Hosting)

Routing: React Router

State Management: React Context / Hooks (or other libraries as needed)

Specialized Libraries:

Drag & Drop for Kanban (e.g., react-beautiful-dnd)

Whiteboard (e.g., tldraw)

🚀 Getting Started
Follow these instructions to set up and run the project on your local machine.

1. Prerequisites
Make sure you have Node.js (version 18 or higher) installed on your system.

2. Installation & Setup
Clone the repository:

Bash

git clone https://github.com/your-username/syncho-workspace.git
cd syncho-workspace
Install dependencies:

Bash

npm install
Set up environment variables:

Create a file named .env.local in the root of the project.

Copy the contents of .env.example (if you create one) or add the required Firebase configuration variables as shown below.

3. Environment Variables
You need to create a Firebase project and get your web app configuration keys. Add them to your .env.local file:

Đoạn mã

# Firebase Configuration
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
4. Run the Development Server
Bash

npm run dev
The application should now be running on http://localhost:5173.

☁️ Deployment
This project is configured for easy deployment with Firebase Hosting.

Build the project for production:

Bash

npm run build
Deploy to Firebase:
Make sure you have the Firebase CLI installed (npm install -g firebase-tools). Then run:

Bash

firebase deploy
