/**
 * User Controller
 * 
 * Handles HTTP request/response for user management endpoints.
 * Admin-only operations.
 * No business logic - delegates to user service.
 * 
 * Decision: Controllers handle only HTTP concerns
 * Reason: Follows CURSOR_RULES.md: "No business logic inside controllers"
 *         Controllers = request/response handling only.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates separation of concerns, harder to test,
 *           doesn't follow project architecture rules.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../services/user.service.js';
import { UserRole } from '../types/database.js';
import { logCrudEvent, extractIpAddress } from '../services/logging.service.js';

/**
 * GET /api/users
 * Get all users (admin only)
 */
export async function getAllUsersController(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching users',
    });
  }
}

/**
 * GET /api/users/:userId
 * Get user by ID (admin only)
 */
export async function getUserByIdController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required',
      });
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user',
    });
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
 */
export async function createUserController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { name, email, password, role, department } = req.body;

    // Validation
    if (!name || typeof name !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Name is required',
      });
      return;
    }

    if (!email || typeof email !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required',
      });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Password is required and must be at least 6 characters',
      });
      return;
    }

    const validRoles: UserRole[] = ['admin', 'procurement_manager', 'employee'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({
        error: 'Bad Request',
        message: `Role must be one of: ${validRoles.join(', ')}`,
      });
      return;
    }

    const user = await createUser({
      full_name: name,
      email,
      password,
      role,
      department: department || null,
    });

    // Log user creation
    await logCrudEvent({
      user_id: req.user?.user_id || null,
      user_role: req.user?.role || null,
      action: 'create',
      resource: 'user',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: `User created: ${user.email} (${user.role})`,
      resourceId: user.id,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    
    // Log failed user creation
    if (req.user) {
      await logCrudEvent({
        user_id: req.user.user_id,
        user_role: req.user.role,
        action: 'create',
        resource: 'user',
        status: 'failure',
        ip_address: extractIpAddress(req),
        description: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    const statusCode = error instanceof Error && error.message.includes('unique')
      ? 409
      : 500;
    res.status(statusCode).json({
      error: statusCode === 409 ? 'Conflict' : 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An error occurred while creating user',
    });
  }
}

/**
 * PATCH /api/users/:userId
 * Update user (admin only)
 */
export async function updateUserController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { userId } = req.params;
    const { name, email, password, role, department } = req.body;

    if (!userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required',
      });
      return;
    }

    const updates: any = {};
    if (name !== undefined) updates.full_name = name;
    if (email !== undefined) updates.email = email;
    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 6) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Password must be at least 6 characters',
        });
        return;
      }
      updates.password = password;
    }
    if (role !== undefined) {
      const validRoles: UserRole[] = ['admin', 'procurement_manager', 'employee'];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          error: 'Bad Request',
          message: `Role must be one of: ${validRoles.join(', ')}`,
        });
        return;
      }
      updates.role = role;
    }
    if (department !== undefined) updates.department = department;

    const user = await updateUser(userId, updates);
    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Log user update
    const updatedFields = Object.keys(updates).join(', ');
    await logCrudEvent({
      user_id: req.user?.user_id || null,
      user_role: req.user?.role || null,
      action: 'update',
      resource: 'user',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: `User updated: ${user.email} (fields: ${updatedFields})`,
      resourceId: user.id,
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    
    // Log failed user update
    if (req.user) {
      await logCrudEvent({
        user_id: req.user.user_id,
        user_role: req.user.role,
        action: 'update',
        resource: 'user',
        status: 'failure',
        ip_address: extractIpAddress(req),
        description: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        resourceId: userId,
      });
    }

    const statusCode = error instanceof Error && error.message.includes('unique')
      ? 409
      : 500;
    res.status(statusCode).json({
      error: statusCode === 409 ? 'Conflict' : 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An error occurred while updating user',
    });
  }
}

/**
 * DELETE /api/users/:userId
 * Delete user (admin only)
 */
export async function deleteUserController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'User ID is required',
      });
      return;
    }

    // Get user info before deletion for logging
    const userToDelete = await getUserById(userId);
    
    const deleted = await deleteUser(userId);
    if (!deleted) {
      res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
      return;
    }

    // Log user deletion
    await logCrudEvent({
      user_id: req.user?.user_id || null,
      user_role: req.user?.role || null,
      action: 'delete',
      resource: 'user',
      status: 'success',
      ip_address: extractIpAddress(req),
      description: userToDelete
        ? `User deleted: ${userToDelete.email} (${userToDelete.role})`
        : `User deleted: ${userId}`,
      resourceId: userId,
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Log failed user deletion
    if (req.user) {
      await logCrudEvent({
        user_id: req.user.user_id,
        user_role: req.user.role,
        action: 'delete',
        resource: 'user',
        status: 'failure',
        ip_address: extractIpAddress(req),
        description: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        resourceId: userId,
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while deleting user',
    });
  }
}

