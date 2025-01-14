"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
dotenv_1.default.config();
// Middleware
app.use((0, cors_1.default)({
    origin: "*",
}));
app.use(express_1.default.json());
// Connect to Database
(0, db_1.default)();
// Basic Route
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
