import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes, deleteNote, createNote, updateNote } from '../services/noteService';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit3, X, LogOut, Loader } from 'lucide-react'; 
import './Home.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  
  const navigate = useNavigate();

  // Hàm xử lý đăng xuất chung (dọn dẹp sạch sẽ)
  const performLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange')); // Báo cho Navbar cập nhật
    navigate('/login');
  };

  const handleLogout = () => {
    performLogout();
    toast.success('Đăng xuất thành công!');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- PHẦN QUAN TRỌNG NHẤT: LOGIC LẤY DỮ LIỆU ---
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await getNotes();
      console.log("Check API Response:", response); // Giúp bạn soi dữ liệu trong Console F12

      let notesData = [];

      // Logic kiểm tra đa năng các kiểu trả về của Backend
      if (Array.isArray(response)) {
        // Trường hợp 1: API trả về thẳng mảng [ {...}, {...} ]
        notesData = response;
      } else if (response?.notes && Array.isArray(response.notes)) {
        // Trường hợp 2: API trả về { success: true, notes: [...] }
        notesData = response.notes;
      } else if (response?.data && Array.isArray(response.data)) {
        // Trường hợp 3: API trả về { data: [...] } (kiểu axios mặc định)
        notesData = response.data;
      }

      setNotes(notesData);
      
    } catch (err) {
      console.error("Lỗi fetchNotes:", err);
      // Xử lý khi token hết hạn
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Phiên đăng nhập hết hạn.');
        performLogout();
      } else {
        toast.error('Không thể tải danh sách ghi chú.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setNewNote({ title: '', content: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditClick = (note) => {
    setNewNote({ title: note.title, content: note.content });
    // Dùng note._id hoặc note.id đề phòng backend trả về khác nhau
    setCurrentNoteId(note._id || note.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateNote(currentNoteId, newNote);
        toast.success("Đã cập nhật ghi chú!");
      } else {
        await createNote(newNote);
        toast.success("Đã thêm ghi chú mới!");
      }
      setShowModal(false);
      fetchNotes(); // Tải lại danh sách ngay lập tức
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Lưu thất bại, vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      try {
        await deleteNote(id);
        toast.success('Đã xóa thành công!');
        fetchNotes(); // Tải lại từ server để đồng bộ nhất
      } catch (err) {
        toast.error(err.message || 'Xóa thất bại.');
      }
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-action-bar">
        <h2>Ghi chú của tôi</h2>
        <div className="action-buttons">
          <button className="btn-add" onClick={handleOpenAddModal}>
            <Plus size={20} /> <span>Tạo mới</span>
          </button>
          <button className="btn-logout" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Nội dung chính */}
      {loading ? (
        <div className="loading-state">
          <Loader className="animate-spin" size={32} />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note._id || note.id} className="note-card">
                <div className="note-body">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </div>
                <div className="note-footer">
                  <span className="note-date">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                  </span>
                  <div className="note-actions">
                    <button className="action-btn edit" onClick={() => handleEditClick(note)}>
                      <Edit3 size={18} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(note._id || note.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Bạn chưa có ghi chú nào.</p>
              <button onClick={handleOpenAddModal}>Tạo ghi chú đầu tiên ngay!</button>
            </div>
          )}
        </div>
      )}

      {/* Modal Popup */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? 'Chỉnh sửa ghi chú' : 'Ghi chú mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveNote}>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Tiêu đề (Ví dụ: Mua sắm cuối tuần)" 
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <textarea 
                  placeholder="Nội dung chi tiết..." 
                  rows="8"
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">
                  {isEditing ? 'Lưu thay đổi' : 'Tạo ghi chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;