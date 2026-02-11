# TaskPulse Documentation

Please use to following guides:

## 📚 Documentation Index

### For Everyone
**[README.md](README.md)** - Project overview, features, and installation
- What is TaskPulse and why use it
- Key features overview (Kanban, AI, mobile, security)
- Comparison with alternatives
- Quick start installation guide
- Roadmap and contributing guidelines

### For AI Assistants
**[AI_MANUAL.md](AI_MANUAL.md)** - Complete API reference for AI assistants
- API endpoints (authentication, projects, tasks, subtasks, bots)
- Bot creation and token management
- Testing examples (curl, Python, Node.js)
- Error handling and best practices
- How to start TaskPulse if not accessible

### For End Users (New to TaskPulse)
**[QUICKSTART.md](QUICKSTART.md)** - Quick start guide for web UI users
- How to access TaskPulse
- Creating your account
- First login walkthrough
- Creating your first project and task
- Understanding the Kanban board
- Using subtasks, priorities, and due dates
- Mobile app features and installation
- Common issues and tips

### For Administrators & Developers
**[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Complete setup and deployment guide
- System prerequisites
- Installation (backend, frontend, database)
- Configuration (ports, environment, database)
- Running TaskPulse (scripts, PM2, Docker)
- User and bot management
- Testing (health checks, integration tests, load testing)
- Deployment (production setup, Nginx, SSL)
- Performance monitoring (built-in, external tools)
- Backup and maintenance (database, logs)
- Troubleshooting (server, database, API)

---

## Quick Reference

| Who Are You? | Read This Guide |
|---------------|-----------------|
| AI Assistant / Bot Developer | [AI_MANUAL.md](AI_MANUAL.md) |
| New End User | [QUICKSTART.md](QUICKSTART.md) |
| Administrator / Developer | [ADMIN_GUIDE.md](ADMIN_GUIDE.md) |
| Power User / Need All Info | [Admin Guide](ADMIN_GUIDE.md) + [Quick Start](QUICKSTART.md) |

### 🔒 Key Security Feature

**Whitelisted Bot Access:** When TaskPulse is hosted online, the API can be configured to only allow connections from whitelisted IP addresses for known bots, while human users can access the interface from anywhere. This provides:
- Secure bot integration - Only known, trusted bots can access the API
- Flexible human access - Team members can work from any location
- Fine-grained control - Different security policies for bots vs humans

---

## Getting Started

### 1. Access TaskPulse

Open your web browser and navigate to:

```
http://localhost:3050
```

### 2. Choose Your Guide

- **AI Assistant?** Read [AI_MANUAL.md](AI_MANUAL.md) for API documentation
- **New to TaskPulse?** Read [QUICKSTART.md](QUICKSTART.md) for quick start
- **Setting up or deploying?** Read [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for admin guide

---

## Quick Links

- 🤖 **Web UI:** http://localhost:3050
- 🔌 **API:** http://localhost:3000/api
- 📊 **API Docs:** http://localhost:3000/api
- 💚 **Health Check:** http://localhost:3000/health
- 🛠️ **Status Check:** `./status.sh` (from project root)



**TaskPulse Version:** 2.0.0  
**Last Updated:** 2026-02-11
