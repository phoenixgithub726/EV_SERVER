"use strict";

const Stripe = require("../stripe");
const Utils = require("../utils");
const ZeroBounce = require("../zerobounce");
const PipeDrive = require("../pipedrive");
// const MailClient = require('../email')
const { throws } = require("assert");
const { socket } = require("../utils");
const { SSL_OP_EPHEMERAL_RSA, EROFS } = require("constants");
const { updateCustomer } = require("../stripe");
const fs = require("fs");
const { personField } = require("../pipedrive");
/**
 * @summary                 Event Listener for 'validate' message
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
module.exports = async function (socket, message) {
  if (!message.data) {
    Utils.socket.sendError(socket, "Invalid parameter. no data field.");
    return;
  }
  const validationCost = message.data.csv.split("\n").length - 1;
  try {
    // check credit balance of Customer.
    const current = await Stripe.getCustomerByEmail(
      // socket.SESSION_VARS["email"]
      message.data.email
    );
    console.log("current email after validate", current)
    const currentCredits = parseInt(current.metadata["Credit Balance"]);
    if (currentCredits < validationCost) {
      Utils.socket.sendError(
        socket,
        "You haven't enough balance to validate email"
      );
      return;
    }

    console.log("message  data", message.data);
    fs.writeFile("client-server.txt", message.data.csv, (err) => {
      if (err) console.log(err);
      console.log("Successfully Written to File.");
    });
    // Upload emails list to ZeroBounce
    const ret = await ZeroBounce.sendCSV(
      "Email, First Name, Last Name" + message.data.csv
    );
    const zeroBounceRet = JSON.parse(ret);
    console.log("zeroBounce_ret", zeroBounceRet);
    if (!zeroBounceRet.success) {
      Utils.socket.sendError(
        socket,
        "Failed in handling [Validation Email List].\nPlease contact to your administrator."
      );
      return;
    }
    // uploaded file id
    const fileId = zeroBounceRet.file_id;

    // update client status
    Utils.socket.sendData(socket, "update", {
      state: "validating",
      validationMessage: "Start to validate email",
    });

    // validate all
    validateEmails(socket, fileId)
      .then(async (zeroFileInfo) => {
        // get success
        const completedDateTime = zeroFileInfo.upload_date.split(" ")[0];
        const updatedCustomer = await Stripe.updateCustomer(current.id, {
          ...current.metadata,
          "Credit Balance": currentCredits - validationCost,
          "File Id": fileId,
        });
        try {
          sendStatus(socket, updatedCustomer);
          await complete(socket, message, fileId, completedDateTime);
        } catch (e) {
          Utils.print.log(e);
          Utils.socket.sendError(socket, "Error in completing validation.");
        }
      })
      .catch((err) => {
        Utils.print.log("Validation ==> " + err);
        Utils.socket.sendError(socket, err);
      });
  } catch (e) {
    Utils.print.error(e);
  }
};

/**
 * @summary        validate email, send the status
 * @param {socket} socket client connection socket
 * @param {number} fileId file id of zerobounce
 */
function validateEmails(socket, fileId) {
  return new Promise(async (resolve, reject) => {
    // let timeout = 10000; // set timeout as 100 times
    let timeout = 1;
    while (timeout > 0) {
      // timeout--;
      timeout++
      try {
        const fileInfo = JSON.parse(await ZeroBounce.getStatus(fileId));
        if (!fileInfo.success) {
          reject(
            "Error in validating emails!\nPlease contact to your administrator."
          );
          return;
        }
        console.log("validating file info", fileInfo)
        if (fileInfo.file_status === "Complete") {
          resolve(fileInfo);
          return;
        }

        // update client's status
        console.log("validating file info percent", fileInfo, timeout)
        Utils.socket.sendData(socket, "update", {
          state: "validating", validateProcessing :{
            status: fileInfo.file_status,
            percent : fileInfo.complete_percentage
          }
          
        });
        await Utils.time.sleep(1000);
      } catch (e) {
        reject(
          "Error in validating emails!\nPlease contact to your administrator."
        );
        return;
      }
    }
    reject("Timeout to validate emails!");
  });
}
/**
 *
 * @param {*} socket client socket
 * @param {*} message client message
 * @param {*} fileId zerobounce file id
 * @param {*} scanDate
 * @param {*} fileContent
 */
