import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";

interface NewProcessViewProps {
  onCreated: (newProcessId?: string, processName?: string) => void;
  onErrorToast?: (title: string, subtitle: string) => void;
  initialCreating?: boolean;
}

export function NewProcessView({ onCreated, onErrorToast, initialCreating = false }: NewProcessViewProps) {
  const [isModalMounted, setIsModalMounted] = useState(initialCreating);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsModalMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  };

  const closeModal = () => {
    setIsModalVisible(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setIsModalMounted(false);
    }, 200);
  };

  useEffect(() => {
    if (initialCreating) {
      openModal();
    }
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [initialCreating]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalMounted) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalMounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      onErrorToast?.("Process name required", "The process name cannot be empty.");
      return;
    }
    if (!industry.trim()) {
      onErrorToast?.("Industry required", "The industry field cannot be empty.");
      return;
    }
    if (!description.trim()) {
      onErrorToast?.("Process description required", "The process description cannot be empty.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const processName = name.trim();
      const created = await api.createProcess({
        name: processName,
        industry: industry.trim(),
        description: description.trim(),
      });
      setName("");
      setIndustry("");
      setDescription("");
      closeModal();
      onCreated(created.id, processName);
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      onErrorToast?.("Failed to create process", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full relative flex items-center justify-center p-8">
      {/* ── Main Landing / Empty State ─────────────────────────────── */}
      <div className="max-w-md animate-fade-in text-left">
        {/* Linear 3D Cubes Illustration */}
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 91 95"
            aria-label="No projects illustration"
            className="w-16 h-16 text-slate-400"
          >
            <path fill="#1a1a1e" fillRule="evenodd" d="M10.7 49c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9C0 70.3 0 69 0 66.2v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Z" clipRule="evenodd"></path>
            <path fill="#8A8F98" fillRule="evenodd" d="M10.7 49c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9C0 70.3 0 69 0 66.2v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Zm13.4 1.3 3.6 2a18 18 0 0 1 4.4 2.7l.7.7L22 61.1l-.8.4c-2 1-4.4 1-6.4 0l-1-.4-11-5.5.5-.6c.8-.7 1.8-1.3 4.4-2.7l3.7-2a19 19 0 0 1 4.8-2.2c1-.2 2-.2 3 0 1.2.2 2.2.8 4.9 2.2ZM2 56.8l-.3.6c-.3 1-.3 2-.3 4.8v4c0 2.8 0 3.9.3 4.8.4.9.9 1.7 1.5 2.4.8.8 1.8 1.3 4.4 2.7l3.7 2a19 19 0 0 0 4.8 2.2l.8.1.2-11.4c0-2.8-1.5-5.3-4-6.6l-11-5.6Zm16.6 23.6.6-.1c1-.2 2.1-.8 4.8-2.2l3.6-2a18 18 0 0 0 4.4-2.7 6 6 0 0 0 1.5-2.4c.4-.9.4-2 .4-4.8v-4a15.7 15.7 0 0 0-.5-5.1l-10.9 5.4a7.2 7.2 0 0 0-3.9 6.4v11.5Z" clipRule="evenodd"></path>
            <path fill="#1a1a1e" fillRule="evenodd" d="M56.7 49c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Z" clipRule="evenodd"></path>
            <path fill="#8A8F98" fillRule="evenodd" d="M56.7 49c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Zm13.4 1.3 3.6 2a18 18 0 0 1 4.4 2.7l.7.7L68 61.1l-.8.4c-2 1-4.4 1-6.4 0l-1-.4-11-5.5.5-.6c.8-.7 1.8-1.3 4.4-2.7l3.7-2a19 19 0 0 1 4.8-2.2c1-.2 2-.2 3 0 1.2.2 2.2.8 4.9 2.2Zm-22 6.5-.3.6c-.3 1-.3 2-.3 4.8v4c0 2.8 0 3.9.3 4.8.4.9.9 1.7 1.5 2.4.8.8 1.8 1.3 4.4 2.7l3.7 2a19 19 0 0 0 4.8 2.2l.8.1.2-11.4c0-2.8-1.5-5.3-4-6.6l-11.1-5.6Zm16.6 23.6.6-.1c1-.2 2.1-.8 4.8-2.2l3.6-2a18 18 0 0 0 4.4-2.7 6 6 0 0 0 1.5-2.4c.4-.9.4-2 .4-4.8v-4a15.7 15.7 0 0 0-.5-5.1l-10.9 5.4a7.2 7.2 0 0 0-3.8 6.4v11.5Z" clipRule="evenodd"></path>
            <path fill="#1a1a1e" fillRule="evenodd" d="M33.7 62c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Z" clipRule="evenodd"></path>
            <path fill="#8A8F98" fillRule="evenodd" d="M33.7 62c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Zm13.4 1.3 3.6 2a18 18 0 0 1 4.4 2.7l.7.7L45 74.1l-.8.4c-2 1-4.4 1-6.4 0l-1-.4-11-5.5.5-.6c.8-.7 1.8-1.3 4.4-2.7l3.7-2a19 19 0 0 1 4.8-2.2c1-.2 2-.2 3 0 1.2.2 2.2.8 4.9 2.2Zm-22 6.5-.3.6c-.3 1-.3 2-.3 4.8v4c0 2.8 0 3.9.3 4.8.4.9.9 1.7 1.5 2.4.8.8 1.8 1.3 4.4 2.7l3.7 2a19 19 0 0 0 4.8 2.2l.8.1.2-11.4c0-2.8-1.5-5.3-4-6.6l-11.1-5.6Zm16.6 23.6.6-.1c1-.2 2.1-.8 4.8-2.2l3.6-2a18 18 0 0 0 4.4-2.7 6 6 0 0 0 1.5-2.4c.4-.9.4-2 .4-4.8v-4a15.7 15.7 0 0 0-.5-5.1l-10.9 5.4a7.2 7.2 0 0 0-3.9 6.4v11.5Z" clipRule="evenodd"></path>
            <path fill="#1a1a1e" fillRule="evenodd" d="M33.7 12c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Z" clipRule="evenodd"></path>
            <path fill="#8A8F98" fillRule="evenodd" d="M33.7 12c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Zm13.4 1.3 3.6 2a18 18 0 0 1 4.4 2.7l.7.7L45 24.1l-.8.4c-2 1-4.4 1-6.4 0l-1-.4-11-5.5.5-.6c.8-.7 1.8-1.3 4.4-2.7l3.7-2a19 19 0 0 1 4.8-2.2c1-.2 2-.2 3 0 1.2.2 2.2.8 4.9 2.2Zm-22 6.5-.3.6c-.3 1-.3 2-.3 4.8v4c0 2.8 0 3.9.3 4.8.4.9.9 1.7 1.5 2.4.8.8 1.8 1.3 4.4 2.7l3.7 2a19 19 0 0 0 4.8 2.2l.8.1.2-11.4c0-2.8-1.5-5.3-4-6.6l-11.1-5.6Zm16.6 23.6.6-.1c1-.2 2.1-.8 4.8-2.2l3.6-2a18 18 0 0 0 4.4-2.7 6 6 0 0 0 1.5-2.4c.4-.9.4-2 .4-4.8v-4a15.7 15.7 0 0 0-.5-5.1l-10.9 5.4a7.2 7.2 0 0 0-3.9 6.4v11.5Z" clipRule="evenodd"></path>
            {/* Top-Right Cube (starts floating above and drops perfectly into place) */}
            <g className="animate-cube-drop">
              <path fill="#1a1a1e" fillRule="evenodd" d="M56.7 24c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Z" clipRule="evenodd"></path>
              <path fill="#D0D6E0" fillRule="evenodd" d="M56.7 24c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9c-.4-1.2-.4-2.6-.4-5.3v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Zm13.4 1.3 3.6 2a18 18 0 0 1 4.4 2.7l.7.7L68 36.1l-.8.4c-2 1-4.4 1-6.4 0l-1-.4-11-5.5.5-.6c.8-.7 1.8-1.3 4.4-2.7l3.7-2a19 19 0 0 1 4.8-2.2c1-.2 2-.2 3 0 1.2.2 2.2.8 4.9 2.2Zm-22 6.5-.3.6c-.3 1-.3 2-.3 4.8v4c0 2.8 0 3.9.3 4.8.4.9.9 1.7 1.5 2.4.8.8 1.8 1.3 4.4 2.7l3.7 2a19 19 0 0 0 4.8 2.2l.8.1.2-11.4c0-2.8-1.5-5.3-4-6.6l-11.1-5.6Zm16.6 23.6.6-.1c1-.2 2.1-.8 4.8-2.2l3.6-2a18 18 0 0 0 4.4-2.7 6 6 0 0 0 1.5-2.4c.4-.9.4-2 .4-4.8v-4a15.7 15.7 0 0 0-.5-5.1l-10.9 5.4a7.2 7.2 0 0 0-3.8 6.4v11.5Z" clipRule="evenodd"></path>
            </g>
            <path fill="#1a1a1e" fillRule="evenodd" d="M10.7 24c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9C0 45.3 0 44 0 41.2v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Z" clipRule="evenodd"></path>
            <path fill="#8A8F98" fillRule="evenodd" d="M10.7 24c2.6-1.4 3.9-2 5.2-2.4 1.2-.2 2.5-.2 3.7 0 1.3.3 2.6 1 5.2 2.4l3.7 2c2.5 1.3 3.8 2 4.7 3a8 8 0 0 1 1.8 2.9c.5 1.2.5 2.6.5 5.3v4c0 2.7 0 4.1-.5 5.3-.3 1.1-1 2.1-1.8 3-1 1-2.2 1.6-4.7 3l-3.7 2c-2.6 1.3-3.9 2-5.2 2.3-1.2.2-2.5.2-3.7 0a23 23 0 0 1-5.2-2.4l-3.7-2c-2.5-1.3-3.8-2-4.7-3a8 8 0 0 1-1.9-2.9C0 45.3 0 44 0 41.2v-4c0-2.7 0-4 .4-5.3.4-1 1-2 1.9-3 .9-.9 2.2-1.6 4.7-3l3.7-2Zm13.4 1.3 3.6 2a18 18 0 0 1 4.4 2.7l.7.7L22 36.1l-.8.4c-2 1-4.4 1-6.4 0l-1-.4-11-5.5.5-.6c.8-.7 1.8-1.3 4.4-2.7l3.7-2a19 19 0 0 1 4.8-2.2c1-.2 2-.2 3 0 1.2.2 2.2.8 4.9 2.2ZM2 31.8l-.3.6c-.3 1-.3 2-.3 4.8v4c0 2.8 0 3.9.3 4.8.4.9.9 1.7 1.5 2.4.8.8 1.8 1.3 4.4 2.7l3.7 2a19 19 0 0 0 4.8 2.2l.8.1.2-11.4c0-2.8-1.5-5.3-4-6.6l-11-5.6Zm16.6 23.6.6-.1c1-.2 2.1-.8 4.8-2.2l3.6-2a18 18 0 0 0 4.4-2.7 6 6 0 0 0 1.5-2.4c.4-.9.4-2 .4-4.8v-4a15.7 15.7 0 0 0-.5-5.1l-10.9 5.4a7.2 7.2 0 0 0-3.9 6.4v11.5Z" clipRule="evenodd"></path>
            <path fill="#1a1a1e" fillRule="evenodd" d="M33.7 37.05C36.3 35.65 37.6 35.05 38.9 34.65C40.1 34.45 41.4 34.45 42.6 34.65C43.9 34.95 45.2 35.65 47.8 37.05L51.5 39.05C54 40.35 55.3 41.05 56.2 42.05C57.0016 42.8759 57.6156 43.8651 58 44.95C58.5 46.15 58.5 47.55 58.5 50.25V54.25C58.5 56.95 58.5 58.35 58 59.55C57.7 60.65 57 61.65 56.2 62.55C55.2 63.55 54 64.15 51.5 65.55L47.8 67.55C45.2 68.85 43.9 69.55 42.6 69.85C41.4 70.05 40.1 70.05 38.9 69.85C37.0734 69.2698 35.3266 68.4635 33.7 67.45L30 65.45C27.5 64.15 26.2 63.45 25.3 62.45C24.4623 61.6338 23.8137 60.6439 23.4 59.55C23 58.35 23 56.95 23 54.25V50.25C23 47.55 23 46.25 23.4 44.95C23.8 43.95 24.4 42.95 25.3 41.95C26.2 41.05 27.5 40.35 30 38.95L33.7 36.95V37.05Z" clipRule="evenodd"></path>
            <path fill="#8A8F98" fillRule="evenodd" d="M33.7 37.05C36.3 35.65 37.6 35.05 38.9 34.65C40.1 34.45 41.4 34.45 42.6 34.65C43.9 34.95 45.2 35.65 47.8 37.05L51.5 39.05C54 40.35 55.3 41.05 56.2 42.05C57.0016 42.8759 57.6156 43.8651 58 44.95C58.5 46.15 58.5 47.55 58.5 50.25V54.25C58.5 56.95 58.5 58.35 58 59.55C57.7 60.65 57 61.65 56.2 62.55C55.2 63.55 54 64.15 51.5 65.55L47.8 67.55C45.2 68.85 43.9 69.55 42.6 69.85C41.4 70.05 40.1 70.05 38.9 69.85C37.0734 69.2698 35.3266 68.4635 33.7 67.45L30 65.45C27.5 64.15 26.2 63.45 25.3 62.45C24.4623 61.6338 23.8137 60.6439 23.4 59.55C23 58.35 23 56.95 23 54.25V50.25C23 47.55 23 46.25 23.4 44.95C23.8 43.95 24.4 42.95 25.3 41.95C26.2 41.05 27.5 40.35 30 38.95L33.7 36.95V37.05ZM47.1 38.35L50.7 40.35C52.2888 41.0339 53.7707 41.9433 55.1 43.05L55.8 43.75L45 49.15L44.2 49.55C42.2 50.55 39.8 50.55 37.8 49.55L36.8 49.15L25.8 43.65L26.3 43.05C27.1 42.35 28.1 41.75 30.7 40.35L34.4 38.35C35.8898 37.3968 37.5054 36.6564 39.2 36.15C40.2 35.95 41.2 35.95 42.2 36.15C43.4 36.35 44.4 36.95 47.1 38.35ZM25.1 44.85L24.8 45.45C24.5 46.45 24.5 47.45 24.5 50.25V54.25C24.5 57.05 24.5 58.15 24.8 59.05C25.2 59.95 25.7 60.75 26.3 61.45C27.1 62.25 28.1 62.75 30.7 64.15L34.4 66.15C35.8898 67.1032 37.5054 67.8437 39.2 68.35L40 68.45L40.2 57.05C40.2 54.25 38.7 51.75 36.2 50.45L25.1 44.85ZM41.7 68.45L42.3 68.35C43.3 68.15 44.4 67.55 47.1 66.15L50.7 64.15C52.2888 63.4661 53.7707 62.5567 55.1 61.45C55.7842 60.7811 56.2985 59.9582 56.6 59.05C57 58.15 57 57.05 57 54.25V50.25C57.1138 48.5341 56.9449 46.8111 56.5 45.15L45.6 50.55C44.425 51.1559 43.4396 52.0736 42.7516 53.2026C42.0637 54.3315 41.6999 55.628 41.7 56.95V68.45Z" clipRule="evenodd"></path>
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-100 mb-2">Process Intelligence</h2>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
          Select or create a process to analyze it with our multi-step AI reasoning pipeline. Each process is broken down, evaluated, and redesigned for the future.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={openModal}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-indigo-500/90 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 shadow-sm"
          >
            <span>Create new process</span>
          </button>
        </div>
      </div>

      {/* ── Exact Linear "New Process" Modal ──────────────────────── */}
      {isModalMounted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          {/* Subtle Dimming Backdrop — clean & transparent like Linear */}
          <div
            className={`absolute inset-0 bg-black/25 backdrop-blur-[1px] transition-opacity duration-200 ease-out ${
              isModalVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={closeModal}
          />

          {/* Modal Container — smooth centered subtle scale + fade in place (NO slide) */}
          <div
            style={{
              transitionTimingFunction: isModalVisible
                ? "cubic-bezier(0.16, 1, 0.3, 1)"
                : "cubic-bezier(0.4, 0, 1, 1)",
            }}
            className={`relative w-full max-w-3xl bg-[#141517] border border-white/[0.08] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col min-h-[540px] transition-all duration-200 transform ${
              isModalVisible
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-[0.97] pointer-events-none"
            }`}
            style-maxheight="calc(100vh - 48px)"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] text-sm">
              <span className="font-semibold text-slate-200">New Process</span>

              <button
                type="button"
                onClick={closeModal}
                className="w-7 h-7 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-200 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Content Area */}
            <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-8 space-y-5 flex-1">
                {/* Exact Golden-Yellow Cube Icon Badge */}
                <div className="w-10 h-10 rounded-md bg-[#2D2817] border border-[#4D421F] flex items-center justify-center shadow-inner">
                  <svg
                    className="w-5 h-5 text-[#F5B800]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>

                {/* Process Name (Large Borderless Input) */}
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Process name"
                    autoFocus
                    className="w-full bg-transparent border-0 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-0 px-0"
                  />
                </div>

                {/* Industry / Short summary */}
                <div>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Add industry (e.g. Regulated Electronics Manufacturing)..."
                    className="w-full bg-transparent border-0 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 px-0"
                  />
                </div>

                {/* Process Description Textarea */}
                <div className="pt-3">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe current workflow in detail: sequence of steps, handoffs, tools, and friction points..."
                    rows={10}
                    className="w-full bg-transparent border-0 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-0 px-0 resize-none leading-relaxed"
                  />
                </div>

                {error && (
                  <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-white/[0.06] bg-[#101112] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.06] hover:bg-white/[0.1] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create process"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
