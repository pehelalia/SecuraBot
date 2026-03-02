import "dotenv/config";
import sqlite3 from 'sqlite3';
import { randomUUID } from 'crypto';

function run(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => (err ? reject(err) : resolve()));
  });
}

async function main() {
  const db = new sqlite3.Database('./dev.db');

  // users
  const adminId = randomUUID();
  const auditorId = randomUUID();
  await run(db, `
    INSERT INTO "User" (id,email,role) VALUES
      ('${adminId}', 'admin@mocksoft.com', 'ADMIN'),
      ('${auditorId}', 'audit@mocksoft.com', 'AUDITOR');
  `);

  const userIds: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const uid = randomUUID();
    userIds.push(uid);
    await run(db, `INSERT INTO "User" (id,email,role) VALUES ('${uid}', 'user${i}@mocksoft.com', 'USER');`);
  }

  const resourceNames = ['Git Repository', 'Database', 'CI/CD Pipeline', 'Admin Dashboard', 'Production Server'];
  const resourceIds: string[] = [];
  for (const name of resourceNames) {
    const rid = randomUUID();
    resourceIds.push(rid);
    await run(db, `INSERT INTO "Resource" (id,name,sensitivity) VALUES ('${rid}', '${name}', 'INTERNAL');`);
  }

  // access requests
  for (const uid of userIds) {
    const rid = resourceIds[Math.floor(Math.random() * resourceIds.length)];
    const arid = randomUUID();
    const risk = Math.floor(Math.random() * 100);
    await run(db, `INSERT INTO "AccessRequest" (id,userId,resourceId,justification,riskScore,durationHours,status) VALUES ('${arid}','${uid}','${rid}','Need access for my project tasks',${risk},24,'PENDING');`);
  }

  // audit log
  const auditId = Date.now();
  await run(db, `INSERT INTO "AuditLog" (id,actorId,action,details) VALUES (${auditId},'${adminId}','CREATE','{"note":"Initial seed"}');`);

  console.log('Seeding completed');
  db.close();
}

main().catch(console.error);

