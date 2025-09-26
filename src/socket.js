// src/socket.js
import { io } from 'socket.io-client';

const socket = io('https://aibackend.todaystrends.site'); // Replace with your actual backend URL
// const socket = io('http://localhost:1111'); // Replace with your actual backend URL

export default socket;
