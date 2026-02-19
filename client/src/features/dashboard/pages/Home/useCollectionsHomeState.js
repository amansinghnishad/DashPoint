import { useRef, useState } from "react";

export default function useCollectionsHomeState() {
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorToastShown = useRef(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  return {
    collections,
    setCollections,
    total,
    setTotal,
    loading,
    setLoading,
    error,
    setError,
    errorToastShown,
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
    isCreating,
    setIsCreating,
    isEditOpen,
    setIsEditOpen,
    editingCollection,
    setEditingCollection,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    isSavingEdit,
    setIsSavingEdit,
    isDeleteOpen,
    setIsDeleteOpen,
    deletingCollection,
    setDeletingCollection,
    isDeleting,
    setIsDeleting,
  };
}
