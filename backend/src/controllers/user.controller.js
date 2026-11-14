import {
  listRoles,
  listStaffUsers,
  getStaffUserById,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
} from '../services/user.service.js'
import { successResponse } from '../utils/apiResponse.js'

export async function getRoles(req, res, next) {
  try {
    const roles = await listRoles()
    return successResponse(res, roles, 'Roles list retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await listStaffUsers()
    return successResponse(res, users, 'Staff users list retrieved successfully.')
  } catch (error) {
    next(error)
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await getStaffUserById(req.params.id)
    return successResponse(res, user, 'Staff user details retrieved.')
  } catch (error) {
    next(error)
  }
}

export async function createUser(req, res, next) {
  try {
    const newUser = await createStaffUser(req.body)
    return successResponse(res, newUser, 'Staff user created successfully.', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req, res, next) {
  try {
    const updated = await updateStaffUser(req.params.id, req.body)
    return successResponse(res, updated, 'Staff user updated successfully.')
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req, res, next) {
  try {
    const result = await deleteStaffUser(req.params.id)
    return successResponse(res, result, 'Staff user deactivated.')
  } catch (error) {
    next(error)
  }
}

