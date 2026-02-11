# ⚡ TaskPulse

**A modern, feature-rich task management application with Kanban boards, AI-powered insights, and progressive web app support.**

![TaskPulse](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)


---

## 🌟 What is TaskPulse?

TaskPulse is a Project Management system for Humans and their AI assistents. It combines the simplicity of a Kanban board with powerful features like AI-powered task suggestions, mobile-first design, and offline support.
It solves the problem that tasks are not being done because it needs its human to provide feedback. With TaskPulse the AI can maintain Projects, Tasks that belong to that Project and Subtask that contain Multiple Choice Questions or Open Questions.  Tasks and Subtasks can be assigned to the Human so they know their feedback is required.

**Built with:** React, Node.js, Express, and SQLite  
**Perfect for:** Development teams, project managers, freelancers, and anyone who needs to organize their work efficiently.

---

## ✨ Key Features

### 🆕 New in v2.0

#### 🤖 **AI Assistant Integration**
- **API Skill File** - AI assistants can download `GET /api/skill.md` to learn TaskPulse API
- **Smart Task Creation** - AI can create projects, tasks, and subtasks programmatically
- **Automated Workflows** - Bots handle routine task management operations
- **Decision Support** - Subtasks capture AI-driven decisions (multiple choice or open questions)
- **File Reference Tracking** - Track emailed and on-disk files for AI workflows

#### 👥 **Team-Based System**
- **Team Isolation** - Each team has its own projects and tasks
- **Team Admin** - Admin users can manage team members
- **Join Requests** - Request to join teams with approval workflow
- **Data Migration** - Seamless migration from personal to team-based work

#### 🔐 **Bot API & Permissions**
- **Bot Creation** - Create API bots with custom permissions
- **Granular Permissions** - Fine-tuned access control (read, create, update, delete)
- **Token Authentication** - Secure API tokens for programmatic access
- **Bot Management** - CLI tools for bot lifecycle management
- **Activity Tracking** - Track bot actions in activity log

### 📋 Visual Task Management
- **Kanban Board** - Drag and drop tasks between columns (To Do, In Progress, Done)
- **Task Cards** - Rich cards with priority badges, due dates, and assignees
- **Subtasks** - Break down complex tasks into manageable pieces
  - **Multiple Choice** - Select from predefined options (great for decisions)
  - **Open Answer** - Provide free-text responses (great for feedback)
  - **File Tracking** - Track emailed files and on-disk references
- **Priority Levels** - Low, Medium, High, and Critical with color coding
- **Task Assignment** - Assign tasks to team members for collaboration

### 🤖 AI-Powered Insights
- **Smart Suggestions** - AI-powered task recommendations based on your workflow
- **Automated Assignments** - Intelligent task assignment suggestions
- **Priority Recommendations** - AI helps you prioritize your workload
- **API-Ready** - Complete API for AI assistant integration

### 📱 Mobile-First Design
- **Responsive UI** - Works perfectly on desktop, tablet, and mobile
- **Touch Gestures** - Swipe to move tasks, tap to edit
- **PWA Support** - Install as a mobile app (iOS, Android, Desktop)
- **Offline Mode** - Continue working without internet connection

### 🔒 Security & Authentication
- **User Accounts** - Secure session-based authentication
- **Bot API** - Create API bots with granular permissions
- **Token-Based Auth** - For programmatic access and integrations
- **Permission System** - Fine-grained access control
- **Whitelisted Bot Access** - When hosted online, restrict API access to specific IPs for known bots while allowing human users from anywhere

### 🚀 Developer-Friendly
- **REST API** - Full API for integrations and automation
- **Bot SDKs** - Easy bot creation for CI/CD workflows
- **Webhooks Ready** - Architecture supports webhook integrations
- **Comprehensive Docs** - API reference, admin guide, and quick start

### 🎯 Productivity Boosters
- **Due Dates** - Never miss a deadline with visual indicators
- **Task Assignments** - Delegate work to team members
- **Completion Tracking** - Automatic timestamps when tasks are completed
- **Productivity Metrics** - Track tasks completed per day/week/month
- **Real-time Updates** - Instant synchronization across devices
- **Search & Filter** - Find tasks quickly

---

## 💡 Why Use TaskPulse?

### For Teams
- **Collaboration Made Easy** - Assign tasks, track progress, and coordinate work
- **Transparent Workflow** - See everyone's tasks in one place
- **AI Assistance** - Let AI help prioritize and distribute work
- **Bot Automation** - Integrate with CI/CD pipelines and tools
- **Secure Bot Integration** - Whitelist known bot IPs for API access while allowing human users from anywhere

### For Individuals
- **Simple Yet Powerful** - Get started in minutes, scale as needed
- **Mobile Productivity** - Manage tasks on the go with PWA
- **Offline Support** - Never lose access to your tasks
- **Focus Mode** - Clean, distraction-free interface

### For Developers
- **Self-Hosted** - Full control over your data
- **Open Source** - Free to use, modify, and distribute
- **API-First** - Build custom integrations easily
- **Modern Stack** - Built with industry-standard technologies

### Compared to Alternatives

