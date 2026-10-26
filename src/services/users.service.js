import logger from '#config/logger.js';
import {db} from '#config/database.js';
import {users} from '#models/user.model.js';
import {eq} from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    }).from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (e) {
    logger.error(`Error getting user by id ${id}:`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // First check if user exists
    const existingUser = await getUserById(id);
        
    // Check if email is being updated and if it already exists
    if (updates.email && updates.email !== existingUser.email) {
      const [emailExists] = await db.select().from(users).where(eq(users.email, updates.email)).limit(1);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Add updated_at timestamp
    const updateData = {
      ...updates,
      updated_at: new Date()
    };

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User ${updatedUser.email} updated successfully`);
    return updatedUser;
  } catch (e) {
    logger.error(`Error updating user ${id}:`, e);
    throw e;
  }
};

export const deleteUser = async (id) => {
  try {
    // First check if user exists
    await getUserById(id);
        
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role
      });

    logger.info(`User ${deletedUser.email} deleted successfully`);
    return deletedUser;
  } catch (e) {
    logger.error(`Error deleting user ${id}:`, e);
    throw e;
  }
};


// import logger from '#config/logger.js';
// import { db } from '#config/database.js';
// import { users } from '#models/user.model.js';
// import { eq } from 'drizzle-orm';
// import { hashPassword } from '#services/auth.service.js';

// export const getAllUsers = async () => {
//   try {
//     return await db.select({
//       id: users.id,
//       email: users.email,
//       name: users.name,
//       role: users.role,
//       created_at: users.created_at,
//       updated_at: users.updated_at,
//     }).from(users);

//   } catch (e) {
//     logger.error('Error getting users', e);
//     throw e;
//   }
// };

// export const getUserById = async (id) => {
//   try {
//     const [user] = await db.select({
//       id: users.id,
//       email: users.email,
//       name: users.name,
//       role: users.role,
//       created_at: users.created_at,
//       updated_at: users.updated_at,
//     }).from(users).where(eq(users.id, id)).limit(1);

//     if(!user) {
//       throw new Error('User not found');
//     }

//     return user;
//   } catch (e) {
//     logger.error(`Error getting user ${id}`, e);
//     throw e;
//   }
// };

// export const updateUser = async (id, updates) => {
//   try {
//     const [existingUser] = await db.select({ id: users.id })
//       .from(users)
//       .where(eq(users.id, id))
//       .limit(1);

//     if (!existingUser) {
//       throw new Error('User not found');
//     }

//     const userUpdates = {};
//     if (updates.name !== undefined) userUpdates.name = updates.name;
//     if (updates.email !== undefined) userUpdates.email = updates.email;
//     if (updates.role !== undefined) userUpdates.role = updates.role;
//     if (updates.password !== undefined) {
//       userUpdates.password = await hashPassword(updates.password);
//     }

//     const [updatedUser] = await db.update(users)
//       .set({ ...userUpdates, updated_at: new Date() })
//       .where(eq(users.id, id))
//       .returning({
//         id: users.id,
//         email: users.email,
//         name: users.name,
//         role: users.role,
//         created_at: users.created_at,
//         updated_at: users.updated_at,
//       });

//     if (!updatedUser) {
//       throw new Error('User not found');
//     }

//     logger.info(`User ${id} updated successfully`);
//     return updatedUser;
//   } catch (e) {
//     logger.error(`Error updating user ${id}`, e);
//     throw e;
//   }
// };

// export const deleteUser = async (id) => {
//   try {
//     const [deletedUser] = await db.delete(users)
//       .where(eq(users.id, id))
//       .returning({ id: users.id });

//     if (!deletedUser) {
//       throw new Error('User not found');
//     }

//     logger.info(`User ${id} deleted successfully`);
//     return deletedUser;
//   } catch (e) {
//     logger.error(`Error deleting user ${id}`, e);
//     throw e;
//   }
// };