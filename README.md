# 📄 PDF Annotator - Full Stack Application

A professional-grade PDF annotation tool built with the MERN stack, allowing users to upload, view, highlight, and annotate PDF documents with persistent storage.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure login/registration
- **User-specific data isolation** - users only see their own PDFs
- **Protected routes** and API endpoints

### 📄 PDF Management
- **Drag & drop PDF upload** with file validation
- **PDF viewer** with zoom, rotation, and navigation
- **Text selection and highlighting** with 8 color options
- **Persistent annotations** stored in MongoDB
- **Search and filter** through your PDF library

### 💻 Modern Tech Stack
- **Frontend**: React 18 + TypeScript + Styled Components
- **Backend**: Node.js + Express + JWT middleware
- **Database**: MongoDB with Mongoose ODM
- **PDF Rendering**: @react-pdf-viewer with PDF.js
- **State Management**: React Query for server state
- **File Storage**: Local filesystem with UUID tracking

## 🚀 Live Demo

- **Frontend**: [Your deployed frontend URL]
- **Backend API**: [Your deployed backend URL]

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
Edit .env with your MongoDB connection string and JWT secret, then:

bash
Copy code
npm run dev
Frontend Setup
bash
Copy code
cd frontend
npm install
npm start
Environment Variables
Backend (.env)
env
Copy code
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
Frontend (.env)
env
Copy code
REACT_APP_API_URL=http://localhost:5000/api
📱 Screenshots
[Add screenshots of your app here]

🏗️ Architecture
Backend Structure
plaintext
Copy code
backend/
├── controllers/   # Request handlers
├── middleware/    # Auth & validation
├── models/        # MongoDB schemas
├── routes/        # API endpoints
├── uploads/       # PDF file storage
└── server.js      # Express server
Frontend Structure
plaintext
Copy code
frontend/
├── src/
│   ├── components/  # React components
│   ├── pages/       # Route components
│   ├── context/     # Auth context
│   ├── services/    # API calls
│   ├── styles/      # Styled components
│   └── utils/       # Helper functions
🔧 API Endpoints
Authentication
http
Copy code
POST /api/auth/register   # User registration
POST /api/auth/login      # User login
PDFs
http
Copy code
GET    /api/pdfs           # Get user's PDFs
POST   /api/pdfs/upload    # Upload PDF
GET    /api/pdfs/view/:uuid # View PDF file
DELETE /api/pdfs/:uuid     # Delete PDF
Highlights
http
Copy code
GET    /api/highlights/:pdfUuid # Get PDF highlights
POST   /api/highlights          # Create highlight
DELETE /api/highlights/:uuid    # Delete highlight
🚀 Deployment
This project is deployment-ready with:

Production-optimized builds

Environment variable configuration

CORS setup for cross-origin requests

Error handling and logging

Deploy to Render/Vercel/Heroku
[Add deployment instructions]

🤝 Contributing
Fork the repository

Create feature branch

bash
Copy code
git checkout -b feature/amazing-feature
Commit changes

bash
Copy code
git commit -m "Add amazing feature"
Push to branch

bash
Copy code
git push origin feature/amazing-feature
Open Pull Request

📄 License
This project is licensed under the MIT License.

👨‍💻 Author
Subhankar Satpathy

GitHub: @suwubh

LinkedIn: Subhankar Satpathy

Email: subhankarsatpathy69@gmail.com

⭐ Star this repository if it helped you!
