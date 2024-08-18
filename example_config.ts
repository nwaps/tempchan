/*                              CONFIG.TS
  Acts as a local configuration file, providing an object which contains the
  various configuration variables used throughout the backend server. FOR
  CHANGES IN THIS FILE TO TAKE EFFECT, THE SERVER MUST BE RESTARTED.
*/

export default {
    PORT: 3000,
    DB_HOST: 'localhost',
    DB_ADDR: 'tempchan_db',
    // Cooldown between posts (in milliseconds)
    POST_COOLDOWN: 3000,
    // File size limit (in bytes)
    FILESIZE_LIMIT: 1048576 * 6,

    // List of boards supported by the server. Add or remove board names
    // to change the number of boards supported.
    boards: [ 'int', 'g' ],

    // Supported file types
    image_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    video_formats: ['ogv', 'webm', 'mp4'],
    audio_formats: ['ogg', 'mp3', 'flac'],
};