/*                              CONFIG.TS
  Acts as a local configuration file, providing an object which contains the
  various configuration variables used throughout the backend server.
*/

export default {
    PORT: 3000,
    DB_HOST: 'localhost',
    DB_ADDR: 'tempchan_db',

    // List of boards supported by the server. Simply add or remove board names
    // to change the number of boards supported
    boards: [ 'int', 'g' ],
};