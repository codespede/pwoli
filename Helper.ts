import AWS from 'aws-sdk';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import Media from '../models/Media';
import fs from 'fs';
const fetch = require('node-fetch');
import { writeFile } from 'fs';
import { promisify } from 'util';
const writeFilePromise = promisify(writeFile);
export default class Helper{
    static parseStringKeysAsObject(object, identifier) {
        const images = [];
        let imgObj = {};
        let currentIndex = '0';
        Object.keys(object).forEach((key) => {
            const matcher = new RegExp("^" + identifier + "\..*", "g");
            if (matcher.test(key)) {
                const keySplit = key.split('.');
                if (keySplit[1] !== currentIndex) {
                    images.push(imgObj);
                    imgObj = {};
                    currentIndex = keySplit[1];
                }
                imgObj[keySplit[2]] = object[key];
            }
        });
        if(Object.keys(imgObj).length)
            images.push(imgObj);
        return images;
    }

    static uploadMediaAction() {
        return {
            actionType: 'record',
            isVisible: false,
            handler: async (request, response, context) => {
            const s3 = new AWS.S3({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });

            const resource = context.resource.SequelizeModel.name.toLowerCase();
            let fileName = request.payload.fileName;
            const extension = path.extname(fileName);
            let mediaType = 'other';
            if (['.jpg', '.jpeg', '.png', '.bmp', '.gif'].includes(extension))
                mediaType = 'image';
            else if(['.3gp', '.mp4', '.wmv', '.avi', '.mov'].includes(extension))
                mediaType = 'video';
            else if(['.zip'].includes(extension))
                mediaType = '3dvista';
            console.log('mediatype', mediaType, fileName, extension)
            const filenameWOE = fileName.split('.').slice(0, -1).join('.');
            if (typeof context.record === 'undefined') {
                context.record = { params: {} }; // { params: {} };
            }
            const itemId = (typeof context.record.params.id === 'undefined') ? `${resource}_` + Date.now() : context.record.params.id;
            fileName = `${resource}/` + itemId + '/' + `${resource}-${mediaType}` + '_' + Date.now() + extension;
            const params = {
                Bucket: process.env.S3_BUCKET,
                Key: fileName, // File name you want to save as in S3
                ContentEncoding: 'base64',
                Body: Buffer.from(request.payload.data.replace(/^data:(.*)\/\w+;base64,/, ""), 'base64')
            };
            const s3Response = new Promise((resolve, reject) => {
                s3.upload(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                    console.log(err);
                resolve(data.Location);
                // console.log(`File uploaded successfully. ${data.Location}`);
                // context.record.params.uploadedFileName = fileName;
                // context.record.params.uploadedFilePath = data.Location;
                // return context;
                });
            });
                const loc = await s3Response;
                let thumbFileName;
                let thumbUrl;
                if (mediaType === 'video') {
                    if (process.env.ENV_LOCAL !== 'true') {
                        const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
                        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
                    }
                    thumbFileName = filenameWOE + Math.floor(Math.random() * 9999) + 1 + '.png';
                    await new Promise((resolve, reject) => {
                        new ffmpeg(process.env.S3_URL + '/' + process.env.S3_BUCKET + '/' + fileName).screenshots({
                            count: 1,
                            folder: 'static/thumbnails',
                            filename: thumbFileName,
                            timemarks: ['1'] // number of seconds
                        }).on('end', () => {
                            resolve();
                        }).on('error', (err) => {
                            console.log(`[ffmpeg] error: ${err.message}`);
                            reject(err);
                        });
                    });
                    console.log('cwd', process.cwd())
                    const fileContent = fs.readFileSync('static/thumbnails/' + thumbFileName);
                    const thumbResponse = new Promise((resolve, reject) => {
                        s3.upload({
                            Bucket: process.env.S3_BUCKET,
                            Key: `${resource}/` + itemId + '/' + 'thumbnails/' + thumbFileName, // File name you want to save as in S3
                            Body: fileContent
                        }, (err, data) => {
                        if (err)
                            return reject(err);
                        resolve(data.Location);
                        });
                    });
                    thumbUrl = await thumbResponse;
                }

            context.record.params.uploadedFileName = fileName;
                context.record.params.uploadedFilePath = process.env.S3_URL + '/' + process.env.S3_BUCKET + '/' + fileName;
                const item = await Media.create({
                    type: mediaType,
                    [resource+'Id']: (typeof context.record.params.id === 'undefined') ? 0 : context.record.params.id,
                    path: `${process.env.S3_URL}/${process.env.S3_BUCKET}/${fileName}`,
                    thumbnailPath: ((mediaType === 'video')? thumbUrl : null)
                });
                context.record.params.uploadedItem = item.toJSON();
                return { record: typeof context.record.toJSON === 'undefined' ? JSON.stringify(context.record) : context.record.toJSON(context.currentAdmin) };
            },
        }
    }

    static getS3Url(filePath) {
        return process.env.S3_URL + '/' + process.env.S3_BUCKET + '/' + filePath;
    }

    static downloadFile = (url, outputPath) => {
        return fetch(url)
        .then(x => x.arrayBuffer())
        .then(x => writeFilePromise(outputPath, Buffer.from(x)));
    }

    static readdirSync = (p, a = []) => {
        if (fs.statSync(p).isDirectory())
            fs.readdirSync(p).map(f => Helper.readdirSync(a[a.push(path.join(p, f)) - 1], a))
        return a
    }
}
