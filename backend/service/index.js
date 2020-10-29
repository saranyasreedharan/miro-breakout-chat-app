/**
 * Creates a new room.
 *
 * @param {connection} The db connection
 * @param {roomId} The id of the room.
 * @return {createdRoom} The created room.
 */
const createRoom = async (connection, roomId) => {
    var room;
    const created_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        room = await connection.query(`INSERT
                                INTO room (id, isAlive, created_time) 
                                VALUES ('${roomId}', true, '${created_time}')`)
    } catch (error) {
        throw Error(`Could not create room: ${error}`);
    }

    return room;
}

/**
 * Updates a new room.
 *
 * @param {connection} The db connection
 * @param {roomId} The id of the room.
 * @return {updatedRoom} The updated room.
 */
const updateRoom = async (connection, roomId, isAlive) => {
    var room;
    try {
        room = await connection.query(`UPDATE 
                            room SET isAlive = ${isAlive} WHERE id =  '${roomId}'`)
    } catch (error) {
        throw Error(`Could not update room: ${error}`);
    }
    return room;
}

/**
 * Gets room by ID.
 *
 * @param {connection} The db connection
 * @param {roomId} The id of the room.
 * @return {room} The retrieved room.
 */
function getRoomById(connection, roomId) {
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM room WHERE id =  ${roomId}`, function (error, results, fields) {
            if (error) reject(err);
            resolve(results);
        });

    });
}
/**
 * Creates a new author.
 *
 * @param {connection} The db connection
 * @param {name} The name of the author.
 * @return {createdAuthor} The created author.
 */
const createAuthor = async (connection, name) => {
    var author;

    try {
        message = await connection.query(`INSERT 
                                    INTO author (name) 
                                    VALUES ('${name}')`)
    } catch (error) {
        throw Error(`Could not create message: ${error}`);
    }

    return author;
}

/**
 * Gets author by name.
 *
 * @param {connection} The db connection
 * @param {name} The name of the author.
 * @return {author} The retrieved author.
 */
function getAuthorByName(connection, name){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT * FROM author WHERE name =  '${name}'`, function (error, results, fields) {
            if (error) reject(err);
            resolve(results);
        });

    });
}
/**
 * Creates a new message.
 *
 * @param {connection} The db connection
 * @param {roomId} The id of the room.
 * @param {name} The name of the author.
 * @param {text} The text message.
 * @return {createdMessage} The created message.
 */
const createMessage = async (connection, roomId, author, text) => {
    var message;
    const created_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        message = await connection.query(`INSERT 
                                        INTO message (author, text, created_time, room) 
                                        VALUES ('${author}', '${text}', '${created_time}', ${roomId})`)
    } catch (error) {
        throw Error(`Could not create message: ${error}`);
    }

    return message;
}

/**
 * Gets message by roomId.
 *
 * @param {connection} The db connection
 * @param {roomId} The id of the room.
 * @return {message} The retrieved message.
 */

function getMessageByRoom(connection, roomId){
    return new Promise((resolve, reject) => {
        connection.query(`SELECT text, author, CAST(created_time AS char) as timestamp
                        FROM message WHERE room =  ${roomId}`, function (error, results, fields) {
            if (error) reject(err);
                resolve(results);
            });

    });
}

module.exports = {
    createRoom,
    updateRoom,
    createAuthor,
    getRoomById,
    getAuthorByName,
    createMessage,
    getMessageByRoom
}