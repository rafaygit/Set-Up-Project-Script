const childProcess = require('child_process');
const path = require('path');
const portCheck = require('tcp-port-used');
const fs = require('fs');

const defaultPath = path.resolve('D:/Rafay');
const url = 'https://github.com/aqkhan/tuk2-b.e.git';
const directory = 'D:/Rafay/Scripting/tuk2-b.e';

const gitClone = `git clone ${url}`;
const envFile = `${directory}/.env`;

const npmInstall = 'npm install';
const portsToCheck = [8000, 3000];
const openPorts: any = [];
const data =
  'DATABASE_URL="postgresql://postgres:123@localhost:5432/script-postgres?schema=public"';
const dockerPull = 'docker pull postgres';
const dockerRun =
  'docker run --name script-postgres -e POSTGRES_PASSWORD=123 -d -p 5432:5432 postgres';
const prismaMigrate = 'npx prisma migrate dev';

async function projectSetup() {
  try {
    childProcess.execSync(gitClone);
    console.log('Done cloning!');
  } catch (error) {
    console.error('Error occurred during cloning:', error.status);
  }

  try {
    childProcess.execSync(npmInstall, {
      cwd: directory,
    });
    console.log('Done npm install!');
    await createEnv();
    console.log('Done creating env!');
  } catch (error) {
    console.error(
      'Error occurred during npm install or environment setup:',
      error.status,
    );
  }

  try {
    await portIdentification(portsToCheck);
    console.log('Done ports identification!', openPorts);
    childProcess.execSync(dockerPull);
    console.log('Done docker pull!');
    childProcess.execSync(dockerRun);
    console.log('Done docker run!');
    childProcess.execSync(prismaMigrate, { cwd: directory });
    console.log('Done migration!');
  } catch (error) {
    console.error(
      'Error occurred during port identification, Docker setup, or migration:',
      error.status,
    );
  }
}

async function portIdentification(portsToCheck) {
  for (const port of portsToCheck) {
    let isOpen = await portCheck.check(port);
    if (!isOpen) {
      openPorts.push(port);
    }
  }
}

async function createEnv() {
  await fs.writeFileSync(envFile, data);
}

projectSetup();
