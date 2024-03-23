import http from 'http';
import url from 'url';
import data from './db.json' with { type: "json" }; // Assuming './db.json' is the correct path to your JSON data
import fs from 'fs';



var library =  data ;
var dataToSend = JSON.stringify(library);


const options = {
    hostname:'localhost',
    port:3008,
    path:'/library',
    method:'PUT',
    headers : {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataToSend)
    }
};


function searchBooksById(id) {
    return library.filter(book => book.id.includes(id));
}

function searchBooksByTopic(topic) {
    topic = topic.toLowerCase();
    return library.filter(book => book.topic.toLowerCase().includes(topic));
}

function searchBooksByTitle(title) {
    title = title.toLowerCase();
    return library.filter(book => book.title.toLowerCase().includes(title));
}

function updateDatabase(newDataString){


    fs.writeFile('db.json', newDataString, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
      } else {
          console.log('Data replaced successfully.');
    }
  });

}

function incraseCount(id){

    library = library.map(book => {
        if (book.id === id) {
            return{...book, count: book.count + 1};
        }

        return book;
    });

     // Convert the new data to JSON string
     const newDataString = convertToJSONString(library);

     // Write the new data to the file
     updateDatabase(newDataString);

}

function decraseCount(id){

    library = library.map(book => {
        if (book.id === id) {
            return{...book, count: book.count - 1};
        }

        return book;
    });

     // Convert the new data to JSON string
     const newDataString = convertToJSONString(library);

     // Write the new data to the file
     updateDatabase(newDataString);

}

function increaseCost(id){

    library = library.map(book => {
        if (book.id === id) {
            return{...book, cost: book.cost + 1};
        }
        return book;
    });

     // Convert the new data to JSON string
     const newDataString = convertToJSONString(library);

     // Write the new data to the file
     updateDatabase(newDataString);

}

function decreaseCost(id){

    library = library.map(book => {
        if (book.id === id) {
            return{...book, cost: book.cost - 1};
        }
        return book;
    });

     // Convert the new data to JSON string
     const newDataString = convertToJSONString(library);

     // Write the new data to the file
     updateDatabase(newDataString);

}

function convertToJSONString(raw_data){

    // Convert the new data to JSON string
    const newDataString = JSON.stringify(
        raw_data, null, 2);

    return newDataString;

}

function purchaseBooks(id) {

    decraseCount(id);

    // Convert the new data to JSON string
    const newDataString = convertToJSONString(library);

    // Write the new data to the file
    updateDatabase(newDataString);
}




