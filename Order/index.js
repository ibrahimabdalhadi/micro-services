import http from 'http';
import url from 'url';
import  fs  from 'fs';
import data from './db.json' with { type: "json" }; // Assuming './db.json' is the correct path to your JSON data

var library =  data ;
var dataToSend = JSON.stringify(library);
let database ;
let book;
let books;



function readDatabase() {
  return new Promise((resolve, reject) => {
    fs.readFile('db.json', 'utf8', (err, jsonData) => {
      if (err) {
        console.error('Error reading file:', err);
        reject(err);
        return;
      }
      try {
        const parsedData = JSON.parse(jsonData);
        resolve(parsedData);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        reject(parseError);
      }
    });
  });
}

async function searchBooksById(id) {
  try {
    const database = await readDatabase();
    const books = database.filter(book => book.id.includes(id));
    return books[0];
  } catch (error) {
    console.error('Error searching books:', error);
    return null;
  }
}

function writeToFile(updatedData) {

    fs.writeFile('db.json', updatedData, (err) => {
      if (err) {
        console.error('Error writing to file:', err);
    } else {
        console.log('Data replaced successfully.');
          }
           });
}

function syncDelay(milliseconds) {
  const startTime = Date.now();
  while (Date.now() - startTime < milliseconds) {
    // This loop blocks the execution thread until the specified time has passed
  }
}


const server = http.createServer((req, res)=> {

    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    const options = {
      hostname: 'localhost',
      port: 3007, 
      path: req.url,
      method: req.method,
      headers: req.headers
    }
   
    if( req.method === 'PUT' && pathname.includes('/library')){

      let updatedData = '';

    // Listen for the 'data' event, which is emitted whenever new data arrives in the request body
    req.on('data', (chunk) => {
      updatedData += chunk.toString();
    });

     // Listen for the 'end' event, which is emitted when all data has been received
     req.on('end', () => {

      library = JSON.parse(updatedData);
      // console.log(typeof library);
      writeToFile(updatedData);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Updated data received successfully');
    });
  }  

   else if(pathname.includes('/purchase')) {

    //check if there is enough book in library :
      
      const parts = pathname.split("/");
      const id = parts[parts.length - 1];
    

      books = library.filter(book => book.id.includes(id));
      book = books[0];
   
      if(book.count > 0) {
      
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
    
      req.pipe(proxyReq);
    
      proxyReq.on('error', (error) => {
        console.error('Error forwarding request:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
      });

    } else {
      res.end('there is no enough');
    }

    } 
    });

const port = 3008;

server.listen(port, ()=> {
    console.log('Order server is running');
});