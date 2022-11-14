export default async ctx => {
    ctx.body = {
        ...ctx.request.files,
    }
}
