import { CollectionCard, LoadingGrid } from "./CollectionsHomeCards";
import CollectionsHomeView from "./CollectionsHomeView";
import useCollectionsHomeController from "./useCollectionsHomeController";
import useCollectionsHomeState from "./useCollectionsHomeState";
import { useToast } from "../../../../hooks/useToast";

export default function CollectionsHome({ onOpenCollection }) {
  const toast = useToast();
  const state = useCollectionsHomeState();

  const {
    getCollectionId,
    headerSubtitle,
    createCollection,
    openEdit,
    saveEdit,
    openDelete,
    openCollection,
    confirmDelete,
  } = useCollectionsHomeController({
    onOpenCollection,
    toast,
    state,
  });

  const {
    collections,
    loading,
    error,
    isCreateOpen,
    setIsCreateOpen,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
    isCreating,
    isEditOpen,
    setIsEditOpen,
    setEditingCollection,
    isSavingEdit,
    editName,
    setEditName,
    editDescription,
    setEditDescription,
    isDeleteOpen,
    deletingCollection,
    setIsDeleteOpen,
    setDeletingCollection,
    isDeleting,
  } = state;

  return (
    <CollectionsHomeView
      headerSubtitle={headerSubtitle}
      setIsCreateOpen={setIsCreateOpen}
      isCreateOpen={isCreateOpen}
      isCreating={isCreating}
      createCollection={createCollection}
      createName={createName}
      setCreateName={setCreateName}
      createDescription={createDescription}
      setCreateDescription={setCreateDescription}
      isEditOpen={isEditOpen}
      setIsEditOpen={setIsEditOpen}
      setEditingCollection={setEditingCollection}
      isSavingEdit={isSavingEdit}
      saveEdit={saveEdit}
      editName={editName}
      setEditName={setEditName}
      editDescription={editDescription}
      setEditDescription={setEditDescription}
      isDeleteOpen={isDeleteOpen}
      deletingCollection={deletingCollection}
      setIsDeleteOpen={setIsDeleteOpen}
      setDeletingCollection={setDeletingCollection}
      isDeleting={isDeleting}
      confirmDelete={confirmDelete}
      loading={loading}
      error={error}
      collections={collections}
      openCollection={openCollection}
      openEdit={openEdit}
      openDelete={openDelete}
      CollectionCardComponent={CollectionCard}
      LoadingGridComponent={LoadingGrid}
      getCollectionId={getCollectionId}
    />
  );
}
