import { FC, FocusEvent, useState } from 'react'

import styles from './dropdown.module.scss'

type DropdownProps = {
  options: {
    label: string
    value: number
  }[]
  value: number | null
  onCreate?: (label: string) => void
  onChange?: (value: number) => void
}

export const Dropdown: FC<DropdownProps> = (props) => {
  const { options, value, onChange } = props
  const [hasFocus, setHasFocus] = useState(false)

  const currentActivityLabel = options.find((el) => el.value === value)?.label ?? ''

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    console.log('focus', e.target.value)
    setHasFocus(true)
  }

  const handleBlur = () => {
    console.log('blur')
    setHasFocus(false)
  }

  const handleOptionClick = (value: number) => {
    onChange?.(value)
  }

  return (
    <div className={styles.dropdown}>
      <input type="text" onFocus={handleFocus} onBlur={handleBlur} value={currentActivityLabel} />
      {hasFocus && (
        <ul className={styles.options}>
          {options.map(({label, value}) => (
            <li>
              <span className={styles.option} role="button" onClickCapture={() => handleOptionClick(value)}>{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
