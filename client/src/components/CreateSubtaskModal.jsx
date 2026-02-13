import { useState } from 'react';
import { createPortal } from 'react-dom';
import { subtasksApi } from '../services/api';

export function CreateSubtaskModal({ taskId, onClose, onCreate }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [type, setType] = useState('multiple_choice');
  const [providedFile, setProvidedFile] = useState('no_file');
  const [fileReference, setFileReference] = useState('');

  const handleCreate = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const subtaskData = {
      taskId,
      question,
      type,
      provided_file: providedFile,
    };

    if (type === 'multiple_choice' && options.trim()) {
      const optionList = options
        .split('\n')
        .map(o => o.trim())
        .filter(o => o.length > 0);
      
      if (optionList.length === 0) {
        alert('Please enter at least one option for multiple choice');
        return;
      }
      subtaskData.options = optionList;
    }

    if (providedFile !== 'no_file') {
      if (!fileReference.trim()) {
        alert('Please enter a file reference');
        return;
      }
      subtaskData.file_reference = fileReference.trim();
    }

    try {
      await subtasksApi.create(subtaskData);
      onCreate();
      onClose();
    } catch (err) {
      alert('Failed to create subtask: ' + err.message);
    }
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Create Subtask</h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div style={styles.form}>
          <label style={styles.label}>Type:</label>
          <div style={styles.typeButtons}>
            <button
              style={{
                ...styles.typeButton,
                ...(type === 'multiple_choice' ? styles.typeButtonActive : {})
              }}
              onClick={() => setType('multiple_choice')}
            >
              Multiple Choice
            </button>
            <button
              style={{
                ...styles.typeButton,
                ...(type === 'open_answer' ? styles.typeButtonActive : {})
              }}
              onClick={() => setType('open_answer')}
            >
              Open Answer
            </button>
          </div>

          <input
            type="text"
            placeholder="Question or decision to make"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={styles.input}
          />

          {type === 'multiple_choice' && (
            <>
              <label style={styles.label}>Options (one per line):</label>
              <textarea
                placeholder="Option 1\nOption 2\nOption 3"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                style={styles.textarea}
              />
            </>
          )}

          <label style={styles.label}>📁 File Reference:</label>
          <select
            value={providedFile}
            onChange={(e) => setProvidedFile(e.target.value)}
            style={styles.select}
          >
            <option value="no_file">No File</option>
            <option value="emailed">Emailed</option>
            <option value="on_disk">On Disk</option>
          </select>

          {providedFile !== 'no_file' && (
            <input
              type="text"
              placeholder={
                providedFile === 'emailed'
                  ? "Email subject (e.g., 'Report Attached')"
                  : "File path (e.g., '/documents/report.pdf')"
              }
              value={fileReference}
              onChange={(e) => setFileReference(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <div style={styles.buttons}>
            <button onClick={handleCreate} style={styles.createButton}>
              Create Subtask
            </button>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
    animation: 'fadeIn 200ms var(--easing-emphasized-decelerate)',
  },
  modal: {
    backgroundColor: 'var(--color-surface-1)',
    borderRadius: 'var(--radius-xxl)',
    padding: 'var(--spacing-xl)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: 'var(--elevation-3)',
    animation: 'scaleIn 250ms var(--easing-emphasized-decelerate)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-lg)',
  },
  title: {
    margin: 0,
    font: 'var(--headline-small)',
    fontWeight: '400',
    color: 'var(--color-text-primary)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 'var(--spacing-xs)',
    borderRadius: 'var(--radius-full)',
    transition: 'background-color var(--duration-short) var(--easing-standard)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  label: {
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
  },
  typeButtons: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
  },
  typeButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-md)',
    border: '2px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-1)',
    cursor: 'pointer',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  typeButtonActive: {
    borderColor: 'var(--color-primary-60)',
    backgroundColor: 'var(--color-primary-90)',
    color: 'var(--color-primary-30)',
  },
  input: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  textarea: {
    width: '100%',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    minHeight: '100px',
    resize: 'vertical',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  select: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  buttons: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-lg)',
  },
  createButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  cancelButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
};