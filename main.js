// npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
const chalk = require('chalk');
var figlet = require('figlet');

// Connection to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon_db"
  });

  connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
    figlet('Bamazon!!!', function(err, data) {
      if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
      }
      console.log(chalk.green((data)));
      maketable();
  });
    
  });
  
  // Function to make the product table
  function maketable() {
      connection.query("SELECT * FROM products", function(err, results) {
        if (err) throw err;
       
        var table = new Table({
                head: ['ID', 'Product', 'Department', 'Price', 'Stock Quantity']
              , colWidths: [5, 20, 20, 10, 10]
            });
         
            for (var i = 0; i<results.length; i++) {
                table.push(
                    [results[i].item_id, results[i].product_name, results[i].department_name, "$" + results[i].price.toFixed(2), results[i].stock_quantity]
                );
               
            }
            console.log(chalk.blue.bold("********************Welcome to Bamazon!************************"));
            console.log(chalk.rgb(255, 136, 0).bold(table.toString()));
            runprompt();
  })
};

// Function to run initial prompt questions
function runprompt() {
  console.log('\n ');
  inquirer
    .prompt([{
      name: "purchase",
      type: "input",
      message: "Which id# would you like to buy?(or press q to quit)",     
    }, {
      name: "quantity",
      type: "input",
      message: "How many would you like to buy?(or press q to quit)",
    }]).then(function(answer) {
     if(answer.quantity==='q' || answer.purchase==='q') {connection.end()}
     else {
      connection.query('SELECT * FROM products WHERE ?', {item_id: answer.purchase}, function(err, res) {
        if (err) throw err;
        // console.log(typeof(answer.quantity));
        // console.log(typeof(answer.purchase)); 
        // console.log(res);
        console.log(chalk.green("******You are buying " + answer.quantity + " " + res[0].product_name + "(s)******"));
//  Checks if there's enough inventory and returns adjusted amount
        if(res[0].stock_quantity >= answer.quantity) {
          connection.query('UPDATE products SET ? WHERE ?',
          [{
            stock_quantity: (res[0].stock_quantity - answer.quantity)
          },{
            product_name: res[0].product_name
          }],
          function(err, res) {
            if (err) throw err;
          });
// Returns total price for items
          console.log(chalk.green("Your total: $ " + (answer.quantity * res[0].price)));
          figlet('Thank You!!', function(err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(chalk.green((data)));
           
        });
          connection.end();
        }
        else {
          console.log("Sorry, there's not enough inventory!")
          connection.end();
        };
      });
    };
    });
  };

     






