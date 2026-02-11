const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'taskpulse.db');
const db = new Database(dbPath, { readonly: true });

console.log('=== USERS ===');
const users = db.prepare('SELECT id, username, full_name, team_id, is_team_admin FROM users').all();
users.forEach(u => {
  console.log(`ID: ${u.id}, Username: "${u.username}", Team ID: ${u.team_id}, Admin: ${u.is_team_admin}`);
});

console.log('\n=== TEAMS ===');
const teams = db.prepare('SELECT id, name, created_by FROM teams').all();
teams.forEach(t => {
  console.log(`ID: ${t.id}, Name: "${t.name}", Created by: ${t.created_by}`);
});

console.log('\n=== PROJECTS ===');
const projects = db.prepare('SELECT id, name, team_id, owner_id, created_by FROM projects').all();
projects.forEach(p => {
  console.log(`ID: ${p.id}, Name: "${p.name}", Team ID: ${p.team_id}, Owner: ${p.owner_id}, Created by: ${p.created_by}`);
});

console.log('\n=== TASKS ===');
const tasks = db.prepare('SELECT id, title, project_id, team_id FROM tasks LIMIT 10').all();
tasks.forEach(t => {
  console.log(`ID: ${t.id}, Title: "${t.title}", Project ID: ${t.project_id}, Team ID: ${t.team_id}`);
});

db.close();