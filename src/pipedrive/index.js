"use strict";

const request = require("../request");
const Utils = require("../utils");
const URL = {
  PERSON_FIELDS: "https://api.pipedrive.com/v1/personFields?api_token=",
  PERSONS: "https://api.pipedrive.com/api/v1/persons/",
  ME: "https://api.pipedrive.com/v1/users/me?api_token=",
};

/**
 * Class for all api of pipedrive
 */
class PipeDrive {
  /**
   * Get my information
   * @param {string} token api token
   * @return my customer information
   */
  static getMyInfo(token) {
    return request(URL.ME + token);
  }
  /**
   *
   * @param {number} id
   * @param {string} field
   * @param {string} text
   */
  static updatePerson(id, token, field, fieldValue) {
    return new Promise(async (resolve, reject) => {
      const data = {};
      data[field] = fieldValue;
      request(URL.PERSONS + id + "?api_token=" + token, "PUT", data)
        .then((r) => {
          resolve(r.data);
          console.log("after update", r.data);
        })
        .catch((r) => reject(r));
    });
  }
  static updateEmail(id, token, mail, status) {
    return new Promise(async (resolve, reject) => {
      const email = {};
      const data = {};

      // zerobounce return invalid add "invalid" to email address.
      if(status == 'invalid')
        email["value"] = mail.value + "(" + status + ")";
      else
        email["value"] = mail.value;
      email["label"] = mail.label;
      email['color'] = 'red';

      console.log("email data", email);
      console.log("json request:", [email]);
      const headers = [
        ["Content-Type", "application/json"],
        ["Accept", "application/json"],
      ];

      request(
        URL.PERSONS + id + "?api_token=" + token,
        "PUT",
        { email: [email] },
        // sample request
        // {
        //   email: [
        //     {
        //       value: "kurt@jones.net.au(valid)",
        //       label: "work",
        //       color: "red",
        //     },
        //   ],
        // },

        headers
      )
        .then((r) => {
          resolve(r.data);
          console.log("after update", r.data);
        })
        .catch((r) => reject(r));

      // request(URL.PERSONS + id + "?api_token=" + token, "PUT", {
      //   body: JSON.stringify({'email':[email]})
      // }
      // )
      //   .then((r) => {
      //     resolve(r.data);
      //     console.log("after update", r.data);
      //   })
      //   .catch((r) => reject(r));
    });
  }
  static getPersonById(id, token) {
    return new Promise(async (resolve, reject) => {
      request(URL.PERSONS + id + "?api_token=" + token)
        .then((r) => {
          resolve(r.data);
        })
        .catch((r) => reject(r));
    });
  }

  /**
   * @summary get filed of person
   * @param {string} token
   */
  static personField(token) {
    return new Promise(async (resolve, reject) => {
      try {
        function search(fields) {
          try {
            if (fields) {
              for (const field of fields) {
                console.log("field name", field);
                if (field.name == "Email Validation") return field;
              }
            }
          } catch (e) {
            Utils.print.error("Error in PipeDrive:personFiled.", e);
          }
          return null;
        }

        // try to request with "GET" method
        // const retGet = request(URL.PERSON_FIELDS + token)
        // .then((r) => {
        //     resolve(r.data);
        // })
        // .catch((r) => reject(r));

        const retGet = await request(URL.PERSON_FIELDS + token);
        console.log("person custom filters", retGet);
        const evField = search(retGet.data);
        if (!evField) {
          //try to request with "POST"
          const retPost = request(URL.PERSON_FIELDS + token, "POST", {
            name: "Email Validation",
            field_type: "text",
          });
          resolve(retPost.data);
          console.log("no exist.", retPost.data);
        } else {
          console.log("exist", evField);
          resolve(evField);
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
module.exports = PipeDrive;
