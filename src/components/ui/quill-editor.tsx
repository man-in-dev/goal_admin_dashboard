"use client";

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function QuillEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content here...", 
  className = "",
  readOnly = false 
}: QuillEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'code-block'
  ];

  return (
    <div className={`quill-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db'
        }}
      />
      <style jsx global>{`
        .quill-editor .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .quill-editor .ql-toolbar {
          border-top: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-radius: 0.375rem 0.375rem 0 0;
        }
        
        .quill-editor .ql-container {
          border-bottom: 1px solid #d1d5db;
          border-left: 1px solid #d1d5db;
          border-right: 1px solid #d1d5db;
          border-radius: 0 0 0.375rem 0.375rem;
        }
        
        .quill-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
        
        .quill-editor .ql-toolbar .ql-stroke {
          stroke: #374151;
        }
        
        .quill-editor .ql-toolbar .ql-fill {
          fill: #374151;
        }
        
        .quill-editor .ql-toolbar button:hover .ql-stroke {
          stroke: #1f2937;
        }
        
        .quill-editor .ql-toolbar button:hover .ql-fill {
          fill: #1f2937;
        }
        
        .quill-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: #2563eb;
        }
        
        .quill-editor .ql-toolbar button.ql-active .ql-fill {
          fill: #2563eb;
        }
      `}</style>
    </div>
  );
}
