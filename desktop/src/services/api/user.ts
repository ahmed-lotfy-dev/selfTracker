import axiosInstance from "@/lib/api/axiosInstance"

export async function updateUser(data: Record<string, any>) {
  const res = await axiosInstance.patch(`/api/users/${data.id}`, data)
  return res.data
}
