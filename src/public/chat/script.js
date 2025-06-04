const socket = io('/');
const new_chat_button = document.getElementById("new-chat-button");
const message_container = document.getElementById("message-container");
const storage = window.localStorage;
const enter_button = document.getElementById("enter-button");
const message_input = document.querySelector("#info-input");
const chat_buttons = document.querySelectorAll(".chat-button");
const chat_controls = document.getElementById("chat-button-container");
const settings_button = document.getElementById("settings-button");
const settings_window = document.getElementById("settings-window");
const theme_button = document.getElementById("theme-button");
const locale_button = document.getElementById("locale-button");
const copy_button = document.querySelectorAll(".copy-button");
const pull_model_button = document.getElementById("pull-button");
const delete_model_button = document.getElementById("delete-button");
const collapse_button = document.querySelectorAll("collapse-button");
const upload_button = document.getElementById("upload-button");
const info_button = document.getElementById("info-button");
const upload_form_window = document.getElementById("upload-form-window");
const upload_form_button = document.getElementById("file-upload-submit-button")
const upload_input = document.getElementById("upload-form-input");
const inner_setting_buttons = document.querySelectorAll(".inner-settings-button");
const logout_button = document.getElementById("logout-button");


let theme, locale, current_token, msg, model, additional_info;

/**
 * Everything that executes at the load of the chat window
 */
window.onload = async function() {
    const cookies = (document.cookie);
    current_token = getCookieByName('session');
    if(current_token == null) window.location.href= window.location.href.split('/')[0] + "/login";
    console.log(current_token);
    if(cookies[1] == undefined) {
        fetch("/api/pull-theme", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
        });
        fetch("/api/pull-locale", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
        });
    }
    theme = getCookieByName("theme");
    locale = getCookieByName("locale");

    if (theme == "light") {
        document.getElementById('theme_css').href = 'style-light.css'
    } else {
        document.getElementById('theme_css').href = 'style.css'
    }

    //event for enter button
    enter_button.addEventListener('click', function() {
        sendMessage();
    })
    //event for theme button
    theme_button.addEventListener("click", (e) => {
        e.preventDefault();
        changeChatTheme();
    })
    //event for settings button
    settings_button.addEventListener("click", (e) => {
        e.preventDefault();
        showSettingsWindow();
    })
    //event for chat_buttons
    chat_buttons.forEach(function(btn) {
        btn.addEventListener('click', () => {
            console.log(btn.value);
            changeChat(btn.value);
        })
    })
    //event for new chat button
    new_chat_button.addEventListener("click", () => {
        // socket.emit("newChat")
        newChatForm();
    })
    //event for message input
    message_input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });
    //event for locale button
    locale_button.addEventListener("click", (e) => {
        e.preventDefault();
        changeLocale();
    })
    //event for upload button
    upload_button.addEventListener("click", (e) => {
        e.preventDefault();
        showUploadForm();
    })
    //event for upload input
    upload_input.addEventListener('submit', (e) => {
        e.preventDefault();
        sendFiles();
    })
    //event for logout button
    logout_button.addEventListener("click", (e) => {
        e.preventDefault();
        logOutUser();
    })
    //event for additional info button
    info_button.addEventListener("click", (e) => {
        e.preventDefault();
        showAdditionalInfo();
    })
    //event for pull model button
    pull_model_button.addEventListener("click", (e) => {
        e.preventDefault();
        pullModel();
    })
    //event for delete model button
    delete_model_button.addEventListener("click", (e) => {
        e.preventDefault();
        deleteModel();
    })
    //event for pressing escape on page
    window.onkeydown = function(gfg) {
        if (gfg.keyCode === 27){
            window.history.replaceState({page: 1}, "Chat", `/chat/${getCookieByName("session")}`);
        }
    }
}
/**
 * Function that finds cookies by their name
 * @param {string} name - name of the cookie 
 * @returns value of cookie
 */
function getCookieByName(name) {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}
/**
 * Function that loads chats
 */
async function loadChats(){
    let request_body = {
        user_token: current_token
    }
    await fetch("/api/pull-chats", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request_body)
        });
}
/**
 * Function that show additional info for response
 */
