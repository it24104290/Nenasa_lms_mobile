import React, { useState, useEffect } from 'react';
import api, { buildBackendUrl } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function LessonsPage() {
  const { user } = useAuth();
  const role = String(user?.role || '').toUpperCase();
  const canManageLessons = role === 'TEACHER' || role === 'ADMIN' || role === 'ROLE_TEACHER' || role === 'ROLE_ADMIN';
  const [lessons, setLessons] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    classId: '',
    videoFile: null,
    pdfFile: null,
    notesFile: null
  });
  const [uploading, setUploading] = useState({});
  const [classes, setClasses] = useState([]);
  const [editLesson, setEditLesson] = useState({
    title: '',
    description: '',
    classId: ''
  });

  const getClassId = (cls) => cls?.id || cls?._id || '';

  useEffect(() => {
    fetchLessons();
    if (canManageLessons) {
      fetchClasses();
    }
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await api.get('/lessons');
      setLessons(response.data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to load lessons.';
      setStatus({ type: 'error', message: String(message) });
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setStatus(null);
    setCreating(true);
    try {
      const payload = {
        title: newLesson.title,
        description: newLesson.description,
      };
      const classId = newLesson.classId?.trim();
      const isValidClassId = !classId || classes.some((cls) => getClassId(cls) === classId);
      if (!isValidClassId) {
        setStatus({ type: 'error', message: 'Please select a valid class.' });
        return;
      }

      const lessonResponse = await api.post('/lessons', payload, {
        params: { classId: classId || undefined }
      });

      const createdLessonId = lessonResponse.data?.id || lessonResponse.data?._id;

      // Upload files if selected
      if (createdLessonId) {
        if (newLesson.videoFile) {
          try {
            await handleFileUpload(createdLessonId, newLesson.videoFile, 'video');
          } catch (error) {
            console.error('Error uploading video:', error);
          }
        }
        if (newLesson.pdfFile) {
          try {
            await handleFileUpload(createdLessonId, newLesson.pdfFile, 'pdf');
          } catch (error) {
            console.error('Error uploading pdf:', error);
          }
        }
        if (newLesson.notesFile) {
          try {
            await handleFileUpload(createdLessonId, newLesson.notesFile, 'notes');
          } catch (error) {
            console.error('Error uploading notes:', error);
          }
        }
      }

      setNewLesson({ title: '', description: '', classId: '', videoFile: null, pdfFile: null, notesFile: null });
      setShowCreateForm(false);
      setStatus({ type: 'success', message: 'Lesson created and files uploaded successfully.' });
      fetchLessons();
    } catch (error) {
      console.error('Error creating lesson:', error);
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to create lesson.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setCreating(false);
    }
  };

  const handleFileUpload = async (lessonId, file, type) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(prev => ({ ...prev, [lessonId]: true }));
    setStatus(null);

    try {
      const response = await api.post(`/lessons/${lessonId}/upload/${type}`, formData);

      // Update the lesson with the new URL
      setLessons(prev => prev.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, [`${type}Url`]: response.data }
          : lesson
      ));
      setStatus({ type: 'success', message: `${type.toUpperCase()} uploaded successfully.` });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      const message = error?.response?.data?.message || error?.response?.data || `Failed to upload ${type}.`;
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setUploading(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    setStatus(null);
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons(prev => prev.filter(lesson => lesson.id !== lessonId));
      setStatus({ type: 'success', message: 'Lesson deleted successfully.' });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to delete lesson.';
      setStatus({ type: 'error', message: String(message) });
    }
  };

  const openEditLesson = (lesson) => {
    const classId = lesson?.tuitionClass?.id || lesson?.tuitionClass?._id || '';
    setEditLesson({
      title: lesson?.title || '',
      description: lesson?.description || '',
      classId
    });
    setEditingLessonId(lesson.id);
    setStatus(null);
  };

  const handleSaveLesson = async (e, lesson) => {
    e.preventDefault();
    setSavingEdit(true);
    setStatus(null);
    try {
      const payload = {
        title: editLesson.title,
        description: editLesson.description,
        // Keep existing file URLs so update does not clear them.
        pdfUrl: lesson.pdfUrl || null,
        videoUrl: lesson.videoUrl || null,
        notesUrl: lesson.notesUrl || null
      };
      const classId = editLesson.classId?.trim();
      const isValidClassId = !classId || classes.some((cls) => getClassId(cls) === classId);
      if (!isValidClassId) {
        setStatus({ type: 'error', message: 'Please select a valid class.' });
        return;
      }
      const response = await api.put(`/lessons/${lesson.id}`, payload, {
        params: { classId: classId || undefined }
      });

      setLessons((prev) => prev.map((item) => (item.id === lesson.id ? response.data : item)));
      setEditingLessonId(null);
      setEditLesson({ title: '', description: '', classId: '' });
      setStatus({ type: 'success', message: 'Lesson updated successfully.' });
    } catch (error) {
      console.error('Error updating lesson:', error);
      const message = error?.response?.data?.message || error?.response?.data || 'Failed to update lesson.';
      setStatus({ type: 'error', message: String(message) });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Lessons Portal</h1>
        {canManageLessons && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md"
          >
            Create New Lesson
          </button>
        )}
      </div>

      {status && (
        <div className={`p-4 rounded-xl border text-sm ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          {status.message}
        </div>
      )}

      {showCreateForm && canManageLessons && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Create New Lesson</h2>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={newLesson.title}
                onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
              <select
                value={newLesson.classId}
                onChange={(e) => setNewLesson(prev => ({ ...prev, classId: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- No Class (Optional) --</option>
                {classes.map(cls => (
                  <option key={getClassId(cls)} value={getClassId(cls)}>
                    {cls.name} - Grade {cls.grade} ({cls.subjectId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Video Recording</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setNewLesson(prev => ({ ...prev, videoFile: e.target.files[0] || null }))}
                className="w-full text-sm"
              />
              {newLesson.videoFile && (
                <p className="text-sm text-emerald-600 mt-1">✓ {newLesson.videoFile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Lesson PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setNewLesson(prev => ({ ...prev, pdfFile: e.target.files[0] || null }))}
                className="w-full text-sm"
              />
              {newLesson.pdfFile && (
                <p className="text-sm text-emerald-600 mt-1">✓ {newLesson.pdfFile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Notes</label>
              <input
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={(e) => setNewLesson(prev => ({ ...prev, notesFile: e.target.files[0] || null }))}
                className="w-full text-sm"
              />
              {newLesson.notesFile && (
                <p className="text-sm text-emerald-600 mt-1">✓ {newLesson.notesFile.name}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {creating ? 'Creating...' : 'Create Lesson'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map(lesson => (
          <div key={lesson.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            {canManageLessons && editingLessonId === lesson.id ? (
              <form onSubmit={(e) => handleSaveLesson(e, lesson)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editLesson.title}
                    onChange={(e) => setEditLesson((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editLesson.description}
                    onChange={(e) => setEditLesson((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Class</label>
                  <select
                    value={editLesson.classId}
                    onChange={(e) => setEditLesson((prev) => ({ ...prev, classId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- No Class (Optional) --</option>
                    {classes.map((cls) => (
                      <option key={getClassId(cls)} value={getClassId(cls)}>
                        {cls.name} - Grade {cls.grade} ({cls.subjectId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {savingEdit ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLessonId(null);
                      setEditLesson({ title: '', description: '', classId: '' });
                    }}
                    className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{lesson.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{lesson.description}</p>
              </>
            )}

            {!canManageLessons && (
              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium text-slate-700">Teacher Uploaded Materials</p>

                {lesson.videoUrl ? (
                  <div>
                    <p className="block text-sm font-medium text-slate-700 mb-2">Video Lesson</p>
                    <video
                      controls
                      className="w-full rounded-lg border border-slate-200"
                      src={buildBackendUrl(lesson.videoUrl)}
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Video: Not uploaded yet</p>
                )}

                {lesson.pdfUrl ? (
                  <a
                    href={buildBackendUrl(lesson.pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    Open Lesson PDF
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">PDF: Not uploaded yet</p>
                )}

                {lesson.notesUrl ? (
                  <a
                    href={buildBackendUrl(lesson.notesUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    Open Lesson Notes
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">Notes: Not uploaded yet</p>
                )}
              </div>
            )}

            {canManageLessons && editingLessonId !== lesson.id && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-slate-700">Uploaded Materials</p>
                {lesson.videoUrl ? (
                  <a
                    href={buildBackendUrl(lesson.videoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    View Video
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">Video: Not uploaded yet</p>
                )}
                {lesson.pdfUrl ? (
                  <a
                    href={buildBackendUrl(lesson.pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    View PDF
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">PDF: Not uploaded yet</p>
                )}
                {lesson.notesUrl ? (
                  <a
                    href={buildBackendUrl(lesson.notesUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    View Notes
                  </a>
                ) : (
                  <p className="text-sm text-slate-500">Notes: Not uploaded yet</p>
                )}
              </div>
            )}

            {uploading[lesson.id] && (
              <div className="mt-3 text-sm text-indigo-600">Uploading...</div>
            )}

            {canManageLessons && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4">
                <button
                  onClick={() => openEditLesson(lesson)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                >
                  Edit Lesson
                </button>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="text-rose-600 hover:text-rose-700 text-sm font-semibold"
                >
                  Delete Lesson
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {lessons.length === 0 && !showCreateForm && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-700">No Lessons Created Yet</h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto">
            {canManageLessons
              ? 'Start by creating your first lesson and uploading class recordings, materials, and notes.'
              : 'No lessons are available yet. Your teacher will publish video lessons and PDF materials here.'}
          </p>
        </div>
      )}
    </div>
  );
}
