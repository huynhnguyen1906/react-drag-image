import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000"); // Kết nối tới server

interface ImageState {
	x: number;
	y: number;
}

const App: React.FC = () => {
	const [position, setPosition] = useState<ImageState>({ x: 100, y: 100 });

	useEffect(() => {
		// Nhận trạng thái ảnh từ server
		socket.on("imageState", (newState: ImageState) => {
			setPosition(newState); // Cập nhật vị trí ảnh
		});

		return () => {
			socket.off("imageState");
		};
	}, []);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleDrag = (_e: any, data: any) => {
		const newPosition = { x: data.x, y: data.y };
		setPosition(newPosition);

		// Gửi trạng thái mới tới server
		socket.emit("updateImage", newPosition);
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
			<Draggable position={position} onDrag={handleDrag}>
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
		</div>
	);
};

export default App;
