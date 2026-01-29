import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import TaskCard from '../../components/dashboard/TaskCard';
import TaskForm from '../../components/dashboard/TaskForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const isAdminOrOwner = user?.role === 'owner' || user?.role === 'admin';

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/tasks');
      if (response.data?.success) {
        setTasks(response.data.data.tasks || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      if (response.data?.success) {
        setProjects(response.data.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, data);
      } else {
        await api.post('/tasks', data);
      }
      
      setIsFormOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (task) => {
    setDeleteConfirm(task);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.delete(`/tasks/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsDone = async (task) => {
    if (task.status === 'done') return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.put(`/tasks/${task._id}`, {
        ...task,
        status: 'done',
      });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to mark task as done');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'all' || task.projectId?._id === projectFilter || task.projectId === projectFilter;
    const matchesAssignee = assigneeFilter === 'all' || 
                           task.assigneeId?._id === assigneeFilter || 
                           task.assigneeId === assigneeFilter ||
                           (assigneeFilter === 'me' && task.assigneeId?._id === user?.id) ||
                           (assigneeFilter === 'unassigned' && !task.assigneeId);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
              Tasks
            </h1>
            <p className="text-zinc-400">
              Manage and track your organization's tasks
            </p>
          </div>
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </motion.div>

      {error && !isFormOpen && (
        <motion.div variants={fadeInUp} className="mb-6">
          <ErrorMessage message={error} variant="banner" />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={fadeInUp} className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </Select>

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          <Select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>

          <Select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </Select>
        </div>
      </motion.div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 inline-block">
            <p className="text-zinc-400 mb-2">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || assigneeFilter !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && projectFilter === 'all' && assigneeFilter === 'all' && (
              <Button variant="primary" onClick={handleCreate} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkAsDone={handleMarkAsDone}
              canDelete={isAdminOrOwner}
              canMarkAsDone={isAdminOrOwner}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
          setError('');
        }}
        onSubmit={handleFormSubmit}
        task={editingTask}
        isSubmitting={isSubmitting}
        error={error}
        currentUserId={user?.id}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete <strong className="text-white">{deleteConfirm?.title}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Tasks;
