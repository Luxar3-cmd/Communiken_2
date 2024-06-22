import { PrismaClient } from "@prisma/client";
import { Elysia, t } from 'elysia'


const db = new PrismaClient();


const app = new Elysia()
    .post( 
        '/sign-up', 
        async ({ body }) => db.user.create({ 
            data: body 
        }) 
    ) 
    .listen(3000)
console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)






const prisma = new PrismaClient()

//Crear un nuevo usuario
await prisma.user.create({
    data: {
        name: "John Dough",
        email: `john-${Math.random()}@example.com`,
    },
});

const count = await prisma.user.count();
console.log(`There are ${count} users in the database.`);