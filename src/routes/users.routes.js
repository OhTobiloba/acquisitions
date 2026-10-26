import express from 'express';
import { fetchAllUsers, fetchUserById, updateUserById, deleteUserById } from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';

const router = express.Router();

// GET /users - Get all users (admin only)
router.get('/', authenticateToken, fetchAllUsers);

// GET /users/:id - Get user by ID (authenticated users only)
router.get('/:id', authenticateToken, fetchUserById);

// PUT /users/:id - Update user by ID (authenticated users can update own profile, admin can update any)
router.put('/:id', authenticateToken, updateUserById);

// DELETE /users/:id - Delete user by ID (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUserById);

export default router;

// =============================================
// import express from 'express';
// import {
//   deleteUser,
//   fetchAllUsers,
//   getUserById,
//   updateUser,
// } from '#controllers/users.controller.js';
// import requireAuth from '#middleware/auth.middleware.js';

// const router = express.Router();

// router.get('/', fetchAllUsers);
// router.get('/:id', getUserById);
// router.put('/:id', requireAuth, updateUser);
// router.delete('/:id', requireAuth, deleteUser);

// export default router;