const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const app = express();

const SECRET_KEY = "SEPT"; // Usa esto para firmar los JWT

// Configuración de Conexión a Postgres
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pedidos',
  password: '1234',
  port: 5432,
});

app.use(express.json());

// Token de ejemplo (En una app real sería un JWT generado)
const MOCK_TOKEN = "token_secreto_12345";

// 1. ENDPOINT DE AUTENTICACIÓN [cite: 25, 27]
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Validación simple para la tarea
    if (username === "admin" && password === "1234") {
       const token = jwt.sign({ user: username }, SECRET_KEY, { expiresIn: '8h' });
        return res.json({ token });
    } else {
        res.status(401).json({ error: "Usuario o clave incorrecta" }); 
    }
});


// 2. MIDDLEWARE DE VALIDACIÓN (Authorization: Bearer)
const validarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Token no proporcionado" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token inválido o expirado" });
        req.user = decoded;
        next();
    });
};

// 3. RECIBIR PEDIDOS Y GUARDAR EN POSTGRES
app.post('/orders', validarToken, async (req, res) => {
    const p = req.body;
    try {
        const query = 'INSERT INTO pedidos (nombre, telefono, direccion, detalle, tipo_pago, latitud, longitud) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        const values = [p.nombre, p.telefono, p.direccion, p.detalle, p.tipo_pago, p.latitud, p.longitud];
        
        await pool.query(query, values);
        res.status(201).json({ status: "OK", message: "Pedido guardado en Postgres" }); 
    } catch (err) {
        res.status(500).json({ status: "Error", message: err.message }); 
    }
});

app.get('/', (req, res) => {
    res.send('API de Pedidos con nodemon');
});

app.listen(3000, () => console.log('Servidor corriendo en el puerto 3000'));