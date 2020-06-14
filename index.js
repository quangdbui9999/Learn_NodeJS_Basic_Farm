const fs = require('fs'); // file system, reading, writing data to file system
const http = require('http'); // require http module, give us networking capability, building an http server
const url = require('url'); // building the routing
// slug is just the last part of a URL that contains a unique string that identifies the resource that the website is displaying.
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate'); // our own module

///////////////////////////////////////////////////////////
// FILES
// Blocking, synchronous way
/*
// utf-8: character in coding
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);

// write file
const textOut = `This is what we know about the avocade: ${textIn}.\n Created on ${Date.now()}.`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log(`File written.`);
*/

/*
//Non-blocking, asynchronous way
fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  if (err) return console.log(`ERROR!`);
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);

      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", err => {
        console.log(`Your file have been written!`);
      });
    });
  });
});
console.log("Will read file!");
*/

///////////////////////////////////////////////////////////
// SERVERS

// this code is outside the callback functions, called top level code, is only ever executed once we start the program
// synchronous mode (blocking mode)
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  `utf-8`
);

const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  `utf-8`
);

const tempProducts = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  `utf-8`
);
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, `utf-8`);
const dataObj = JSON.parse(data);

const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
console.log(slugs);

//console.log(slugify("Fresh Avocado", { lower: true }));

const server = http.createServer((req, res) => {
  //console.log(req.url); // http://127.0.0.1:8080/product?id=1 output: product?id=1
  //console.log(url.parse(req.url, true));

  const { query, pathname } = url.parse(req.url, true);

  if (pathname === '/' || pathname === '/overview') {
    // OVERVIEW PAGE
    res.writeHead(200, {
      'Content-type': 'text/html'
    });

    // map accepts a callback function and this callback function gets as an argument the current element, so the element of the current loop
    const cardsHTML = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHTML);

    res.end(output);
  } else if (pathname === '/product') {
    // PRODUCT page
    res.writeHead(200, {
      'Content-type': 'text/html'
    });

    const product = dataObj[query.id];
    const output = replaceTemplate(tempProducts, product);

    res.end(output);
  } else if (pathname === '/api') {
    // API
    res.writeHead(200, {
      'Content-type': 'application/json'
    });
    res.end(data);
  } else {
    // NOT FOUND
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    });
    res.end('<h1>Page not found</h1>');
  }

  //res.end(`Hello from the Server!`); // client respond to the server
});

// starting up from server, listening the incoming request
server.listen(8080, '127.0.0.1', () => {
  console.log(`Listerning to requests on port 8080`);
});
