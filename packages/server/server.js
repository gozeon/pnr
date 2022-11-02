const Koa = require('koa');
const Router = require('@koa/router');
const server = require('koa-static')
const fs = require('fs-extra');
const path = require('path');
const { koaBody } = require('koa-body');

const uploadDir = __dirname + '/uploads'

const app = new Koa();
const router = new Router();

router
    .get('/ping', ctx => {
        ctx.body = {
            msg: 'pong'
        }
    })
    .post("/upload", async ctx => {
        ctx.body = {
            ...ctx.request.files,
        }
    })

app
    .use(async (ctx, next) => {
        try {
            await next()
        } catch (err) {
            errNo = err.statusCode || err.status || 500
            errMsg = err.message || ""

            ctx.status = 200
            ctx.body = { errNo, errMsg }
        }
    })
    .use(server("."))
    .use(koaBody({
        multipart: true,
        formidable: {
            uploadDir,
            // 调试
            keepExtensions: false,
            onFileBegin: (name, file) => {
                fs.ensureDir(uploadDir)

                if (name !== 'files') {
                    throw new Error("no found file key!")
                }

                if (file.originalFilename == undefined) {
                    throw new Error("no found filename!")
                }

                const filepath = path.join(uploadDir, file.originalFilename)
                if (fs.existsSync(filepath)) {
                    throw new Error(`${file.originalFilename} is exists!`)
                }

                file.filepath = filepath
                file.newFilename = file.originalFilename
            }
        },
        onError: (err, ctx) => {
            ctx.throw(400, `${err.message}`)
        }
    }))
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
