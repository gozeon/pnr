import path from 'node:path'
import url from 'node:url';

import compose from 'koa-compose'
import logger from 'koa-logger'
import serve from 'koa-static'
import { koaBody } from 'koa-body'
import fs from 'fs-extra'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const uploadDir = path.join(__dirname, '..', '/uploads')

const error = ops => async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        ctx.status = err.statusCode || err.status || 500
        ctx.body = err.message
    }
}

export default compose([
    error(),
    logger(),
    serve(uploadDir),
    koaBody({
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
    })
])
