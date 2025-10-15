# 🚀 Syncho - Collaborative Workspace Platform

A modern, real-time collaborative workspace platform built with React and Firebase. Syncho allows users to create unique, shareable workspaces for notes, Kanban boards, and whiteboards - all synchronized in real-time.

![React](https://img.shields.io/badge/React-19.1.1-blue)
![Vite](https://img.shields.io/badge/Vite-Latest-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🔐 **Workspace Management**
- **ID-Based Workspaces**: Create or access persistent workspaces using a unique SynchoID
- **No Registration Required**: Start collaborating immediately
- **Admin Controls**: Lock/unlock workspaces, manage access

### 📝 **Rich Text Notes**
- **WYSIWYG Editor**: Full-featured rich text editor with formatting tools
- **Real-time Sync**: Changes are instantly synchronized across all users
- **Auto-save**: Never lose your work with automatic saving
- **Responsive Design**: Optimized for both desktop and mobile

### 📊 **Kanban Boards**
- **Drag & Drop**: Intuitive card and column management with @dnd-kit
- **Task Management**: Add tasks with content, assignees, and deadlines
- **Date Picker**: Set deadlines with an integrated calendar
- **Visual Organization**: Multiple boards per workspace
- **Horizontal Scroll**: Smooth mouse wheel scrolling for wide boards

### 🎨 **Themes**
- **6 Beautiful Themes**: Dark, Light, Ocean Blue, Purple Dream, Forest Green, Rose Garden
- **Persistent Settings**: Theme preferences saved per user
- **Smooth Transitions**: Elegant theme switching animations

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Smooth interactions on mobile devices
- **Adaptive Layout**: Sidebar collapses on mobile with overlay

## 🛠️ Tech Stack

### **Frontend**
- **React 19.1.1** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM 7.9.4** - Client-side routing
- **Tailwind CSS** - Utility-first styling

### **Backend & Database**
- **Firebase 12.4.0**
  - Firestore - Real-time NoSQL database
  - Authentication - User management
  - Storage - File storage

### **Key Libraries**
- **@dnd-kit** - Modern drag and drop
  - `@dnd-kit/core` - Core functionality
  - `@dnd-kit/sortable` - Sortable lists
  - `@dnd-kit/utilities` - Helper utilities
- **react-datepicker 8.7.0** - Date selection
- **lucide-react 0.545.0** - Beautiful icons
- **react-markdown 10.1.0** - Markdown rendering

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Firebase account** (for backend services)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kuro2908/syncho.git
cd syncho
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

> **Note**: Get these values from your Firebase project settings

4. **Run the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

Vercel will automatically:
- Detect Vite configuration
- Build the project
- Deploy to CDN
- Setup custom domain (optional)

### Deploy to Render

1. Create a new Static Site on Render
2. Connect your repository
3. Set build command: `npm install && npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

## 📁 Project Structure

```
syncho/
├── src/
│   ├── components/          # Reusable components
│   │   ├── KanbanCard.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── RichTextEditor.jsx
│   │   ├── Sidebar.jsx
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   ├── ThemeContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx
│   │   ├── NotesPage.jsx
│   │   ├── NoteEditorPage.jsx
│   │   ├── KanbanPage.jsx
│   │   ├── KanbanBoardPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── WorkspacePage.jsx
│   ├── styles/              # CSS files
│   │   ├── datepicker-custom.css
│   │   └── kanban-custom.css
│   ├── firebase.js          # Firebase configuration
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── .env                     # Environment variables (not committed)
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 🎨 Features in Detail

### Notes System
- Create and edit rich text notes
- Auto-save functionality
- Real-time synchronization
- Responsive editor with sticky toolbar
- Support for bold, italic, underline, strikethrough
- Text alignment and lists
- Color picker for text
- Font size selection

### Kanban Boards
- Create multiple boards per workspace
- Drag and drop cards between columns
- Drag and drop to reorder columns
- Add/edit/delete tasks
- Assign tasks to team members
- Set deadlines with date picker
- Visual deadline indicators (overdue, today, upcoming)
- Horizontal scroll with mouse wheel
- Smooth animations and transitions

### Theme System
- 6 pre-built themes
- Instant theme switching
- Persistent theme preferences
- Smooth color transitions
- Consistent design across all components

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**kuro2908**
- GitHub: [@kuro2908](https://github.com/kuro2908)

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Drag and drop by [@dnd-kit](https://dndkit.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Backend by [Firebase](https://firebase.google.com/)

---

Made with ❤️ by kuro2908
