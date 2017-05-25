import debug from 'debug';
import { Err } from '../modules/error';
import { sendMail } from '../modules/mail';
import { cryptPassword } from '../modules/password';

const logger = debug('matcha:prepareQueryRegister.js');

export const QueryRegister = (req) => {
  const token = Math.random().toString(36).substr(2, 6).toUpperCase();
  cryptPassword(req.body.password)
    .then((pass) => {
      req.body.password = pass;
      req.dUsers.insert(Object.assign(req.body, { registerToken: token })).catch(() => {
        logger('insert failed');
      });
    })
    .then(() => {
      sendMail(req.body.email, 'Registration - Matcha', `Registration Code: ${token}`);
    })
    .catch(() => {
      logger('password error');
    });
  logger('Succesfully Registered');
};

export const QueryLogin = (data, inputpassword) => {
  //
  // cryptPassword(inputpassword)
  // .then((pass) => {
  //   logger(pass);
  //   return 'pass';
  // //   // if (pass !== data.passwordhashed) {
  // //   //   // Err('Wrong Password !');
  // //   //   return ('Err');
  // //   // } else {
  // //   //   return ('');
  // //   // }
  // })
  // .catch(() => { logger('catcherr') });
};

export const QueryConfirmUserMail = req =>
  new Promise((resolve, reject) => {
    req.dUsers
      .findOne({ login: req.body.login })
      .then((data) => {
        if (!data) reject(Err('No Account Found! - confirmUserMail'));
        else return data;
      })
      .then((data) => {
        if (data.registerToken !== req.body.token) reject(Err('Wrong Token - confirmUserMail'));
        return data;
      })
      .then(() =>
        req.dUsers.update(
          { login: req.body.login },
          {
            $set: { confirmed: true },
            $unset: { registerToken: '' },
          },
        ),
      )
      .catch(() => {
        reject('Something happens will trying to connect!');
      })
      .then(() => {
        logger('Succesfully Confirmed');
        resolve();
      });
  });
