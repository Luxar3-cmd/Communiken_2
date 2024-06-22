import { PrismaClient } from "@prisma/client";
import { Elysia, t } from 'elysia'

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .listen(8000)

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)