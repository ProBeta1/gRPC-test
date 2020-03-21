const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "chat.proto";
const SERVER_URI = "0.0.0.0:22222";

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const client = new protoDescriptor.ChatService(
  SERVER_URI,
  grpc.credentials.createInsecure()
);

const user = "Abhinav";
const sendMsgIntervals = 2000;

const chatStream = client.joinChat({ user });

chatStream.on("data", data => {
  const { message, user } = data;
  console.log(` ${user} : ${message} `);
});

let messageNumber = 0;

setInterval(() => {
  client.sendMessage(
    { message: `New message no. ${messageNumber++}`, user },
    (err, res) => {
      if (err) console.log(err);
    }
  );
}, sendMsgIntervals);