const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const { pathname, query } = parsedUrl;

    res.setHeader("Content-Type", "application/json");
    let requestToResource; // Define requestToResource here

    switch (method) {
        case "GET" :

         if (pathname == "/books") {

            const topic = query.topic;
            const title = query.title;
            const id  = query.id;
            
            if(title) {
                const filteredBooks = searchBooksByTitle(title);
                res.writeHead(200);
                res.end(JSON.stringify(filteredBooks));
            }

            else if(topic) {
                const filteredBooks = searchBooksByTopic(topic);
                res.writeHead(200);
                res.end(JSON.stringify(filteredBooks));
            }

            else if(id) {
                const filteredBooks = searchBooksById(id);
                res.writeHead(200);
                res.end(JSON.stringify(filteredBooks));
            }

            else {
                res.writeHead(200);
                res.end("There is no data");
            }
        }

        break;

        case "PUT" :
            const parts = pathname.split("/");
            const id = parts[parts.length - 1];
            const operation = parts[parts.length - 2];

            if(operation.includes('purchase')){

                 // Handle purchase operation
                 purchaseBooks(id);
                 res.writeHead(200);
                 res.end('Purchase is done');

                 const dataToSend = JSON.stringify(library);

                 // Options for the HTTP request to the other server
                 const options = {
                   hostname: 'localhost', // Update hostname as needed
                   port: 3008,
                   path: '/library',
                   method: 'PUT',
                   headers : {
                     'Content-Type': 'application/json',
                     'Content-Length': Buffer.byteLength(dataToSend)
                    }
                   };

                requestToResource = http.request(options, (resResource) => {
                    console.log('Library copy in order server has been updated successfully');
                });

                requestToResource.on('error', (error) => {
                    console.error('Error occurred while sending request to resource:', error);
                });


                // Add logging for request end
                requestToResource.on('end', () => {
                    console.log('Request to resource ended');
                });

                // Write the library data to the request body
                requestToResource.write(dataToSend);
                requestToResource.end();
 
            } else if(operation.includes('incCount')) {

                // Handle incrase count operation
                incraseCount(id);
                res.writeHead(200);
                res.end('increasing count operation is done');

                const dataToSend = JSON.stringify(library);

                // Options for the HTTP request to the other server
                const options = {
                  hostname: 'localhost', // Update hostname as needed
                  port: 3008,
                  path: '/library',
                  method: 'PUT',
                  headers : {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataToSend)
                   }
                  };

               requestToResource = http.request(options, (resResource) => {
                   console.log('Library copy in order server has been updated successfully');
               });

               requestToResource.on('error', (error) => {
                   console.error('Error occurred while sending request to resource:', error);
               });


               // Add logging for request end
               requestToResource.on('end', () => {
                   console.log('Request to resource ended');
               });

               // Write the library data to the request body
               requestToResource.write(dataToSend);
               requestToResource.end();

            } else if(operation.includes('decCount')) {

                // Handle decrease count operation
                decraseCount(id);
                res.writeHead(200);
                res.end('decrease count operation is done');

                const dataToSend = JSON.stringify(library);

                // Options for the HTTP request to the other server
                const options = {
                  hostname: 'localhost', // Update hostname as needed
                  port: 3008,
                  path: '/library',
                  method: 'PUT',
                  headers : {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataToSend)
                   }
                  };

               requestToResource = http.request(options, (resResource) => {
                   console.log('Library copy in order server has been updated successfully');
               });

               requestToResource.on('error', (error) => {
                   console.error('Error occurred while sending request to resource:', error);
               });


               // Add logging for request end
               requestToResource.on('end', () => {
                   console.log('Request to resource ended');
               });

               // Write the library data to the request body
               requestToResource.write(dataToSend);
               requestToResource.end();

            } else if(operation.includes('incCost')){

                // Handle incrase cost operation
                increaseCost(id);
                res.writeHead(200);
                res.end('increasing cost operation is done');

                const dataToSend = JSON.stringify(library);

                // Options for the HTTP request to the other server
                const options = {
                  hostname: 'localhost', // Update hostname as needed
                  port: 3008,
                  path: '/library',
                  method: 'PUT',
                  headers : {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(dataToSend)
                   }
                  };

               requestToResource = http.request(options, (resResource) => {
                   console.log('Library copy in order server has been updated successfully');
               });

               requestToResource.on('error', (error) => {
                   console.error('Error occurred while sending request to resource:', error);
               });


               // Add logging for request end
               requestToResource.on('end', () => {
                   console.log('Request to resource ended');
               });

               // Write the library data to the request body
               requestToResource.write(dataToSend);
               requestToResource.end();
                
            } else if(operation.includes('decCost')){

                 // Handle decrease cost operation
                 decreaseCost(id);
                 res.writeHead(200);
                 res.end('decreasing cost operation is done');
 
                 const dataToSend = JSON.stringify(library);
 
                 // Options for the HTTP request to the other server
                 const options = {
                   hostname: 'localhost', // Update hostname as needed
                   port: 3008,
                   path: '/library',
                   method: 'PUT',
                   headers : {
                     'Content-Type': 'application/json',
                     'Content-Length': Buffer.byteLength(dataToSend)
                    }
                   };
 
                requestToResource = http.request(options, (resResource) => {
                    console.log('Library copy in order server has been updated successfully');
                });
 
                requestToResource.on('error', (error) => {
                    console.error('Error occurred while sending request to resource:', error);
                });
 
 
                // Add logging for request end
                requestToResource.on('end', () => {
                    console.log('Request to resource ended');
                });
 
                // Write the library data to the request body
                requestToResource.write(dataToSend);
                requestToResource.end();
                 

            }

            // Write the library data to the request body
            requestToResource.write(dataToSend);
            requestToResource.end();
            break;

        default:
            res.writeHead(200);
            res.end('Hello world');
            break;
    }
});

const port = 3007;

server.listen(port, () => {
    console.log('Catalog server is running');
});