| Feature | TaskPulse | Trello | Jira | Asana |
|----------|-----------|--------|-------|-------|
| Self-Hosted | ✅ Free | ❌ No | ✅ Paid | ❌ No |
| AI Features | ✅ Built-in | ❌ No | ✅ Paid | ✅ Paid |
| Mobile PWA | ✅ Native-feel | ✅ Good | ✅ Good | ✅ Good |
| Bot API | ✅ Included | ❌ Limited | ✅ Paid | ❌ No |
| Offline Mode | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Free Forever | ✅ Yes | ❌ Limited | ❌ No | ❌ No |
| Open Source | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

## 📸 Screenshots

### Login Screen
<img src="https://github.com/najef1979-code/TaskPulse/blob/main/TaskPulse-Login.png?raw=true" alt="TaskPulse Login Screen" width="800"/>

*Clean, modern login interface with optional registration link*

### Dashboard - Kanban Board
<img src="https://github.com/najef1979-code/TaskPulse/blob/main/TaskPulse-DashBoard.png?raw=true" alt="TaskPulse Dashboard" width="800"/>

*Full-featured Kanban board with drag-and-drop task management, priority badges, and project navigation*

### My Assignments View
<img src="https://github.com/najef1979-code/TaskPulse/blob/main/TaskPulse-MyAssingments.png?raw=true" alt="TaskPulse My Assignments" width="800"/>

*Dedicated view for tracking assigned tasks with status indicators and quick actions*

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16.0 or higher (v18+ recommended)
- **npm** v8.0 or higher
- **curl** (for API testing)
- **jq** (optional, for JSON parsing)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/najef1979-code/TaskPulse.git
cd taskpulse
```

#### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Initialize database
node init-db.js

# Configure environment
cp .env.example .env
# Edit .env with your settings (default values work for development)
```

#### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (default values work for development)
```

#### 4. Start TaskPulse

**Method 1: Using the Runner Script (Recommended)**

```bash
cd ..  # Back to project root
./taskpulse-runner.sh
```

**Method 2: Manual Startup**

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd ../client
npm run dev
```

#### 5. Access TaskPulse

- **Web UI:** Open http://localhost:3050 in your browser
- **API:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

---

## 📖 Usage Guide

### First Steps

1. **Create an Account**
   - Click "Register" in the top right corner
   - Enter your username, email, and password
   - Click "Register"

2. **Create Your First Project**
   - Click "+ New Project" button
   - Enter project name and description
   - Click "Create Project"

3. **Add Tasks**
   - Click "+ Add Task" or double-click anywhere on the board
   - Fill in task details (title, description, priority, due date)
   - Click "Create Task"

4. **Manage Tasks**
   - **Drag and Drop** - Move tasks between columns
   - **Click to Edit** - Modify task details
   - **Right-click** - Quick actions (start, complete, delete)

### Advanced Features

- **Subtasks** - Click a task, then add subtasks in the details modal
- **Assignments** - Type a username to assign tasks to team members
- **Due Dates** - Click the date picker to set deadlines
- **Priorities** - Choose from Low, Medium, High, or Critical
- **Mobile App** - Install TaskPulse as a PWA on your phone

### Creating API Bots

```bash
cd server
node user-cli.js
# Select option 2 (Create new bot)
```

Use bots for:
- CI/CD integrations
- Automated task creation
- Custom workflows
- Third-party tool integrations

---

## 🔧 Configuration

### Environment Variables

#### Backend (`server/.env`)

```env
# Database
DB_PATH=./taskpulse.db

# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Configuration (Optional)
AI_ENABLED=true
AI_API_KEY=your-openai-api-key
AI_MODEL=gpt-4
```

#### Frontend (`client/.env`)

```env
# API URL
VITE_API_URL=http://localhost:3000/api

# Application
VITE_APP_NAME=TaskPulse
NODE_ENV=development
```

### Port Configuration

- **Backend API:** Default 3000 (change in `server/.env`)
- **Frontend:** Default 3050 (change in `client/vite.config.js`)

### Database

TaskPulse uses SQLite by default for simplicity. The database file is created automatically at `server/taskpulse.db`.

**To use PostgreSQL or MySQL:**
1. Install the appropriate driver (`pg` or `mysql2`)
2. Modify `server/lib/database.js` to use your preferred database
3. Update connection string in `.env`

---

## 📚 Documentation

### User Documentation
- 📖 **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide for end users
- 📜 **[USER_GUIDE.md](USER_GUIDE.md)** - Main documentation index for users

### Developer Documentation
- 🤖 **[AI_MANUAL.md](AI_MANUAL.md)** - Complete API reference (CLI and REST) for AI assistants and bot developers
  - Includes CLI commands and examples
  - Full REST API documentation
  - Authentication guide
  - Testing examples

### Administrator Documentation
- 🛠️ **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Complete setup, deployment, and management guide
  - System prerequisites and installation
  - Configuration and running TaskPulse
  - Team system management
  - User and bot management
  - Database management
  - Production deployment
  - Monitoring and maintenance
  - Troubleshooting guides
