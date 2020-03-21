const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "chat.proto";
const SERVER_URI = "0.0.0.0:22222";

let usersInChat = [];
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const joinChat = call => {
  console.log(`user ${call.request.user} has joined.`);

  call.on("cancelled", () => {
    usersInChat = usersInChat.filter(user => user !== call);
  });

  usersInChat.push(call);
};

const sendMessage = (call, callback) => {
  const { msg } = call.request;

  if (!msg) {
    return callback(new Error("Provide a non-empty message , you fool"));
  }

  const messageToSend = {
    ...call.request,
    timestamp: Math.floor(new Date().getTime() / 1000)
  };

  usersInChat.forEach(user => user.write(messageToSend));

  callback(null, {});
};

const server = new grpc.Server();
server.addService(protoDescriptor.ChatService.service, {
  joinChat,
  sendMessage
});
server.bind(SERVER_URI, grpc.ServerCredentials.createInsecure());

server.start();
console.log("Yay , the server is up and running !");
