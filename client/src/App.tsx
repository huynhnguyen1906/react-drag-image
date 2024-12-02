import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

interface ImageState {
	x: number;
	y: number;
	currentHolder: string | null;
}

const App: React.FC = () => {
	const [position, setPosition] = useState({ x: 100, y: 100 });
	const [isHolder, setIsHolder] = useState(false); // Chỉ định trạng thái "chủ sở hữu"
	console.log(isHolder);
	useEffect(() => {
		// Nhận trạng thái ảnh từ server
		socket.on("imageState", (newState: ImageState) => {
			setPosition({ x: newState.x, y: newState.y });
			setIsHolder(socket.id === newState.currentHolder); // Kiểm tra nếu client là "chủ sở hữu"
		});

		// Ẩn ảnh nếu không phải chủ sở hữu
		socket.on("hideImage", () => {
			setIsHolder(false);
		});

		return () => {
			socket.off("imageState");
			socket.off("hideImage");
		};
	}, []);

	const handleDrag = (_e: any, data: any) => {
		if (!isHolder) return;
		const newPosition = { x: data.x, y: data.y };
		setPosition(newPosition);
		socket.emit("updateImage", newPosition);
	};

	const checkBoundary = (x: number, y: number) => {
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		if (x < 0 || x > viewportWidth || y < 0 || y > viewportHeight) {
			socket.emit("imageTransferred", { x, y });
			setIsHolder(false); // Ẩn ảnh sau khi gửi thông báo
		}
	};

	return (
		<div
			style={{
				width: "100vw",
				height: "100vh",
				backgroundColor: "#f0f0f0",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{isHolder && (
				<Draggable position={position} onDrag={handleDrag} onStop={(_, data) => checkBoundary(data.x, data.y)}>
					<img
						src="/src/assets/a.png"
						alt="Draggable"
						style={{
							width: "200px",
							height: "200px",
							cursor: "grab",
							userSelect: "none",
						}}
					/>
				</Draggable>
			)}
		</div>
	);
};

export default App;
