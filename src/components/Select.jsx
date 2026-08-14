import { useEffect, useRef, useState } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'

export function Select({ value, onChange, options, placeholder = 'Selecione...' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const selected = options.find((opt) => opt.value === value)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        className="select__trigger field__input"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'select__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <CaretDown size={14} weight="bold" className="select__caret" />
      </button>

      {open && (
        <ul className="select__panel" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`select__option ${opt.value === value ? 'select__option--selected' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check size={14} weight="bold" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
