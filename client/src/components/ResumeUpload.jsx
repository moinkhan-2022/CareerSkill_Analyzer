import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function ResumeUpload({ file, onChange }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function handleFile(nextFile) {
    if (!nextFile) return
    const isSupported = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(nextFile.type) || /\.(pdf|docx)$/i.test(nextFile.name)
    if (!isSupported) return setError('Only PDF and DOCX files are supported.')
    if (nextFile.size > MAX_FILE_SIZE) return setError('Resume must be smaller than 5 MB.')
    setError('')
    onChange(nextFile)
  }

  return <div>
    <div className="mb-2 flex items-center justify-between"><label className="field-label" htmlFor="resume-upload">Resume</label><span className="text-xs text-slate-500">PDF or DOCX, max 5 MB</span></div>
    <button type="button" className={`upload-zone ${file ? 'border-emerald-400/50 bg-emerald-400/5' : ''} ${isDragging ? 'border-cyan-300 bg-cyan-300/10' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files[0]) }}>
      <input ref={inputRef} id="resume-upload" className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => handleFile(event.target.files[0])} />
      {file ? <><span className="text-emerald-300">Resume ready</span><span className="mt-2 block truncate text-sm text-white">{file.name}</span><span className="mt-1 block text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span></> : <><span className="text-base text-white">Upload your resume</span><span className="mt-2 block text-sm text-slate-400">Drag and drop or browse files</span></>}
    </button>
    {file && <button type="button" className="mt-2 text-xs text-slate-400 underline underline-offset-4 hover:text-white" onClick={() => { onChange(null); inputRef.current.value = '' }}>Remove file</button>}
    {error && <p className="error-text">{error}</p>}
  </div>
}
