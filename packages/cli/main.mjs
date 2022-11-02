#!/usr/bin/env node
import libnpmpack from 'libnpmpack'
import pacote from 'pacote'
import FormData from 'form-data'
import axios from 'axios'

const tarballPath = process.cwd()
const tarball = await libnpmpack(tarballPath)
const {_id} = await pacote.manifest(tarballPath)
if(_id == undefined) {
    throw new Error("No found name or version in package.json!")
}
const formData = new FormData();
formData.append('files', tarball, { filename: `${_id}.tgz` });

const res = await axios.post("http://localhost:3000/upload", formData, {
    headers: formData.getHeaders()
})
console.log(res.data)