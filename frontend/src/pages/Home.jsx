import React, { useEffect, useState } from 'react';
import { getNotes, deleteNote, createNote, updateNote } from '../services/noteService';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit3, X } from 'lucide-react'; 
import './Home.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (err) {
      toast.error(err.message);
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
    setCurrentNoteId(note._id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const updatedData = await updateNote(currentNoteId, newNote);
        setNotes(notes.map((n) => (n._id === currentNoteId ? updatedData : n)));
        toast.success("Đã cập nhật ghi chú!");
      } else {
        const data = await createNote(newNote);
        setNotes([data, ...notes]);
        toast.success("Đã thêm ghi chú mới!");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      try {
        await deleteNote(id);
        setNotes(notes.filter((n) => n._id !== id));
        toast.success('Đã xóa thành công!');
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="home-container">
      {}
      <div className="home-action-bar">
        <h2>Ghi chú của tôi</h2>
        <button className="btn-add" onClick={handleOpenAddModal}>
          <Plus size={20} /> Tạo ghi chú mới
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <div className="notes-grid">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note._id} className="note-card">
                <div className="note-body">
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </div>
                <div className="note-footer">
                  <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                  <div className="note-actions">
                    <button className="action-btn edit" onClick={() => handleEditClick(note)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(note._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Bạn chưa có ghi chú nào. Hãy nhấn "Tạo ghi chú mới" để bắt đầu!</p>
            </div>
          )}
        </div>
      )}

      {}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Chỉnh sửa ghi chú' : 'Ghi chú mới'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSaveNote}>
              <input 
                type="text" 
                placeholder="Tiêu đề..." 
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                required 
              />
              <textarea 
                placeholder="Nội dung ghi chú..." 
                rows="6"
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                required
              ></textarea>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-save">
                  {isEditing ? 'Cập nhật' : 'Lưu ghi chú'}
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