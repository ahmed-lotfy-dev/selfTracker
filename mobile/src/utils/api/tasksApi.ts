import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"

export const fetchAllTasks = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/tasks`)
  return response.data.tasks
}

export const fetchSingleTask = async (taskId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/tasks/${taskId}`
  )
  return response.data
}
export const createTask = async (task: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/api/tasks`, task)
  return response.data
}

export const updateTask = async (task: any) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/api/tasks/${task.id}`,
    task
  )
  return response.data
}

export const deleteTask = async (taskId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/tasks/${taskId}`
  )
  return response.data
}
