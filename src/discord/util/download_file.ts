import axios from 'axios';
import fs from 'fs';
import path from 'path';
import config from '../../../config';
import { spawn } from 'child_process';
import { get_extension, unique_filename } from '../../middleware/form_parser';
import { categorize } from '../../middleware/format_img';
import { basename } from 'discord.js';

const format_names: any = {
    'gif': 'gif',
    'jpg': 'jpeg',
    'jpeg': 'jpeg',
    'png': 'png',
    'ogg': 'ogg',
    'ogv': 'ogg',
    'webm': 'matroska,webm',
    'mp3': 'mp3',
    'flac': 'flac',
    'mp4': 'mp4',
    'flv': 'flv',
    'webp': 'webp',
    'mov': 'mov'
};

// download the file from discord to upload to our server because we like to store things :)
const download_file = async (url: string): Promise<string> => {
    const output_dir = path.join(__dirname, '../../../../public/tmp/uploads');
    const filename = unique_filename(basename(url));
    const file_path = path.join(output_dir, filename);
    const writer = fs.createWriteStream(file_path);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        return new Promise<string>((resolve, reject) => {
            writer.on('finish', () => resolve(file_path));
            writer.on('error', (err) => reject(new Error(`Failed to write file: ${err.message}`)));
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Failed to download file: ${error.message}`);
        } else if (error instanceof Error) {
            throw new Error(`Failed to download file: ${error.message}`);
        } else {
            throw new Error('Failed to download file: Unknown error');
        }
    }
};

const orient_image = async (file_path: string): Promise<void> => {
    try {
        const extension = get_extension(file_path);
        if (extension === '.jpg' || extension === '.jpeg') {
            return new Promise<void>((resolve, reject) => {
                const process = spawn("mogrify", ['-auto-orient', file_path]);

                process.on("close", (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`mogrify process exited with code ${code}`));
                    }
                });

                process.on("error", (err) => reject(new Error(`Failed to start mogrify process: ${err.message}`)));
            });
        } else {
            return Promise.resolve();
        }
    } catch (err) {
        console.error(`orient_image_err:\n${err}`);
        return Promise.reject(err);
    }
};



export const format_img = async (file_path: string): Promise<{ metadata?: any; error?: string }> => {
    const extension = get_extension(file_path);
    let command: string;
    let args: string[];

    try {
        const category = categorize(file_path);

        if (category === 'image') {
            command = 'ffprobe';
            args = ['-print_format', 'json', '-show_format', '-show_streams', '-show_frames', file_path];
        } else if (category === 'video' || category === 'audio') {
            command = 'ffprobe';
            args = ['-print_format', 'json', '-show_format', '-show_streams', file_path];
        } else {
            return { error: 'unsupported_file_extension' };
        }

        // Execute ffprobe command to get metadata
        let stdout = "";
        let stderr = "";
        const process = spawn(command, args);

        process.stdout.on('data', (data) => { stdout += data; });
        process.stderr.on('data', (data) => { stderr += data; });

        return new Promise<{ metadata?: any; error?: string }>((resolve) => {
            process.on('close', (code) => {
                if (code !== 0) {
                    console.log('Metadata command returned error', code, command, stderr);
                    resolve({ error: 'corrupt_file' });
                    return;
                }

                let metadata: any;
                try {
                    metadata = JSON.parse(stdout);
                } catch (e) {
                    console.log('Command returned unparseable metadata', command, args, stderr, JSON.stringify(stdout));
                    resolve({ error: 'unparsable_metadata' });
                    return;
                }

                if (category === 'image') {
                    if (!metadata.format || !metadata.streams) {
                        console.log('ffprobe output missing format/streams info');
                        resolve({ error: 'ffprobe_err' });
                        return;
                    }
                    if (!metadata.streams[0].codec_name.includes(format_names[extension])) {
                        console.log('Image file content does not match extension');
                        resolve({ error: 'extension_content_mismatch' });
                        return;
                    }

                    const image_metadata = {
                        image_width: metadata.streams[0].width,
                        image_height: metadata.streams[0].height,
                        image_transparent: true,
                        duration: metadata.frames.length > 1 ? metadata.frames.reduce((acc: number, x: any) => acc + parseFloat(x.pkt_duration_time), 0) : undefined
                    };

                    resolve({ metadata: image_metadata });
                } else if (category === 'video' || category === 'audio') {
                    if (!metadata.format || !metadata.streams) {
                        console.log('ffprobe output missing format/streams info');
                        resolve({ error: 'missing_format_info' });
                        return;
                    }
                    if (!metadata.format.format_name.includes(format_names[extension])) {
                        console.log('Video file content does not match extension');
                        resolve({ error: 'extension_content_mismatch' });
                        return;
                    }

                    for (const stream of metadata.streams) {
                        const codec_type: 'video' | 'audio' = stream.codec_type;
                        const codec_names = config.codec_names[codec_type];
                        if (codec_names && !codec_names.includes(stream.codec_name)) {
                            console.log('Unrecognized codec', stream.codec_name);
                            resolve({ error: 'unrecognized_codec' });
                            return;
                        }
                    }

                    const video_metadata: any = {};
                    if (metadata.format.duration !== undefined) {
                        try {
                            video_metadata.duration = parseFloat(metadata.format.duration);
                        } catch (e) {
                            console.log('ffprobe returned invalid duration data', stderr);
                            resolve({ error: 'invalid_duration_data' });
                            return;
                        }
                    }

                    const video_stream = metadata.streams.find((stream: any) => stream.codec_type === 'video');
                    if (video_stream && video_stream.width && video_stream.height) {
                        video_metadata.image_width = video_stream.width;
                        video_metadata.image_height = video_stream.height;

                        if (video_stream.sample_aspect_ratio) {
                            try {
                                const [num, denom] = video_stream.sample_aspect_ratio.split(':').map(Number);
                                if (num) video_metadata.image_width = Math.round(video_metadata.image_width * num / denom);
                            } catch (e) {
                                console.log('Error parsing SAR from ffprobe', stderr);
                                resolve({ error: 'SAR_parsing_error' });
                                return;
                            }
                        }
                        resolve({ metadata: video_metadata });
                    } else {
                        console.log('ffprobe could not find video stream', stderr);
                        resolve({ error: 'no_video_data' });
                    }
                } else {
                    resolve({ metadata: {} }); // Placeholder for audio support
                }
            });
        });
    } catch (e) {
        console.log('Failed to spawn metadata process', e);
        return { error: 'server_error' };
    }
};

const generate_thumbnail = async (metadata: any, file_path: string): Promise<void> => {
    // Calculate width and height for thumbnail
    const scale = Math.min(250 / metadata.image_width, 100 / metadata.image_height, 1);
    const thumb_width = Math.round(scale * metadata.image_width);
    const thumb_height = Math.round(scale * metadata.image_height);

    // Determine thumbnail path and extension
    const thumb_extension = metadata.image_transparent ? 'png' : 'jpg';
    const file_name = basename(file_path).replace(/\.[^/.]+$/, "")
    const output_dir = path.join(__dirname, '../../../../public/tmp/thumb', `${file_name}.${thumb_extension}`)
    // console.log(path.dirname(metadata.image))
    // const thumbPath = path.join(path.dirname(metadata.image), `thumbnail_${path.basename(metadata.image, path.extname(metadata.image))}.${thumb_extension}`);

    // Prepare command to generate thumbnail
    const command = 'ffmpeg';
    const args = [
        '-i', file_path,
        '-y', // Overwrite output files
        '-s', `${thumb_width}x${thumb_height}`, // Set the scale
        '-vframes', '1', // Output only one frame
        '-f', 'image2', // Specify the output format
        '-c:v', thumb_extension === 'png' ? 'png' : 'mjpeg', // Set the codec
        output_dir
    ];

    return new Promise<void>((resolve, reject) => {
        try {
            // Execute the command
            let stderr = '';
            const process = spawn(command, args);

            process.stderr.on('data', (data) => {
                stderr += data;
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    console.error('Thumbnail command returned error', code, command, stderr);
                    reject(new Error('Thumbnail generation failed'));
                    return;
                }
                resolve();
            });

        } catch (e) {
            console.error('Failed to spawn thumbnail process', e);
            reject(new Error('Thumbnail process error'));
        }
    });
};

export const process_file = async (url: string): Promise<{ img_metadata: any; file_path: string }> => {
    try {
        const file_path = await download_file(url);
        await orient_image(file_path);
        var meta = await format_img(file_path);
        await generate_thumbnail(meta.metadata, file_path);
        const image_data = {
            img_metadata: meta.metadata,
            file_path: file_path
        }
        return image_data

    } catch (error) {
        console.error(`Error processing file: ${error}`);
        throw error;
    }
};