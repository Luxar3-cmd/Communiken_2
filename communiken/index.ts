import { PrismaClient } from "@prisma/client";
import { Elysia, t } from 'elysia'

//Inicializa Elysia
const prisma = new PrismaClient({
    log: ['info','warn','error']
});


const app = new Elysia()
    .decorate('db', prisma);


//Registrar endpoint
app.post('/api/registrar', async({db , body}: { db:PrismaClient; body: any }) => {
    try {
        const {nombre, correo, clave, descripcion} = body;

        //Validación de los datos
        if(!nombre || !correo || !clave) {
            return{ estado:400, mensaje: 'Faltan campos obligatorios'}
        }

        //Crear un nuevo usuario en la base de datos
        const usuario = await db.usuario.create({
            data: { nombre, correo, clave, descripcion }
        });

        //Responder con éxito
        return {estado: 200, mensaje: 'Usuario resgistrado correctamente',usuario};
    } catch (error) {
        //Manejo de error
        return { estado: 400, mensaje: 'Error al registrar el usuario', error: (error as Error).message};
    }
});

//Endpoint para para obtener la información del correo
app.get('/api/informacion/:correo', async ({ db, params }: { db: PrismaClient; params: { correo: string } }) => {
    try {
        const usuario = await db.usuario.findUnique({
            where: { correo: params.correo },
            select: { nombre: true, correo: true, descripcion: true }
        });

        if (usuario) {
            return {
                estado: 200,
                nombre: usuario.nombre,
                correo: usuario.correo,
                descripcion: usuario.descripcion
            };
        } else {
            return { estado: 400, mensaje: 'Usuario no encontrado' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Error al obtener información del usuario', error: (error as Error).message };
    }
});

//Endpoint para bloquear
app.post('/api/bloquear', async ({ db, body }: { db: PrismaClient; body: any }) => {
    try {
        const { correo, clave, correo_bloquear } = body;

        // Validación simple de los datos recibidos
        if (!correo || !clave || !correo_bloquear) {
            return { estado: 400, mensaje: 'Faltan campos obligatorios' };
        }

        // Encontrar al usuario que quiere bloquear a otro usuario
        const usuario = await db.usuario.findUnique({ where: { correo } });

        // Validar que el usuario exista y que la clave sea correcta
        if (usuario && usuario.clave === clave) {
            // Verificar si el correo a bloquear existe en la base de datos
            const usuarioABloquear = await db.usuario.findUnique({ where: { correo: correo_bloquear } });

            if (usuarioABloquear) {
                // Agregar la dirección bloqueada
                await db.direccionBloqueada.create({
                    data: {
                        usuario_id: usuario.id,
                        direccion_bloqueada: correo_bloquear
                    }
                });
                return { estado: 200, mensaje: 'Dirección bloqueada correctamente' };
            } else {
                return { estado: 400, mensaje: 'El correo a bloquear no existe' };
            }
        } else {
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Error al bloquear dirección', error: (error as Error).message };
    }
});

//Endpoint para marcar un correo como favorito
app.post('/api/marcarcorreo', async ({ db, body}: {db: PrismaClient; body: any}) => {
    try {
        const {correo,clave,id_correo_favorito} = body;             

        //Validación simple de los datos recibidos
        if( !correo || !clave || !id_correo_favorito) {
            return {estado: 400, mensaje: 'Faltan campos obligatorios'};
        }
        
        //Encontrar al usuario que quiere marcar un correo como favorito
        const usuario = await db.usuario.findUnique({ where: {correo}});

        //Validar que el usuario exista y que la clave sea correcta
        if(usuario && usuario.clave === clave) {
            //Verificar si el ID del correo favorito existe en la base de datos
            const usuarioFavorito = await db.usuario.findUnique({where: { id: id_correo_favorito}});

            if(usuarioFavorito) {
                // Agregar la dirección favorita
                await db.direccionFavorita.create({
                    data: {
                        usuario_id: usuario.id,
                        direccion_favorita: usuarioFavorito.correo
                    }
                });
                return {estado: 200, mensaje: 'Correo marcado como favorito correctamente'};
            } else {
                return {estado: 400, mensaje: 'El ID del correo favorito no existe'};
            }
        } else {
            return {estado: 400, mensaje: 'Credenciales incorrectas'};
        }
    } catch (error) {
        return {estado: 400, mensaje: 'Error al marcar correo como favorito', error: (error as Error).message};
    }
});

//Endpoint para demarcar un correo como favorito
app.delete('/api/desmarcarcorreo', async ({ db, body }: { db: PrismaClient; body: any }) => {
    try {
        const { correo, clave, id_correo_favorito } = body;

        // Validación simple de los datos recibidos
        if (!correo || !clave || !id_correo_favorito) {
            return { estado: 400, mensaje: 'Faltan campos obligatorios' };
        }

        // Encontrar al usuario que quiere desmarcar un correo como favorito
        const usuario = await db.usuario.findUnique({ where: { correo } });

        // Validar que el usuario exista y que la clave sea correcta
        if (usuario && usuario.clave === clave) {
            // Verificar si el ID del correo favorito existe en la base de datos y pertenece al usuario
            const direccionFavorita = await db.direccionFavorita.findFirst({
                where: {
                    usuario_id: usuario.id,
                    id: id_correo_favorito
                }
            });

            if (direccionFavorita) {
                // Eliminar la dirección favorita
                await db.direccionFavorita.delete({
                    where: {
                        id: direccionFavorita.id
                    }
                });
                return { estado: 200, mensaje: 'Correo desmarcado como favorito correctamente' };
            } else {
                return { estado: 400, mensaje: 'El ID del correo favorito no existe o no pertenece al usuario' };
            }
        } else {
            return { estado: 400, mensaje: 'Credenciales incorrectas' };
        }
    } catch (error) {
        // Manejo de errores
        return { estado: 400, mensaje: 'Error al desmarcar correo como favorito', error: (error as Error).message };
    }
});



app.listen(8000);
console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);