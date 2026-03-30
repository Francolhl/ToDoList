import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { getRecommendations } from './recommendations';

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('focus-tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');

  // Derived state for better UX
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  useEffect(() => {
    localStorage.setItem('focus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const recommendations = useMemo(
    () => getRecommendations(inputValue, tasks),
    [inputValue, tasks]
  );

  const addTaskByText = (text) => {
    const clean = String(text).trim();
    if (!clean) return;
    setTasks((prev) => [
      { id: crypto.randomUUID(), text: clean, completed: false },
      ...prev,
    ]);
  };

  const addTask = (e) => {
    e.preventDefault();
    const cleanText = inputValue.trim();
    if (!cleanText) return;

    const newTask = {
      id: crypto.randomUUID(),
      text: cleanText,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
  };

  const confirmPrimarySuggestion = () => {
    if (!recommendations?.primary) return;
    addTaskByText(recommendations.primary);
  };

  const addAlternative = (label) => {
    addTaskByText(label);
  };

  const addAllSuggestions = () => {
    if (!recommendations) return;
    const labels = [recommendations.primary, ...recommendations.alternatives].filter(
      Boolean
    );
    if (labels.length === 0) return;
    const newTasks = labels.map((text) => ({
      id: crypto.randomUUID(),
      text: String(text).trim(),
      completed: false,
    }));
    setTasks((prev) => [...newTasks, ...prev]);
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  return (
    <div className="app-shell">
      <div className="todo-card">
        
        {/* Header Section */}
        <div className="todo-header">
          <div className="header-top">
            <h1 className="todo-title">Focus</h1>
            <span className="badge badge-soft">
              {activeCount} left
            </span>
          </div>
          <p className="todo-subtitle">
            {tasks.length > 0 
              ? `You have ${activeCount} task${activeCount === 1 ? '' : 's'} to finish today` 
              : "Ready to start your day?"}
          </p>
        </div>

        {/* Input Section - Offset to overlap header */}
        <div className="todo-input-wrap">
          <form onSubmit={addTask} className="todo-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new task..."
              className="todo-input"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="btn btn-primary"
            >
              Add
            </button>
          </form>

          {recommendations && (
            <div className="recommend-panel" role="region" aria-label="Related task suggestions">
              <p className="recommend-label">
                Related to “{recommendations.matchedLabel}”
              </p>
              <div className="recommend-primary-row">
                <span className="recommend-primary-text">{recommendations.primary}</span>
                <div className="recommend-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={confirmPrimarySuggestion}
                  >
                    Confirm add
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addAllSuggestions}
                  >
                    Add all
                  </button>
                </div>
              </div>
              {recommendations.alternatives.length > 0 && (
                <div className="recommend-alternatives">
                  <span className="recommend-alt-label">Or add:</span>
                  <div className="recommend-alt-chips">
                    {recommendations.alternatives.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="chip-btn"
                        onClick={() => addAlternative(label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="todo-content">
          <div className="list-toolbar">
            <h2 className="section-label">Tasks</h2>
            <div className="toolbar-right">
              <span className="badge">
                {completedCount}/{tasks.length} Done
              </span>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="btn btn-ghost"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            {['all', 'active', 'completed'].map(option => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`filter-chip ${
                  filter === option
                    ? 'filter-chip--active'
                    : ''
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          <ul className="todo-list">
            {filteredTasks.map(task => (
              <li 
                key={task.id} 
                className="task-item"
              >
                <div className="task-left">
                  <div className="task-check-wrap">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                      className="task-checkbox"
                    />
                    {/* Custom checkmark icon */}
                    <svg className="checkmark-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className={`task-text ${task.completed ? 'task-text--completed' : ''}`}>
                    {task.text}
                  </span>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="icon-btn"
                  aria-label="Delete task"
                >
                  <svg className="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {filteredTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="empty-title">
                {tasks.length === 0 ? 'All caught up!' : `No ${filter} tasks`}
              </p>
              <p className="empty-subtitle">
                {tasks.length === 0
                  ? 'Add a task to get started.'
                  : 'Try switching filters to see more tasks.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;