- 📝 **[SCRIPTS.md](SCRIPTS.md)** - Quick reference for management scripts

### Additional Documentation
- 📝 **[SUBTASK_TYPES_AND_FILES.md](SUBTASK_TYPES_AND_FILES.md)** - Subtask types and file tracking documentation

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues

1. Check existing [GitHub Issues](https://github.com/najef1979-code/TaskPulse/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/taskpulse.git
cd taskpulse

# Install dependencies
cd server && npm install
cd ../client && npm install

# Run tests
cd server && npm test
cd ../client && npm test

# Start development servers
cd ..
./taskpulse-runner.sh --no-test
```

---

## 🧪 Testing

### Run All Tests

```bash
# Using the runner script
./taskpulse-runner.sh

# Tests include:
# - Health checks
# - Create project
# - Create task
# - Start task
# - Complete task
# - Delete task
# - Delete project
```

### Run Integration Tests Only

```bash
# Servers must be running
./taskpulse-runner.sh --test-only
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3000/health

# List projects (with bot token)
curl http://localhost:3000/api/projects \
  -H "x-api-token: bot_YOUR_TOKEN"

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "x-api-token: bot_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":1,"title":"Test Task"}'
```

---

## 🚢 Deployment

### Production Deployment

1. **Set Environment Variables**
   ```bash
   # server/.env
   NODE_ENV=production
   JWT_SECRET=<secure-random-string>
   
   # client/.env
   VITE_API_URL=https://yourdomain.com/api
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   # Output in client/dist/
   ```

3. **Deploy with PM2**
   ```bash
   pm2 start server/server.js --name "taskpulse-backend"
   pm2 start "cd client && npm run dev" --name "taskpulse-frontend"
   ```

4. **Set Up Reverse Proxy (Nginx)**
   - Configure Nginx to proxy to ports 3000 and 3050
   - Set up SSL/TLS with Let's Encrypt
   - See [ADMIN_GUIDE.md](ADMIN_GUIDE.md#deployment) for details

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔒 Security

### Security Best Practices

1. **Change JWT Secret** - Generate a secure random string for production
   ```bash
   openssl rand -base64 32
   ```

2. **Use HTTPS** - Always use SSL/TLS in production
3. **Limit Bot Permissions** - Give bots only the permissions they need
4. **Regular Updates** - Keep dependencies up to date
5. **Database Backups** - Automate regular backups
6. **Monitor Logs** - Watch for suspicious activity

### Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Secure session cookies (httpOnly, secure, sameSite)
- ✅ Granular bot permissions
- ✅ Whitelisted bot access (restrict API to known IPs)
- ✅ Flexible human access (users can access from anywhere)
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📊 Performance

### Performance Targets

| Metric | Target | Status |
|---------|--------|---------|
| First Contentful Paint (FCP) | < 1.5s | ✅ Met |
| Largest Contentful Paint (LCP) | < 2.5s | ✅ Met |
| Time to Interactive (TTI) | < 3.5s | ✅ Met |
| Cumulative Layout Shift (CLS) | < 0.1 | ✅ Met |
| API Response Time (p95) | < 500ms | ✅ Met |

### Optimization Features

- Lazy loading for images
- Debounced API calls
- Virtual scrolling for large lists
- Response caching
- Performance monitoring built-in

---

## 🛣️ Roadmap

### Upcoming Features

- [ ] **Webhooks** - Event-driven integrations
- [ ] **Real-time Collaboration** - WebSocket support
- [ ] **Advanced Analytics** - Charts and reports
- [ ] **Time Tracking** - Track time spent on tasks
- [ ] **File Attachments** - Upload files to tasks
- [ ] **Comments** - Discussion threads on tasks
- [ ] **Tags/Labels** - Better categorization
- [ ] **Dark Mode** - Theme switching
- [ ] **Email Notifications** - Stay updated via email
- [ ] **Multi-Language Support** - i18n

### Long-term Vision

- [ ] **Mobile Apps** - Native iOS and Android apps
- [ ] **Team Workspaces** - Multi-tenant support
- [ ] **Calendar View** - Alternative task visualization
- [ ] **Gantt Charts** - Project timeline view
- [ ] **Plugin System** - Extensible architecture

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 TaskPulse Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Backend powered by [Express.js](https://expressjs.com/)
- Database: [SQLite](https://www.sqlite.org/)
- Icons: [Lucide](https://lucide.dev/)
- UI inspired by modern design systems

---

## 📞 Support

- **Documentation:** [USER_GUIDE.md](USER_GUIDE.md)
- **Issues:** [GitHub Issues](https://github.com/najef1979-code/TaskPulse/issues)
- **Discussions:** [GitHub Discussions](https://github.com/najef1979-code/TaskPulse/discussions)
- **Email:** support@taskpulse.dev (if available)

---

## ⭐ Star History

If you find TaskPulse helpful, please consider giving us a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=najef1979-code/TaskPulse&type=Date)](https://star-history.com/#najef1979-code/TaskPulse&Date)

---

<div align="center">

**Built with ❤️ by the TaskPulse Team**

[⬆ Back to Top](#-taskpulse)

</div>