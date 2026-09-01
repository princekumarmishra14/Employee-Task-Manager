"use client";

import React, { useState } from "react";
import { X, Send, User2, Calendar, Clock, AlertCircle, FileText, MessageSquare } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Task } from "@/types/task.types";
import { useDBStore } from "@/store/dbStore";

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailDrawer({ task, onClose }: TaskDetailDrawerProps) {
  const { t, isRtl } = useTranslation();
  const { comments, addComment, departments, teams, projects } = useDBStore();
  const [commentContent, setCommentContent] = useState("");

  if (!task) return null;

  // Filter comments for this task
  const taskComments = comments.filter((c) => c.taskId === task.id);

  // Department name
  const deptName = task.department || "-";

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim() === "") return;
    addComment(task.id, commentContent.trim());
    setCommentContent("");
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "LOW": return "bg-bg-tertiary text-text-secondary border-border-clean";
      case "MEDIUM": return "bg-status-info-bg text-status-info border-status-info/20";
      case "HIGH": return "bg-status-warning-bg text-status-warning border-status-warning/20";
      case "ESCALATED": return "bg-status-danger-bg text-status-danger border-status-danger/20 animate-pulse";
      default: return "bg-bg-secondary text-text-secondary border-border-clean";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm font-poppins select-none">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className={`relative w-full max-w-md bg-bg-primary p-6 shadow-2xl h-full overflow-y-auto flex flex-col border-l border-border-clean transition-transform ${
          isRtl ? "animate-slide-in-left" : "animate-slide-in-right"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-clean pb-4 mb-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-brand-primary shrink-0" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
              {task.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-tertiary transition-all focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Task Title & Description */}
        <div className="space-y-3 mb-6">
          <h2 className="text-base font-bold text-text-primary leading-normal">
            {task.title}
          </h2>
          <p className="text-xs text-text-secondary bg-bg-secondary p-4 rounded-xl border border-border-clean/50 leading-relaxed font-semibold whitespace-pre-line">
            {task.description || (isRtl ? "لا يوجد وصف لهذه المهمة." : "No description provided for this task.")}
          </p>
        </div>

        {/* Task Metadata Fields */}
        <div className="grid gap-3.5 border-y border-border-clean py-5 mb-6 text-[11px] font-semibold text-text-secondary">
          <div className="flex items-center justify-between">
            <span className="text-text-muted uppercase tracking-wider">{t.taskStatus}:</span>
            <span className="uppercase text-brand-primary font-bold">{task.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted uppercase tracking-wider">{t.taskPriority}:</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted uppercase tracking-wider">{isRtl ? "القسم" : "Department"}:</span>
            <span className="truncate max-w-[200px] text-text-primary">{deptName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted uppercase tracking-wider">{isRtl ? "المسؤول" : "Assigned To"}:</span>
            <div className="flex items-center gap-2">
              {task.assignedTo ? (
                <>
                  <img
                    src={task.assignedTo.avatarUrl}
                    alt={task.assignedTo.name}
                    className="h-5 w-5 rounded-full object-cover border border-border-clean shadow-sm"
                  />
                  <span className="text-text-primary">{task.assignedTo.name}</span>
                </>
              ) : (
                <span className="italic text-text-muted">{t.taskUnassigned}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-muted uppercase tracking-wider">{isRtl ? "تاريخ التسليم" : "Due Date"}:</span>
            <span className="text-text-primary">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-brand-primary" />
            <span>{isRtl ? "المناقشات والتعليقات" : "Task Discussions"}</span>
          </h4>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-3.5 mb-4 pr-1">
            {taskComments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border-clean bg-bg-secondary p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-text-primary">
                    {comment.authorName}
                  </span>
                  <span className="text-[9px] text-text-muted font-bold">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  {comment.content}
                </p>
              </div>
            ))}

            {taskComments.length === 0 && (
              <div className="py-8 text-center text-xs text-text-muted border border-dashed border-border-clean rounded-xl bg-bg-secondary/40">
                {isRtl ? "لا توجد مناقشات بعد. كن أول من يعلق!" : "No discussions yet. Start the conversation!"}
              </div>
            )}
          </div>

          {/* Comment Form Input */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={isRtl ? "اكتب تعليقاً..." : "Write a comment..."}
              className="flex-1 rounded-xl border border-border-clean bg-bg-secondary px-3 py-2 text-xs text-text-primary outline-none focus:border-brand-primary focus:bg-bg-primary transition-all font-semibold"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-bg-primary hover:bg-brand-secondary transition-all shadow-sm focus:outline-none shrink-0 cursor-pointer active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
