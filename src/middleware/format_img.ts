/*                               FORMAT_IMG.TS
  Middleware responsible for determining the media format and metadata using
  ffmpeg, and using this metadata to enforce metadata rules such as allowing
  onlysupported codecs.
*/

import { spawn } from 'child_process';
import { NextFunction, Request, Response } from 'express';
import { chat_res } from '../models/chat_response';
import config from '../../config';
import { get_extension } from './form_parser';


// format names returned by identify/ffprobe
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

export default (req: Request, res: Response, next: NextFunction) => {
    const err_response: chat_res = {
        message: '',
        data: null,
    }
    const file_path = req.body.data.image;
    if (!file_path) {
        return next();
    }
    
    let command: string = '';
    let args: string[] = [];
    const extension = get_extension(file_path);
    try {
        // Determine if file is an image/video/audio file
        var category = categorize(file_path);

        console.log('file extension is <' + extension + '>');
        console.log('file category is <' + category + '>');

        // Prepare command to read metadata
        if (category === 'image') {
            command = 'ffprobe';
            args = '-print_format json -show_format -show_streams -show_frames'.split(' ');
            args.push(file_path);
        } else if (category === 'video' || category === 'audio') {
            command = 'ffprobe';
            args = '-print_format json -show_format -show_streams'.split(' ');
            args.push(file_path);
        } else {
            err_response.message = 'unsupported_file_extension'
            return res.status(400).json(err_response);
        }
    } catch(e) {
        console.log('error in metadata reading code', e);
        err_response.message = 'server_metadata_reading_error';
        return res.status(500).json(err_response);
    }

    try {
        // execute ffmpeg command to get image/video/audio metadata
        let stdout = "";
        let stderr = "";
        const format_name = format_names[extension];
        const process = spawn(command, args);
        process.stdout.on("error", function(e) {console.log("Error in format-image: ",e);}).on("data", function(data) {stdout += data;});
        process.stderr.on("error", function(e) {console.log(e);}).on("data", function(data) {stderr += data;});
        process.on("close", function(code) {
            if (code !== 0) {
                console.log('metadata command returned error', code, command, stderr);
                err_response.message = 'corrupt_file';
                return res.status(400).json(err_response);
            }

            let metadata: any = {};
            try {
                metadata = JSON.parse(stdout);
            } catch(e) {
                console.log('command returned unparseable metadata', command, args, stderr, JSON.stringify(stdout));
                err_response.message = 'unparsable_metadata';
                return res.status(500).json(err_response);
            }

            if (category === 'image') {
                // check container format and stream codecs
                if (metadata.format === undefined || metadata.streams === undefined) {
                    console.log('ffprobe output missing format/streams info');
                    err_response.message = 'ffprobe_err';
                    return res.status(500).json(err_response);
                }
                // Ensure image is of a valid codec
                if (metadata.streams[0].codec_name.indexOf(format_name) == -1) {
                    console.log(metadata.streams[0].codec_name);
                    console.log(extension);
                    console.log('image file content does not match extension');
                    err_response.message = 'extension_content_mismatch'
                    return res.status(400).json(err_response);
                }

                req.body.data.image_width = metadata.streams[0].width;
                req.body.data.image_height = metadata.streams[0].height;
		        req.body.data.image_transparent = true;

                if (metadata.frames.length > 1) {
                    req.body.data.duration = 0;
                    metadata.frames.forEach((x:any) => {
                        req.body.data.duration += parseFloat(x.pkt_duration_time);
                    });
                }

                return next();
            } else if (category === 'video' || category === 'audio') {
                if (category === 'video') {
                    // check container format and stream codecs
                    if (metadata.format === undefined || metadata.streams === undefined) {
                        console.log('ffprobe output missing format/streams info');
                        err_response.message = 'missing_format_info';
                        return res.status(500).json(err_response);
                    }
                    // Ensure video is of proper format
                    if (metadata.format.format_name.indexOf(format_name) == -1) {
                        console.log(metadata.format.format_name);
                        console.log(extension);
                        console.log('video file content does not match extension');
                        err_response.message = 'extension_content_mismatch'
                        return res.status(400).json(err_response);
                    }
                    // Ensure video uses the proper codecs
                    for (var i in metadata.streams) {
                        const codec_type: ('video' | 'audio') = metadata.streams[i].codec_type;
                        var codec_names = config.codec_names[codec_type];
                        if (codec_names !== undefined && codec_names.indexOf(metadata.streams[i].codec_name) < 0) {
                            console.log('unrecognized codec', metadata.streams[i].codec_name);
                            err_response.message = 'unrecognized_codec';
                            return res.status(400).json(err_response);
                        }
                    }

                    // get file duration, if given
                    if (metadata.format.duration !== undefined) {
                        try {
                            req.body.data.duration = parseFloat(metadata.format.duration);
                        } catch(e) {
                            console.log('ffprobe returned invalid duration data', stderr);
                            err_response.message = 'invalid_duration_data';
                            return res.status(400).json(err_response);
                        }
                    }

                    // find video stream, if any
                    var video_stream = null;
                    for (var i in metadata.streams) {
                        if (metadata.streams[i].codec_type === "video") {
                            video_stream = metadata.streams[i];
                            break;
                        }
                    }

                    if (video_stream !== null && video_stream.width && video_stream.height) {
                        // get video dimensions
                        req.body.data.image_width = video_stream.width;
                        req.body.data.image_height = video_stream.height;

                        // compensate for sample aspect ratio
                        if (video_stream.sample_aspect_ratio !== undefined) {
                            try {
                                var parts = video_stream.sample_aspect_ratio.split(':');
                                if(parseInt(parts[0])) req.body.data.image_width = Math.round(req.body.data.image_width * parseInt(parts[0]) / parseInt(parts[1]));
                            } catch(e) {
                                console.log('error parsing SAR from ffprobe', stderr);
                                err_response.message = 'SAR_parsing_error';
                                return res.status(500).json(err_response);
                            }
                        }
                        return next();
                    } else {
                        console.log('ffprobe could not find video stream', stderr);
                        err_response.message = 'no_video_data';
                        return res.status(400).json(err_response);
                    }
                } else {
                    // TODO Add audio support
                    return next();
                }
            }
        });
    } catch(e) {
        console.log('failed to spawn metadata process', e);
        err_response.message = 'server_error';
        return res.status(500).json(err_response);
    }
};

export const categorize = (filename: string) => {
    const extension = get_extension(filename);
    if (config.image_formats.indexOf(extension) > -1) return 'image';
    if (config.video_formats.indexOf(extension) > -1) return 'video';
    if (config.audio_formats.indexOf(extension) > -1) return 'audio';
    return 'invalid';
};