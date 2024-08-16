import prompt from "prompt-sync";
import chalk from "chalk";
import path from "path";
import { userInfo } from "os";
import { existsSync, symlinkSync, writeFileSync } from "fs";

const input = prompt();

const serviceRegex = /^[a-zA-Z0-9_-]+$/;
let serviceName: string = path.basename(process.cwd());

serviceName = input(`Enter service name ${chalk.grey(`(${serviceName})`)}: `, {
  value: serviceName
});

if(!serviceRegex.test(serviceName)) {
  console.log(chalk.red(`Invalid service name: ${serviceName}`));
  process.exit(1);
}

let startCommand: string = `${process.argv0} start`;

startCommand = input(`Enter start command ${chalk.grey(`(${startCommand})`)}: `, {
  value: startCommand
});

let workingDirectory: string = process.cwd();

workingDirectory = input(`Enter working directory ${chalk.grey(`(${workingDirectory})`)}: `, {
  value: workingDirectory
});

if(!existsSync(workingDirectory)) {
  console.log(chalk.red(`Invalid working directory: ${workingDirectory}`));
  process.exit(1);
}

let runAsUser: string = userInfo().username;

runAsUser = input(`Enter user to run service as ${chalk.grey(`(${runAsUser})`)}: `, {
  value: runAsUser
});

const serviceContent = `
[Unit]
Description=${serviceName}
After=network.target

[Service]
Type=simple
User=${runAsUser}
ExecStart=${startCommand}
WorkingDirectory=${workingDirectory}
Restart=on-failure

[Install]
WantedBy=multi-user.target
`;

const servicePath = path.join(process.cwd(), `${serviceName}.service`)
writeFileSync(servicePath, serviceContent);
symlinkSync(servicePath, path.join("/lib/systemd/system", `${serviceName}.service`), "file");

console.log(chalk.green(`Service ${serviceName} installed successfully.\n`));
console.log(chalk.grey(`To enable the service, run the following command:`));
console.log(chalk.whiteBright(`sudo systemctl enable ${serviceName}\n`));
console.log(chalk.grey(`To start the service, run the following command:`));
console.log(chalk.whiteBright(`sudo systemctl start ${serviceName}\n`));