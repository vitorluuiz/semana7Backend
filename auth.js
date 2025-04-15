const jwt = require("jsonwebtoken");

const SECRET_KEY = "mysecretkey"

// Função para gerar token JWT
export function generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
}

export function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

export function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
}