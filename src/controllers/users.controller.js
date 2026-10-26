import logger from '#config/logger.js';
import { getAllUsers, getUserById, updateUser, deleteUser } from '#services/users.service.js';
import { userIdSchema, updateUserSchema } from '#validations/users.validation.js';
import { formatValidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    logger.info(`Getting user by id: ${req.params.id}`);

    // Validate the user ID parameter
    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const { id } = validationResult.data;
    const user = await getUserById(id);

    logger.info(`User ${user.email} retrieved successfully`);
    res.json({
      message: 'User retrieved successfully',
      user
    });
  } catch (e) {
    logger.error(`Error fetching user by id: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    logger.info(`Updating user: ${req.params.id}`);

    // Validate the user ID parameter
    const idValidationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!idValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(idValidationResult.error)
      });
    }

    // Validate the update data
    const updateValidationResult = updateUserSchema.safeParse(req.body);

    if (!updateValidationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(updateValidationResult.error)
      });
    }

    const { id } = idValidationResult.data;
    const updates = updateValidationResult.data;

    // Authorization checks
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to update user information'
      });
    }

    // Allow users to update only their own information (except role)
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own information'
      });
    }

    // Only admin users can change roles
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can change user roles'
      });
    }

    // Remove role from updates if non-admin user is trying to update their own profile
    if (req.user.role !== 'admin') {
      delete updates.role;
    }

    const updatedUser = await updateUser(id, updates);

    logger.info(`User ${updatedUser.email} updated successfully`);
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (e) {
    logger.error(`Error updating user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (e.message === 'Email already exists') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    next(e);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    logger.info(`Deleting user: ${req.params.id}`);

    // Validate the user ID parameter
    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error)
      });
    }

    const { id } = validationResult.data;

    // Authorization checks
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to delete users'
      });
    }

    // Only admin users can delete users (prevent self-deletion or user deletion by non-admins)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can delete users'
      });
    }

    // Prevent admins from deleting themselves
    if (req.user.id === id) {
      return res.status(403).json({
        error: 'Operation denied',
        message: 'You cannot delete your own account'
      });
    }

    const deletedUser = await deleteUser(id);

    logger.info(`User ${deletedUser.email} deleted successfully`);
    res.json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (e) {
    logger.error(`Error deleting user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};


// ===============================================================================

// import logger from '#config/logger.js';
// import {
//   deleteUser as deleteUserById,
//   getAllUsers,
//   getUserById as getUserByIdService,
//   updateUser as updateUserService,
// } from '#services/users.service.js';
// import { formatValidationError } from '#utils/format.js';
// import { updateUserSchema, userIdSchema } from '#validations/users.validation.js';

// const validateId = (req, res) => {
//   const result = userIdSchema.safeParse(req.params);
//   if (!result.success) {
//     res.status(400).json({
//       error: 'Validation failed',
//       details: formatValidationError(result.error),
//     });
//     return null;
//   }

//   return result.data.id;
// };

// // ===========================================
// export const fetchAllUsers = async (req, res, next) => {
//   try {
//     logger.info('Getting users ...');

//     const allUsers = await getAllUsers();

//     res.json({
//       message: 'Successfully retrieved users',
//       users: allUsers,
//       count: allUsers.length,
//     });
//   } catch (e) {
//     logger.error('Error retrieving users', e);
//     next(e);
//   }
// };
// // ===========================================

// export const getUserById = async (req, res, next) => {
//   const id = validateId(req, res);
//   if (id === null) return;

//   try {
//     logger.info(`Getting user ${id}`);
//     const user = await getUserByIdService(id);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     return res.status(200).json({
//       message: 'Successfully retrieved user',
//       user,
//     });
//   } catch (e) {
//     logger.error(`Error retrieving user ${id}`, e);
//     return next(e);
//   }
// };

// export const updateUser = async (req, res, next) => {
//   const id = validateId(req, res);
//   if (id === null) return;

//   const validationResult = updateUserSchema.safeParse(req.body);
//   if (!validationResult.success) {
//     return res.status(400).json({
//       error: 'Validation failed',
//       details: formatValidationError(validationResult.error),
//     });
//   }

//   const updates = validationResult.data;
//   const isOwner = req.user.id === id;
//   const isAdmin = req.user.role === 'admin';

//   if (updates.role !== undefined && !isAdmin) {
//     return res.status(403).json({ error: 'Only admins can change a user\'s role' });
//   }

//   if (!isOwner && !(isAdmin && Object.keys(updates).every((key) => key === 'role'))) {
//     return res.status(403).json({ error: 'You can only update your own information' });
//   }

//   try {
//     logger.info(`Updating user ${id}`);
//     const user = await updateUserService(id, updates);
//     return res.status(200).json({
//       message: 'User updated successfully',
//       user,
//     });
//   } catch (e) {
//     logger.error(`Error updating user ${id}`, e);
//     if (e.message === 'User not found') {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     return next(e);
//   }
// };

// export const deleteUser = async (req, res, next) => {
//   const id = validateId(req, res);
//   if (id === null) return;

//   if (req.user.id !== id && req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'You can only delete your own account' });
//   }

//   try {
//     logger.info(`Deleting user ${id}`);
//     await deleteUserById(id);
//     return res.status(200).json({ message: 'User deleted successfully' });
//   } catch (e) {
//     logger.error(`Error deleting user ${id}`, e);
//     if (e.message === 'User not found') {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     return next(e);
//   }
// };
