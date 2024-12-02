import React, { useState, useEffect, useRef } from "react";

interface Position {
	x: number;
	y: number;
}

interface Message {
	action: "drag" | "drop" | "update" | "release";
	x?: number;
	y?: number;
	image?: string;
}

const DragDrop: React.FC = () => {
	const [position, setPosition] = useState<Position>({ x: 100, y: 100 }); // Vị trí ban đầu
	const [visible, setVisible] = useState<boolean>(true); // Hiển thị ảnh hay không
	const [isOwner, setIsOwner] = useState<boolean>(false); // Trạng thái sở hữu ảnh
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		socketRef.current = new WebSocket("ws://localhost:5000");

		socketRef.current.onmessage = (event: MessageEvent) => {
			const data: Message = JSON.parse(event.data);

			if (data.action === "update") {
				// Cập nhật vị trí ảnh cho client sở hữu
				setPosition({ x: data.x ?? 0, y: data.y ?? 0 });
				setVisible(true);
				setIsOwner(true);
			} else if (data.action === "release") {
				// Xóa trạng thái sở hữu nếu ảnh bị giải phóng
				setVisible(false);
				setIsOwner(false);
			} else if (data.action === "info") {
				console.log(data.message);
			}
		};

		return () => {
			socketRef.current?.close();
		};
	}, []);

	const handleDragStart = () => {
		if (isOwner) {
			setVisible(true);
		}
	};

	const handleDrag = (e: React.DragEvent<HTMLImageElement>) => {
		if (isOwner) {
			const newX = e.clientX;
			const newY = e.clientY;

			setPosition({ x: newX, y: newY });

			if (socketRef.current) {
				socketRef.current.send(
					JSON.stringify({
						action: "drag",
						x: newX,
						y: newY,
					})
				);
			}
		}
	};

	const handleDragEnd = (e: React.DragEvent<HTMLImageElement>) => {
		if (isOwner) {
			const newX = e.clientX;
			const newY = e.clientY;

			if (socketRef.current) {
				socketRef.current.send(
					JSON.stringify({
						action: "drop",
						x: newX,
						y: newY,
					})
				);
			}
		}
	};

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				backgroundColor: "#f0f0f0",
			}}
		>
			{visible && isOwner && (
				<img
					src="/src/assets/a.png"
					alt="Drag me"
					draggable
					onDragStart={handleDragStart}
					onDrag={handleDrag}
					onDragEnd={handleDragEnd}
					style={{
						position: "absolute",
						top: position.y,
						left: position.x,
						cursor: "grab",
						width: "100px",
						height: "100px",
					}}
				/>
			)}
		</div>
	);
};

export default DragDrop;
