import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { EditorProvider } from '@/cms/context/EditorContext'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/editor.css'
import '@/styles/canvas-editor.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <EditorProvider>
      <App />
    </EditorProvider>
  </BrowserRouter>
)
