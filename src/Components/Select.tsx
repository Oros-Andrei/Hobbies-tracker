import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  compact?: boolean;
}

// A shared listbox keeps every menu legible in the dark theme on web and Android.
export default function Select<T extends string>({ value, options, onChange, ariaLabel, className = '', compact = false }: Props<T>) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({ visibility: 'hidden' });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node) && !menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    optionRefs.current[selectedIndex]?.focus();
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open, selectedIndex]);

  // Position the menu outside clipped cards and scrolling modals like a classic dropdown.
  useLayoutEffect(() => {
    if (!open) return;
    const positionMenu = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Match popup height to the smaller card status rows.
      const desiredHeight = Math.min(options.length * (compact ? 34 : 40) + (compact ? 2 : 0), 220);
      const roomBelow = window.innerHeight - rect.bottom - 8;
      const roomAbove = rect.top - 8;
      const openAbove = roomBelow < desiredHeight && roomAbove > roomBelow;
      const maxHeight = Math.max(50, Math.min(desiredHeight, openAbove ? roomAbove : roomBelow));
      const width = Math.min(rect.width, window.innerWidth - 16);
      setMenuStyle({ position: 'fixed', top: openAbove ? rect.top - maxHeight : rect.bottom,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), width, maxHeight, visibility: 'visible' });
    };
    positionMenu();
    window.addEventListener('resize', positionMenu);
    window.addEventListener('scroll', positionMenu, true);
    return () => {
      window.removeEventListener('resize', positionMenu);
      window.removeEventListener('scroll', positionMenu, true);
    };
  }, [open, options.length, compact]);

  function choose(nextValue: T) {
    onChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function move(event: KeyboardEvent, index: number) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      optionRefs.current[next]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return <div ref={rootRef} className={`custom-select ${className}`.trim()}>
    <button ref={triggerRef} type="button" className="custom-select__trigger" aria-label={ariaLabel}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined}
      onClick={() => setOpen(current => !current)}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          setOpen(true);
        }
      }}>
      <span>{options[selectedIndex]?.label}</span><span className="custom-select__chevron" aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={menuRef} id={listId} className={`custom-select__menu${compact ? ' custom-select__menu--compact' : ''}`} role="listbox" aria-label={ariaLabel} style={menuStyle}>
      {options.map((option, index) => <button key={option.value} ref={element => { optionRefs.current[index] = element; }}
        type="button" role="option" aria-selected={value === option.value} className="custom-select__option"
        onClick={() => choose(option.value)} onKeyDown={event => move(event, index)}>
        {option.label}
      </button>)}
    </div>, document.body)}
  </div>;
}
