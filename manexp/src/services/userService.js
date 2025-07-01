import axiosInstance from "../api/axios"
import tokenMethod from "../api/token"

const getCurrentUserId = () => {
    try {
        const token = tokenMethod.get()
        return token?.user?.id
    } catch (error) {
        console.error("Error getting user ID from token:", error)
        return null
    }
}

const getUserById = async () => {
    try {
        const targetUserId = getCurrentUserId() || null
        const response = await axiosInstance.get(`/user/${targetUserId}`)
        return response
    } catch (error) {
        console.error("Error getting user profile:", error)
        throw error
    }
}

const updateNotice = async (userId, notice) => {
    try {
        const response = await axiosInstance.put(`/user/update-notice/${userId}?notice=${notice}`)
        return response
    } catch (error) {
        console.error("Error updating user notice:", error)
        throw error
    }
}

const UserAPI = {
    getUserById,
    updateNotice,
    getCurrentUserId
}
export default UserAPI