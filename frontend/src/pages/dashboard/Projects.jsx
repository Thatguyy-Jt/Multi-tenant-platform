import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import ProjectCard from '../../components/dashboard/ProjectCard';
import ProjectForm from '../../components/dashboard/ProjectForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { cn } from '../../lib/utils';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isAdminOrOwner = user?.role === 'owner' || user?.role === 'admin';
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/projects');
      if (response.data?.success) {
        setProjects(response.data.data.projects || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (editingProject) {
        // Update existing project
        await api.put(`/projects/${editingProject._id}`, data);
      } else {
        // Create new project
        await api.post('/projects', data);
      }
      
      setIsFormOpen(false);
      setEditingProject(null);
      fetchProjects(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (project) => {
    setDeleteConfirm(project);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.delete(`/projects/${deleteConfirm._id}`);
      setDeleteConfirm(null);
      fetchProjects(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and search projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading projects..." />
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
              Projects
            </h1>
            <p className="text-zinc-400">
              Manage your organization's projects
            </p>
          </div>
          {isAdminOrOwner && (
            <Button variant="primary" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </motion.div>

      {error && !isFormOpen && (
        <motion.div variants={fadeInUp} className="mb-6">
          <ErrorMessage message={error} variant="banner" />
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div variants={fadeInUp} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>
      </motion.div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <motion.div variants={fadeInUp} className="text-center py-12">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 inline-block">
            <p className="text-zinc-400 mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No projects match your filters'
                : 'No projects yet'}
            </p>
            {isAdminOrOwner && !searchQuery && statusFilter === 'all' && (
              <Button variant="primary" onClick={handleCreate} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={isAdminOrOwner}
              canDelete={isOwner}
              delay={index * 0.05}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
          setError('');
        }}
        onSubmit={handleFormSubmit}
        project={editingProject}
        isSubmitting={isSubmitting}
        error={error}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to delete <strong className="text-white">{deleteConfirm?.name}</strong>? 
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
              {isSubmitting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Projects;
