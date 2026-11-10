import { createInterface } from "readline";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let input = "";
    const onData = (char: string) => {
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(input);
          break;
        case "\u0003": // Ctrl+C
          process.exit(1);
          break;
        case "\u007f": // backspace
          input = input.slice(0, -1);
          break;
        default:
          input += char;
          break;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const username = (await ask("Admin username [admin]: ")) || "admin";

  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin) {
    console.error(`No admin user found with username "${username}".`);
    process.exit(1);
  }

  const password = await askHidden("New password: ");
  const confirm = await askHidden("Confirm new password: ");

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  if (password !== confirm) {
    console.error("Passwords do not match.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.adminUser.update({
    where: { username },
    data: { password: hashed },
  });

  console.log(`Password updated for "${username}".`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
