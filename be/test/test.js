//Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

import bcrypt from "bcryptjs";

const crypt = async (word, next) => {
  console.log('MOI2');
  try {
    console.log('MOI');
    const salt = await bcrypt.genSalt(10);
    const hashedWord = await bcrypt.hash(word, salt);
    return hashedWord;
  } catch (e) {
    next(e)
  }
};

const test = async () => {
  const pass = await crypt('adminpass');
  console.log(pass);
};
const test2 = async () => {
  const pass = await crypt('docpass');
  console.log(pass);
};
const test3 = async () => {
  const pass = await crypt('potpass');
  console.log(pass);
};

test();
test2();
test3();


