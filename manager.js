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
        runprompt();
    });
  });
  
//   Function to make table
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
            };
           
            console.log(chalk.blue.bold("********************Welcome to Bamazon!************************"));
            console.log(chalk.rgb(255, 136, 0).bold(table.toString()));
            // connection.end();
            runprompt();
            
  });
};

// Function to run prompt question with choices
function runprompt() {
   
    console.log('\n ');
    inquirer
      .prompt([{
        name: "manage",
        type: "list",
        message: "Hello manager! Here are your options:",
        choices: ['View products for sale', 'View low inventory', 'Add to inventory', 'Add new product', 'Quit']
      }]).then(function(answer) {
        var action = answer.manage;
          if (action=='View products for sale') {
              maketable();
              
          }
          else if (action=='View low inventory') {
              lowinv();

              }
           else if (action=='Add to inventory')   {
               addinv();
           }
           else if (action=='Add new product') {
               addproduct();
           }
           else if (action=='Quit') {
               connection.end();
           }
          });

    };

// Function to display low inventory items
    function lowinv() {
        connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
           
            var table = new Table({
                    head: ['ID', 'Product', 'Department', 'Price', 'Stock Quantity']
                  , colWidths: [5, 20, 20, 10, 10]
                });
             
                for (var i = 0; i<results.length; i++) {
                    if (results[i].stock_quantity <10) {
                    table.push(
                        [results[i].item_id, results[i].product_name, results[i].department_name, "$" + results[i].price.toFixed(2), results[i].stock_quantity]
                    );
                   
                }
            }
                console.log(chalk.blue.bold("******************Low Inventory Items************************"));
                console.log('\n ');
                console.log(chalk.rgb(255, 136, 0).bold(table.toString()));
                // connection.end();
                runprompt();
                
      });
    };

// Function to add to inventory

    function addinv() {
        connection.query("SELECT * FROM products", function(err, results) {
            if (err) throw err;
           
            var table = new Table({
                    head: ['ID', 'Product', 'Department', 'Price', 'Stock Quantity'],
                    colWidths: [5, 20, 20, 10, 10]
                });
             
                for (var i = 0; i<results.length; i++) {
                    table.push(
                        [results[i].item_id, results[i].product_name, results[i].department_name, "$" + results[i].price.toFixed(2), results[i].stock_quantity]
                    );
                   
                }
                console.log(chalk.blue.bold("*******************Current Inventory************************"));
                console.log(chalk.rgb(255, 136, 0).bold(table.toString()));
                
                inquirer
                .prompt([{
                    name: "add",
                    type: "input",
                    message: "Id of item to be adjusted"},
                    {
                    name: "quantity",
                    type: "input",
                    message: "Quantity you would like to add"    
                    }]).then(function(answer) {
                        connection.query('SELECT * FROM products WHERE ?', {item_id: answer.add}, function(err, res) {
                            if (err) throw err;
                            console.log(chalk.green("******You are adding " + answer.quantity + " " + res[0].product_name + "(s) to the inventory******"));
                            if(res[0].stock_quantity >= 0) {
                                connection.query('UPDATE products SET ? WHERE ?',
                                [{
                                    stock_quantity: (res[0].stock_quantity + parseInt(answer.quantity))
                                },{
                                    item_id: answer.add
                                }],
                                function(err, res) {
                                    if (err) throw err;

                                });
                                maketable();
                                console.log('\n ');
                                console.log(chalk.green("Inventory has been ****updated****"));
                               
                               
                            }
                            else {
                                console.log("Unable to update the inventory");
                               
                            };
                    });
                });
            });
        };

// Function to add a new product

function addproduct() {
    inquirer
    .prompt([{
        name: "new",
        type: "input",
        message: "What is the name of the product you would like to add?"},
        {
        name: "dep",
        type: "list",
        message: "Which department does this product fall into?",
        choices: ['office supplies', 'toys and games', 'pet supplies']
        },
        {
        name: "cost",
        type: "input",
        message: "How much does it cost?"  
        },
        {
        name: "number",
        type: "input",
        message: "How many do we have?"     
        }]).then(function(answer) {
            
            connection.query('INSERT INTO products SET ?',
            [{
                product_name: answer.new,
                department_name: answer.dep,
                price: answer.cost,
                stock_quantity: answer.number
            }],
            function(err, res) {
                if(err) throw err;
            });
            maketable();
            console.log('\n ');
            console.log(chalk.green("You have entered a new item"));

});
};