async function showAdditionalInfo(){
    const param_containers = document.querySelectorAll(".param-container");
    const params = document.querySelectorAll(".param");
    param_containers.forEach(div => {
        if(div.style.display == "none"){
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    });
    params.forEach(param => {
        if(param.style.display == "none"){
            param.style.display = "block";
        } else {
            param.style.display = "none";
        }
    })
}

/**
 * show upload form
 */
async function showUploadForm() {
    try {
        if (upload_form_window.style.maxHeight) {
            upload_input.type = "hidden"
            upload_form_window.style.maxHeight = null;
            upload_form_button.style.display = "none";
        } 
        else {
            upload_input.type = "file"
            upload_form_window.style.maxHeight = "50vh";
            upload_form_button.style.display = "block";
        } 
    } catch(e) {
        console.log(e)
    }
}
/**
 * function for sending files
 */
const sendFiles = async () => {
    const files = upload_input.files;
    const formData = new FormData();
    Object.keys(files).forEach(key => {
        formData.append(files.item(key).name, myFiles.item(key))
    })

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    })

    const json = await response.json();
    console.log(json);
}
/**
 * function for showing settings window
 */
async function showSettingsWindow() {
    try {
        if (settings_window.style.maxHeight) {
            inner_setting_buttons.forEach(button => {
                button.style.display = "none"
            });
            settings_window.style.maxHeight = null;
        } 
        else {
            inner_setting_buttons.forEach(button => {
                button.style.display = "inline-block"
            });
            settings_window.style.maxHeight = "50vh";
        } 
    } catch(e) {
        console.log(e)
    }
}
/**
 * function that logs user out
 */
async function logOutUser() {
    try {
        await fetch("/api/logout-user", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
        }).then(() => {
            window.location.href = window.location.href.split('/')[0] + "/login"
        });
    } catch (e) {
        console.log(e)
    }
}

/**
 * function that creates new chat
 */
async function newChatForm() {
    try {
        model = prompt("Insert model name")
        if (model) {
            var response;
            socket.emit("createNewChat", (current_token, model))
            newChatButton(model)
            const newChat = {
                id: current_token,
                model: model
            }
            await fetch("/api/create-chat", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newChat)
            }).then((res) => {
                window.history.replaceState({page: 2}, "Chat", res.url);
            })
            console.log(response)
        } else {
            alert("Field must not be null")
        }
    } catch(e) {
        console.log(e)
    }
}

/**
 * Function that pulls the required model
 * @param {string} model - name of the model 
 */
async function pullModel(model) {
    try {
        model = prompt("Input model to pull")
        if (model) {
            var response;
            const modelToPull = {
                model: model
            }
            await fetch("/api/pull-model", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(modelToPull)
            })
            .then(res => {
                if(!res.ok) {
                    console.log(res)
                    return;
                }
                return res.json()
            .then(data => {
                response = data.message.content;
            })
            .catch(error => console.log(error))})
            console.log(response)
        }
    } catch(e) {
        console.log(e)
    }
}
/**
 * Function that deletes model
 * @param {string} model 
 */
async function deleteModel(model) {
    try {
        model = prompt("Input model to delete")
        if (model) {
            var response;
            const modelToDelete = {
                model: model
            }
            await fetch("/api/delete-model", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(modelToDelete)
            })
            .then(res => {
                if(!res.ok) {
                    console.log(res)
                    return;
                }
                return res.json()
            .then(data => {
                response = data.message.content;
            })
            .catch(error => console.log(error))})
            console.log(response)
        }
    } catch(e) {
        console.log(e)
    }
}

/**
 * function that gets all available models
 */
async function getModels() {
    try {
        fetch("get-models")
    } catch(e) {
        console.log(e)
    }
}

/**
 * function that changes the current chat
 */
async function changeChat() {

}
/**
 * Function that gets current chats messages
 */
async function getMessages() {

}

/**
 * Function that adds new chat button to the list
 * @param {string} model - name of the model 
 */
async function newChatButton(model) {
    const new_chat_button = document.createElement("button");
    new_chat_button.className = "chat-button light-grey-universal"
    new_chat_button.textContent = model
    new_chat_button.type = "button"
    new_chat_button.value = model
    chat_controls.appendChild(new_chat_button)
}

/**
 * Function that changes current theme
 */
async function changeChatTheme() {
    try {
        if (theme == "light") {
            theme = "dark"
            document.getElementById('theme_css').href = 'style.css'
        } else {
            theme = "light"
            document.getElementById('theme_css').href = 'style-light.css'
        }
        const UITheme = {
            theme: theme
        }
        fetch("/change-theme", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(UITheme)
        })
        console.log(theme)
    } catch (e) {
        console.log(e)
    }
}
/**
 * Function that changes current locale
 */
