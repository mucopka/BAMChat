const sqlite3 = require("sqlite3").verbose()
const {v4: uuidv4 } = require("uuid");

// DATABASE CREATION
// Connection to the database
const db = new sqlite3.Database('./resources/database/database.db');

initializeDatabase()
/**
 * Function that initializes database
 */
function initializeDatabase () {
    try {
        //Query for users table
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, login VARCHAR(255) UNIQUE, password VARCHAR(255), token VARCHAR(255) UNIQUE);`);
        //Query for chats table
        db.run(`CREATE TABLE IF NOT EXISTS chats (id INTEGER PRIMARY KEY AUTOINCREMENT, model_id INTEGER UNSIGNED REFERENCES models(id), params VARCHAR(255), user_id INTEGER REFERENCES users(id), token VARCHAR(255) UNIQUE)`);
        //Query for models table
        db.run(`CREATE TABLE IF NOT EXISTS models (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), size FLOAT)`)
        console.log(`connected to the database`);
    } catch (e) {
        console.log(e)
    }
};

//<-------- Users -------->

/**
 * Creates user in the database
 * @param {string} login - login of the user
 * @param {string} password - password of the user
 */
async function registerUser(login, password) {
    let token = uuidv4();
    await db.run(`INSERT INTO users (login, password, token) VALUES (?, ?, ?)`, [login, password, token], (err) => {
        if (!err) {
            return token;
        } else {
            return null;
        }
    })
}

/**
 * Function that is loging user
 * @param {string} login - login of the user
 * @param {string} password - password of the user
 */
const loginUser = async(login, password) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE login = ? AND password = ?`, [login, password], (e, row) => {
                if (e) reject(e);
                resolve(row);
            });
          });
    } catch (e) {
        console.log(e)
        return null;
    }
}

/**
 * Returns the id of the user
 * @param {number} token - User uuid token
 * @returns {number} id of the user
 */
const getUserId = async(token) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id FROM users where token = ?`, (token), (e, row) => {
                if (e) reject(e);
                resolve(row);
            });
          });
    } catch (e) {
        console.log(e)
    }
}
/**
 * Returns object with user information
 * @param {number} user_id - id of the user
 * @returns {Object} - Object with all of the user information
 */
const getUser = async(user_id) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users where token = ?`, (user_id), (e, row) => {
                if (e) reject(e);
                resolve(row);
            });
          });
    } catch (e) {
        console.log(e)
    }
}
/**
 * Returns array with all users
 * @returns {Array[Object]} - array of objects with user information
 */
const getAllUsers = async() => {
    try {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM users`, (user_id) ,(e, rows) => {
              if (e) reject(e);
              resolve(rows[0]);
            });
        });
    } catch (e) {
        console.log(e)
    }
}

async function deleteUser(user_id) {
    try {
        db.run(`DELETE FROM users WHERE id = ?`, [user_id])
    } catch (e) {
        console.log(e)
    }
}

//blockUser

//<-------- Chats -------->

/**
 * Creates new chat
 * @param {string} user_token - token of the user
 * @param {string} model - AI model
 */
async function createChat(user_token, model) {
    try {
        let uid = uuidv4()
        let user_id = await getUserId(user_token)
        await db.run(`INSERT INTO chats (user_id, model_id, token) VALUES (?,?,?)`, [user_id, model, uid])
        return uid;
    } catch(e) {
        console.log(e)
    }
}

/**
 * Returns user chats
 * @param {string} token - token of the user
 * @returns {Array[Object]} - array with users chats
 */
const getUserChats = async (token) => {
    try {
        userId =  getUserId(token)
        console.log(user_id)
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM chats where user_id = ?`, (user_id) ,(e, rows) => {
              if (e) reject(e);
              resolve(rows);
            });
          });
    } catch (e) {
        console.log(e)
    }
}

/**
 * Returns all chats
 * @returns {Array[Object]} - Array with all chats
 */
const getAllChats = async () => {
    try {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM users`, (e, rows) => {
              if (e) reject(e);
              resolve(rows);
            });
          });
    } catch (e) {
        console.log(e)
    }
};
/**
 * Function that sets params of the chat
 * @param {number} chat_id - id of the chat
 * @param {string} params - parameters of the model 
 */
async function setChatParams(chat_id, params) {
    try {
        await db.run(`UPDATE chats SET params = ? WHERE id = ?`, [params, chat_id])
    } catch (e) {
        console.log(e)
    }
}

/**
 * Deletes chat
 * @param {number} chat_id - id of chat 
 */
async function deleteChat (chat_id) {
    try {
        db.run(`DELETE FROM chats WHERE id = ?`, [chat_id])
    } catch (e) {
        console.log(e)
    }
}

//<-------- Models -------->

/**
 * Creates model in the database
 * @param {string} model_name name of the model
 */
async function addModel(model_name) {
    try {
        db.run(`INSERT INTO models (name) VALUES (?)`, [model_name])
    } catch (e) {
        console.log(e)
    }
}

/**
 * Returns model 
 * @param {number} model_id - id of the model 
 * @returns {Object} - object with all model information
 */
const getModelById = async(model_id) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM models where id = ?`, (model_id), (e, row) => {
                if (e) reject(e);
                resolve(row);
            });
          });
    } catch (e) {
        console.log(e)
    }
}

/**
 * Returns model 
 * @param {number} model_id - id of the model 
 * @returns {Object} - object with all model information 
 */
const getModelByName = async(model_name) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM models where name = ?`, (model_name), (e, row) => {
                if (e) reject(e);
                resolve(row);
            });
          });
    } catch (e) {
        console.log(e)
    }
}
/**
 * Returns model id
 * @param {number} model_id - id of the model 
 * @returns {number} - model id
 */
const getModelId = async(model_id) => {
    try {
        return new Promise((resolve, reject) => {
            db.get(`SELECT id FROM models where id = ?`, (model_id), (e, row) => {
                if (e) reject(e);
                resolve(row);
            });
          });
    } catch (e) {
        console.log(e)
    }
}

/**
 * Returns array with model objects
 * @returns {Array[Object]} - array with models
 */
const getAllModels = async() => {
    try {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM models`, (e, rows) => {
              if (e) reject(e);
              resolve(rows);
            });
          });
    } catch (e) {
        console.log(e)
    }
}
/**
 * Deletes model by id
 * @param {number} model_id - id of a model 
 */
async function deleteModelById (model_id) {
    try {
        db.run(`DELETE FROM models WHERE id = ?`, [model_id])
    } catch (e) {
        console.log(e)
    }
}
/**
 * Deletes model by name
 * @param {string} model_name - name of the model
 */
async function deleteModelByName (model_name) {
    try {
        db.run(`DELETE FROM models WHERE name = ?`, [model_name])
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
    //Users
    registerUser,
    loginUser,
    getUser,
    getAllUsers,
    getUserId,
    deleteUser,
    //Chats
    createChat,
    getUserChats,
    getAllChats,
    setChatParams,
    deleteChat,
    //Models
    addModel,
    getModelById,
    getModelByName,
    getModelId,
    getAllModels,
    deleteModelById,
    deleteModelByName
}