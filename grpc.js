const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mysql = require('mysql');

// Load the protocol buffer file
const PROTO_PATH = __dirname + '/my-service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;

// Define MySQL connection parameters
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  port: 3307,
  password: '', 
  database: 'grpc' 
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Define the gRPC service
const myService = {
  getRecord: (call, callback) => {
    const id = call.request.id;

    // Query the database to get the record with the specified ID
    connection.query('SELECT * FROM records WHERE id = ?', [id], (error, results) => {
      if (error) {
        console.error(error);
        callback(error);
        return;
      }
      // Send the data back to the client
      const record = results[0];
      callback(null, { record: record.id });
    });
  },
};

// Start the gRPC server
const server = new grpc.Server();
server.addService(serviceProto.MyService.service, myService);
server.bindAsync(
  '127.0.0.1:50051',
  grpc.ServerCredentials.createInsecure(),
  () => { console.log('listening on port 50051'); server.start(); }
);