function complete(socket, message, fileId, scanDate) {
  return new Promise(async (resolve, reject) => {
    try {
      let f = await ZeroBounce.getFile(fileId);
      f = f.replace(/ZB /g, "");
      Utils.socket.sendData(socket, "file", f);
     

      // const token = socket.SESSION_VARS["api_token"];
      const token = 'cc638af3ea2783059aae7e32b5b80e34c1f0d1f4'
      const parsed = Utils.csv.parse(f);
      const fields = {};
      const email_status = {};
      let percent = 0;
      for (let userId in message.data.idToEmail) {
        
        console.log("updateing processing", percent)
        Utils.socket.sendData(socket, "update", {
          state: "validating", updateProcessing :{
            percent : Math.floor(percent/message.data.scanned_persons * 100)
          }
          
        });
        percent ++;
        let finalText = "";
        for (const email of message.data.idToEmail[userId]) {
          let mail_value = ''
          if(email.indexOf('(')>0)
             mail_value = email.substr(0, email.indexOf('('))
          else
             mail_value = email;
          console.log("parsed status email ", mail_value)
          if(parsed[mail_value].Status)
            finalText += `${scanDate} - ${mail_value} - ${parsed[mail_value].Status}`;
          if (parsed[mail_value]["Sub Status"]) {
            finalText += ` (${parsed[mail_value]["Sub Status"]})`;
          }
          finalText += "\n";
          fields[userId] = finalText;
          // email_status[userId] = parsed[email].Status;
          email_status[userId] = parsed[mail_value].Status;


          // console.log("fields", fields)
        }
      }

      // Add Email Status to Email address
      let ids = Object.keys(message.data.idToEmail);
      if (ids.length < 10) await rateLimitedChanger(ids.length);
      else await rateLimitedChanger(10);

      async function rateLimitedChanger(limit) {
        
        let i = limit;
        let requested = limit;
        while (i--) {
          let personId = ids.pop();
          //   Get person by ID
          let person_by_id = {};

          // add invalid to email address.
          try {
            await PipeDrive.getPersonById(personId, token).then((r) => {
              console.log("getpersonbyid-------r", r);
              person_by_id = r;
            });
            let old_email = person_by_id["email"][0];
            console.log("old_email", old_email);
            personId &&
              PipeDrive.updateEmail(
                personId,
                token,
                old_email,
                email_status[personId]
              ).then((r) => {
                if (!--requested && ids.length > 0) {
                  rateLimitedChanger(limit);
                }
              });
          } catch (error) {
            console.log("error", error);
          }
        }
      }


      Utils.socket.sendData(socket, "update", { state: "finished" });
      // Search "Email Validation" Custom field and update the value
      // PipeDrive.personField(token).then(async (field) => {
      //   if (field) {
      //     // console.log('we have a field ', field)
      //     let ids = Object.keys(message.data.idToEmail);
      //     console.log("ids", ids);
      //     async function rateLimitedChanger(limit) {
      //       let i = limit;
      //       let requested = limit;
      //       while (i--) {
      //         let personId = ids.pop();
      //         //   Get person by ID
      //         let person_by_id = {};
      //         try {
      //           await PipeDrive.getPersonById(personId, token).then((r) => {
      //             console.log("getpersonbyid-------r", r);
      //             person_by_id = r;
      //           });
      //           console.log("field", field);
      //           console.log("person_by_id", person_by_id);
      //           let old_status = person_by_id[field.key];
      //           let old_email = person_by_id["email"][0];
      //           console.log("old_status", old_status);
      //           console.log("old_email", old_email);

      //           let status = "";
      //           if (old_status && old_status !== undefined && old_status !== "")
      //             status = fields[personId] + "\n" + old_status;
      //           console.log(
      //             "update person info",
      //             personId,
      //             field.key,
      //             // fields[personId]
      //             status
      //           );
      //           //   Update the Pesron with field token and data
      //           personId &&
      //             PipeDrive.updatePerson(
      //               personId,
      //               token,
      //               field.key,
      //               status
      //               // fields[personId]
      //             ).then((r) => {
      //               if (!--requested && ids.length > 0) {
      //                 rateLimitedChanger(limit);
      //               }
      //             });

      //           // //   update the email with suffix and color
      //           // console.log(
      //           //   "update email",
      //           //   personId,
      //           //   token,
      //           //   old_email,
      //           //   email_status
      //           // );
      //           // personId &&
      //           //   PipeDrive.updateEmail(
      //           //     personId,
      //           //     token,
      //           //     old_email,
      //           //     email_status[personId]
      //           //   ).then((r) => {
      //           //     if (!--requested && ids.length > 0) {
      //           //       rateLimitedChanger(limit);
      //           //     }
      //           //   });
      //           // console.log("email_status", email_status[personId]);
      //         } catch (error) {
      //           console.log("error", error);
      //         }
      //       }
      //     }
      //     if (ids.length < 10) await rateLimitedChanger(ids.length);
      //     else await rateLimitedChanger(10);
      //   }
      // });

      resolve(true);
      return;
      // MailClient.getInstance().send(
      //     message.data.email,
      //     'Email validation you requested is ready',
      //     'Thanks for using the CertaLink email validator. We have updated your Pipedrive records accordingly. Please find attached as CSV file with the results of your email validation check.' +
      //         '\n\n' +
      //         'If you have any queries please email support@certalink.com',
      //     fileContent
      // );
    } catch (e) {
      reject(e);
    }
  });
}
function sendStatus(socket, customer) {
  Utils.socket.sendData(socket, "status", {
    credits: customer.metadata["Credit Balance"],
    email: customer.email,
    history: customer.metadata,
  });
}
