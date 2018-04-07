'use strict';

const faker = require("faker");

//#2
let advertisements = [];

for(let i = 1 ; i <= 15 ; i++){
  let product = faker.commerce.product();
  advertisements.push({
    title: faker.company.companyName() + " " + product,
    description: "Our " + product + " is " + faker.commerce.productAdjective(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert("Advertisements", advertisements, {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
    return queryInterface.bulkDelete("Advertisements", null, {});
  }
};