async function changeLocale() {
    try {
        if (locale == "ru") {
            locale = "en"
            message_input.placeholder="Write your message"
            new_chat_button.textContent = "New Chat"
            settings_button.textContent = "Settings"
            theme_button.textContent = "Theme"
            locale_button.textContent = "Language"
            info_button.textContent = "Info"
            pull_model_button.textContent = "Pull Model"
            delete_model_button.textContent = "Delete Model"
            logout_button.textContent = "End Session"
        } else {
            locale = "ru"
            message_input.placeholder="Напишите ваше сообщение"
            new_chat_button.textContent = "Новый чат"
            settings_button.textContent = "Настройки"
            theme_button.textContent = "Смена темы"
            locale_button.textContent = "Смена языка"
            info_button.textContent = "Инфо"
            pull_model_button.textContent = "Скачать модель"
            delete_model_button.textContent = "Удалить модель"
            logout_button.textContent = "Выйти"
        }
        const UILocale = {
            locale: locale
        }
        fetch("/change-locale", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(UILocale)
            })
        console.log(locale)
    } catch(e) {
        console.log(e)
    }
}

/**
 * Function that sends user message to the model
 */
async function sendMessage() {
    try {
        if (message_input.value.length !== 0){
            const user_message_container = document.createElement("div")
            user_message_container.className = "message user-message"
            const userMessageContent = document.createElement("span")
            userMessageContent.className = "user-message-content"
            userMessageContent.textContent = message_input.value
                
            user_message_container.appendChild(userMessageContent)
            message_container.appendChild(user_message_container)
            socket.emit("message", message_input.value, model)
            message_input.value = "";

            const model_response_container = document.createElement("div")
            model_response_container.class = "message model-response"
            model_response_container.id = "answer-wait"
            const model_response_content = document.createElement("span")
            if (locale == "ru") { model_response_content.textContent = "Генерация..." }
            else {model_response_content.textContent = "Generation..."}
            model_response_container.appendChild(model_response_content)
            message_container.appendChild(model_response_container)
            message_container.scrollTop = message_container.scrollHeight;
        }
    } catch(e) {
        console.log(e)
    }
}

//socket event that creates new chat room
socket.on("createChatRoom", (modelName) => {
    newChatButton()
})
/**
 * Start of the model response
 */
socket.on("responseStart", async(modelName, uuid) => {
    try {
        const model_response_container = document.createElement("div")
        model_response_container.className = "message model-response"
        model_response_container.id = `container-${uuid}`
        const modelNamePara = document.createElement("p")
        modelNamePara.textContent = modelName
        model_response_container.appendChild(modelNamePara)
        const model_response_content = document.createElement("span")
        model_response_content.id = `response-${uuid}`;
        message_container.removeChild(message_container.lastChild);
        model_response_container.appendChild(model_response_content)
        message_container.appendChild(model_response_container)
    } catch(e) {
        console.log(e)
    }
})
/**
 * Middle of the model response
 */
socket.on("responseMiddle", async(modelResponse, uuid) => {
    try {
        const model_response_content = document.getElementById(`response-${uuid}`)
        model_response_content.innerHTML = modelResponse;
        model_response_content.children[0].innerHTML = model_response_content.children[0].innerHTML.substring(9)
        message_container.scrollTop = message_container.scrollHeight;
    } catch (e) {
        console.log(e)
    }
})

/**
 * End of the model response
 */
socket.on("responseEnd", async(end_info, uuid) => {
    try {
        const model_response_content = document.getElementById(`response-${uuid}`);
        const model_response_container = document.getElementById(`container-${uuid}`);
        const modelResponsecopy_button = document.createElement("button");
        const param_container = document.createElement("div");
        param_container.className = "param-container";
        for (const [key, value] of Object.entries(end_info)) {
            const param = document.createElement("span");
            param.className = "param";
            param.name = key;
            param.textContent = `${key}: ${value}`
            param_container.appendChild(param);
            model_response_container.appendChild(param_container);
        }
        modelResponsecopy_button.id = `copy-${uuid}`
        modelResponsecopy_button.className = 'copy-button light-grey-universal'
        if (locale == "ru") {
            modelResponsecopy_button.textContent = "Копировать"
        } else {
            modelResponsecopy_button.textContent = "Copy"
        }
        message_container.appendChild(modelResponsecopy_button)
        modelResponsecopy_button.addEventListener("click", (e) => {
            e.preventDefault();
            var messageId = modelResponsecopy_button.id.replace("copy ", "");
            console.log(messageId);
            navigator.clipboard.writeText(model_response_content.innerText);
        })
        message_container.scrollTop = message_container.scrollHeight;
        console.log(end_info);
    } catch (e) {
        console.log(e)
    }
})

window.onbeforeunload = function () {
    //socket.emit("unloadModel", model)
}