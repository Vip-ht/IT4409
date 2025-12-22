import API from './api';
export const getNotes = async () => {
  try {
    const response = await API.get('/notes');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Không thể lấy danh sách ghi chú";
    throw new Error(message);
  }
};
export const createNote = async (noteData) => {
  try {
    const response = await API.post('/notes', noteData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Lỗi khi tạo ghi chú";
    throw new Error(message);
  }
};
export const deleteNote = async (id) => {
  try {
    const response = await API.delete(`/notes/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Lỗi khi xóa ghi chú";
    throw new Error(message);
  }
};
export const updateNote = async (id, updatedData) => {
  try {
    const response = await API.put(`/notes/${id}`, updatedData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Lỗi khi cập nhật ghi chú";
    throw new Error(message);
  }
};