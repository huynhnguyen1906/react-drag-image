const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173", // Địa chỉ frontend của bạn
		methods: ["GET", "POST"],
	},
});

let imageState = {
	x: 100, // Vị trí X của ảnh
	y: 100, // Vị trí Y của ảnh
	currentHolder: null, // Socket ID của client hiện giữ ảnh
};

io.on("connection", (socket) => {
	console.log(`A user connected: ${socket.id}`);

	// Nếu không ai giữ ảnh, client mới sẽ nhận ảnh
	if (!imageState.currentHolder) {
		imageState.currentHolder = socket.id;
		socket.emit("imageState", imageState);
	}

	// Lắng nghe cập nhật từ client
	socket.on("updateImage", (newState) => {
		imageState = { ...imageState, ...newState, currentHolder: socket.id };
		socket.broadcast.emit("hideImage"); // Ẩn ảnh ở các client khác
	});

	// Lắng nghe khi ảnh vượt ra ngoài viền
	socket.on("imageTransferred", (newState) => {
		imageState = { ...imageState, ...newState, currentHolder: null };

		// Gửi ảnh tới client khác nếu có kết nối
		const otherSockets = Array.from(io.sockets.sockets.keys()).filter((id) => id !== socket.id);
		if (otherSockets.length > 0) {
			const nextHolder = otherSockets[0];
			io.to(nextHolder).emit("imageState", { ...imageState, currentHolder: nextHolder });
			imageState.currentHolder = nextHolder;
		}
	});

	socket.on("disconnect", () => {
		console.log(`A user disconnected: ${socket.id}`);
		if (imageState.currentHolder === socket.id) {
			imageState.currentHolder = null;
		}
	});
});

server.listen(5000, () => {
	console.log("Server is running on http://localhost:5000");
});
