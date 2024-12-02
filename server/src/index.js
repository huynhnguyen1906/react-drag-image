const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let imageState = {
	x: 100, // Vị trí X của ảnh
	y: 100, // Vị trí Y của ảnh
};

io.on("connection", (socket) => {
	console.log("A user connected");

	// Gửi trạng thái ảnh hiện tại cho client mới
	socket.emit("imageState", imageState);

	// Lắng nghe sự kiện khi ảnh được kéo
	socket.on("updateImage", (newState) => {
		imageState = newState; // Cập nhật trạng thái toàn cục
		socket.broadcast.emit("imageState", imageState); // Gửi trạng thái mới cho các client khác
	});

	socket.on("disconnect", () => {
		console.log("A user disconnected");
	});
});

server.listen(5000, () => {
	console.log("Server is running on http://localhost:5000");
});
