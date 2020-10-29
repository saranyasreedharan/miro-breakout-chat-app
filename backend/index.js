var express = require('express')
var app = express()
var cors = require('cors')
var http = require('http').Server(app)
var socketConfig = require('./config')
var io = require('socket.io')(http, socketConfig)
var port = process.env.PORT || 8081
const database = require('./wrapper/mysql')
const connection = database.connection
const { createRoom, updateRoom, createAuthor, getRoomById, getAuthorByName, createMessage, getMessageByRoom} = require('./service')
var rooms = {}
var roomsCreatedAt = new WeakMap()
var names = new WeakMap()
var roomId
var name
var messages

app.use(cors())

app.get('/rooms/:roomId', (req, res) => {
	const {roomId} = req.params
	const room = rooms[roomId]

	if (room) {
		res.json({
			createdAt: roomsCreatedAt.get(room),
			users: Object.values(room).map((socket) => names.get(socket)),
		})
	} else {
		res.status(500).end()
	}
})

app.get('/rooms', (req, res) => {
	res.json(Object.keys(rooms))
})

io.on('connection', (socket) => {
	socket.on('join',  async (_roomId, _name, callback) => {
		try {
			if (!_roomId || !_name) {
				if (callback) {
					callback('roomId and name params required')
				}
				console.warn(`${socket.id} attempting to connect without roomId or name`, {roomId, name})
				return
			}

			roomId = _roomId
			name = _name

            //Checking if room and author already esist in the database
			var existingRoom = await getRoom(roomId)
			var authorAlreadyCreated = await checkAuthorAlreadyExists(name)
            var roomCreatedAt

            if (existingRoom == undefined || existingRoom.length == 0 ) {
                //If it's a new room inserting it to the database
                // roomCreatedAt is set to room created_time in the database
                console.log('Creating new room:', roomId)
                newRoom = await createRoom(connection, roomId)
                roomCreatedAt = newRoom.timeStamp
			} else {
                // If room is already available, updating status to alive
                // roomCreatedAt is set to room created_time in the database
                console.log('Updating room: ', roomId)
                roomCreatedAt = existingRoom.timeStamp
                await updateRoom(connection, roomId, true)
			}

			if (!authorAlreadyCreated) {
			    // If it's a new author inseting him/her to the database
				await createAuthor(connection, name)
			}


			if (rooms[roomId]) {
				rooms[roomId][socket.id] = socket
			} else {
				rooms[roomId] = {[socket.id]: socket}
				//Using roomCreatedAt from database instead of new Date()
				roomsCreatedAt.set(rooms[roomId], roomCreatedAt)
			}
			socket.join(roomId)

			names.set(socket, name)

            // Getting stored messages by room
            var messages = await getMessageByRoom(connection, roomId);

			io.to(roomId).emit('system message', `${name} joined ${roomId}`)
			io.to(roomId).emit('message history', messages)

			if (callback) {
				callback(null, {success: true})
			}
		} catch (error) {
			throw Error(`Error in join: ${error}`);
		}
	})

	socket.on('chat message', async (msg) => {
	    // When an author send a new text,
        // Inserting it to the database
		await createMessage(connection, roomId, name, msg)
		io.to(roomId).emit('chat message', msg, name)
	})

	socket.on('disconnect',  async () => {
		try {
		    if (io.to(roomId))
		    {
                io.to(roomId).emit('system message', `${name} left ${roomId}`)
            }

			// Check if socket connected
			if (socket) {
				delete rooms[roomId][socket.id]
			}

			// Updating room status to not alive, when disconected
			await updateRoom(connection, roomId, false)

            const room = rooms[roomId]
			if (!Object.keys(room).length) {
				delete rooms[roomId]
			}
		} catch (error) {
			throw Error(`Could not delete room: ${error}`);
		}
	})
})

/**
 * Get room by id.
 *
 * @param {roomId} The id of the room.
 * @return {room} The retrieved message.
 */
const  getRoom = async (roomId) => {
    var room

	room = await getRoomById(connection, roomId)

    console.log('Getting room: ', room)

    return room
}
/**
 * Check if author already exists.
 *
 * @param {name} The name of the author.
 * @return {true} if author already esists.
  @return {false} if author doesn't esist.
 */
const  checkAuthorAlreadyExists = async (name) => {
    var author

	author = await getAuthorByName(connection, name)

    console.log('Getting author: ', author)
    if (author == undefined || author.length == 0) {
        return false
    }

	return true
}

http.listen(port, '0.0.0.0', () => {
	console.log('listening on *:' + port)
})
