// import { PrismaClient } from "./prisma/generated/client.js";
// const prisma = new PrismaClient();

// async function main() {
// 	const user = await prisma.user.create({
// 		data: {
// 			username: "test",
// 			email: "test@gmail.com",
// 			password: "test"
// 		}
// 	});
// 	console.log(user);
// }

// app

import Router from "./modules/Router.js";
new Router().init();

// main / start

// main()
// 	.then(async () => {
// 		await prisma.$disconnect();
// 	})
// 	.catch(async (e) => {
// 		console.error(e);
// 		await prisma.$disconnect();
// 		process.exit(1);
// 	});

