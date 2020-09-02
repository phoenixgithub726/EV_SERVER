"use strict";

const Stripe = require("../stripe");
const Utils = require("../utils");
const request = require("../request");
const { Socket } = require("dgram");
/**
 * @summary                 Event Listener for 'paymentSuccess' message
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
let users = {};

// old base64
// const pipedriveAuthHeader = [
//   [
//     "Authorization",
//     "Basic YmEwZjQ2YjczZGMwNWM1MTpjOWY5YWQ0MWI5YmYyYmY5MDQxZTlmMDkyNGJmNTM2OGJkNzk4ZmFk",
//   ],
// ];
const pipedriveAuthHeader = [
  [
    "Authorization",
    "Basic NjdjNzA5N2RiMWMzMzRhZDphOGRmYzc0ZWVhYjdlNzYzNWJmZjYxNWRkYTkyZTVmNjViZDFiMTMw",
  ],
];
module.exports = async function (socket, message) {
  try {
    console.log("oauth socket",socket)
    console.log("oauth message", message);
    users[socket.id] = {};
    let type = message.type,
      tabId = message.tabId || 0,
      params = message.data.params;
    oauth(socket, {
      type,
      id: socket.id,
      data: params,
      //     token:
      //       type == "introduction"
      //         ? { refresh_token: params.token }
      //         : users[socket.id].token,
      //     user_id: users[socket.id].id,
      //   },
      //   (d, params) => {
      //     console.log("sending data to user", d, params);
      //     let result = { type, data: d, tabId };
      //     for (key in params) {
      //       if (key == "emailToId") {
      //         emailToId[params[key]] = socket.id;
      //       } else if (key == "token") {
      //         users[socket.id].token = params[key];
      //       } else if (key == "id") {
      //         users[socket.id].id = params[key];
      //       } else {
      //         result[key] = params[key];
      //       }
      //     }
      //     console.log("data in oauth", result);
      //     //   socket.emit('update', result)
      //   }
    });
  } catch (e2) {
    Utils.socket.sendError(socket, e2);
  }
};

function oauth(socket, params, callBack) {
  console.log("oauth data", params);
  request(
    "https://oauth.pipedrive.com/oauth/token",
    "POST",
    {
      grant_type: "authorization_code",
      code: params.data,
      // redirect_uri: "https://mail.google.com/",
      redirect_uri: "https://server.certalink.com",
    },
    pipedriveAuthHeader
  )
    .then((r) => {
      let token = JSON.parse(r);
      console.log("oauth token", token);
      params.token = token;
      getUserInfo(socket, token);
      //   introduction(params, callBack);
    })
    .catch((e) => {
      console.log('request error', e)
      Utils.socket.sendError(socket, e);
    //   e = JSON.parse(e);
    //   callBack({ error: e.error }, { type: "login" });
    });
}
function getUserInfo(socket, params) {
  console.log("getUser in Params", params);
  const token_header = [["Authorization", "Bearer " + params.access_token]];
  console.log("token_header", "GET", token_header);
  request("https://api.pipedrive.com/v1/users/me", "GET",{}, token_header)
    .then((r) => {
    //   resolve(r);
    Utils.socket.sendData(socket, "loggedin", { auth: r.data, access_token: params.access_token });
    console.log("user info", r);
    })
    .catch((e) => {
      Utils.socket.sendData(socket, "error", { error:e });
      // // console.log(e)
      //   e = JSON.parse(e);
      console.error("eror", e);
    });
}
