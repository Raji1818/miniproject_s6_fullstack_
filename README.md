# 🎓 Student Development App — MERN Stack

## MongoDB Atlas Setup (Step by Step)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up / Log in
3. Create a **Free Tier** cluster (M0)

### Step 2: Configure Atlas
1. **Database Access** → Add a new user with username + password
2. **Network Access** → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. **Clusters** → Click "Connect" → "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_dev_app?retryWrites=true&w=majority
   ```

### Step 3: Configure .env
Edit `server/.env` and replace with your real values:
```env
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/student_dev_app?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
```

---

## Project Structure

```
Mini/
├── server/                  # Express + Node.js backend
│   ├── config/
│   │   └── db.js            # MongoDB Atlas connection
│   ├── middleware/
│   │   └── auth.js          # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Skill.js
│   │   └── Progress.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── skills.js
│   │   ├── progress.js
│   │   └── admin.js
│   ├── .env                 # ← PUT YOUR MONGO_URI HERE
│   └── server.js
│
└── client/                  # React frontend
    └── src/
        ├── api/axios.js     # Axios instance with JWT interceptor
        ├── context/AuthContext.js
        ├── components/Navbar.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Courses.js
            ├── Skills.js
            ├── Resume.js
            └── Admin.js
```

---

## Run Instructions

### Terminal 1 — Backend
```bash
cd server
# Edit .env with your MongoDB Atlas URI first!
npm run dev
```
Expected output:
```
MongoDB Atlas Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

### Terminal 2 — Frontend
```bash
cd client
npm start
```
Opens at http://localhost:3000

---

## API Endpoints

| Method | Endpoint                  | Auth     | Description          |
|--------|---------------------------|----------|----------------------|
| POST   | /api/auth/register        | Public   | Register user        |
| POST   | /api/auth/login           | Public   | Login user           |
| GET    | /api/courses              | JWT      | Get all courses      |
| POST   | /api/courses              | Admin    | Create course        |
| PUT    | /api/courses/:id          | Admin    | Update course        |
| DELETE | /api/courses/:id          | Admin    | Delete course        |
| GET    | /api/skills               | JWT      | Get my skills        |
| POST   | /api/skills               | JWT      | Add skill            |
| PUT    | /api/skills/:id           | JWT      | Update skill         |
| DELETE | /api/skills/:id           | JWT      | Delete skill         |
| GET    | /api/progress             | JWT      | Get my progress      |
| POST   | /api/progress             | JWT      | Enroll in course     |
| PUT    | /api/progress/:id         | JWT      | Update status        |
| GET    | /api/admin/users          | Admin    | List all users       |
| DELETE | /api/admin/users/:id      | Admin    | Delete user          |
| PUT    | /api/admin/users/:id/role | Admin    | Change user role     |

---

## Features
- JWT Authentication (register/login/logout)
- Role-based access (student / admin)
- Course Management with enrollment
- Skill Tracker with proficiency levels
- Resume Builder (auto-populated from skills + completed courses)
- Admin Panel (manage users, change roles, delete users)
- JWT stored in localStorage, sent via Axios interceptor
