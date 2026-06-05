"use client";

import { useState, useEffect } from "react";
import { showToast } from "@/lib/toast";

interface Folder {
  id: string;
  name: string;
  recordingCount: number;
}

export function FolderManager() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      const data = await res.json();
      setFolders(data);
    } catch (error) {
      showToast("Failed to load folders", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (!res.ok) throw new Error("Failed to create folder");
      const folder = await res.json();
      setFolders([...folders, { ...folder, recordingCount: 0 }]);
      setNewFolderName("");
      showToast("Folder created successfully", "success");
    } catch (error) {
      showToast("Failed to create folder", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });

      if (!res.ok) throw new Error("Failed to update folder");
      const updated = await res.json();
      setFolders(
        folders.map((f) => (f.id === id ? { ...f, name: updated.name } : f))
      );
      setEditingId(null);
      showToast("Folder updated", "success");
    } catch (error) {
      showToast("Failed to update folder", "error");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder?")) return;

    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete folder");
      setFolders(folders.filter((f) => f.id !== id));
      showToast("Folder deleted", "success");
    } catch (error) {
      showToast("Failed to delete folder", "error");
    }
  };

  if (loading) return <div>Loading folders...</div>;

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreateFolder} className="flex gap-2">
        <input
          type="text"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </form>

      <div className="space-y-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex items-center justify-between p-3 rounded border border-gray-200 dark:border-gray-700"
          >
            {editingId === folder.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border dark:bg-gray-700"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdateFolder(folder.id)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium">{folder.name}</p>
                  <p className="text-sm text-gray-500">
                    {folder.recordingCount} recording
                    {folder.recordingCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(folder.id);
                      setEditingName(folder.name);
                    }}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
