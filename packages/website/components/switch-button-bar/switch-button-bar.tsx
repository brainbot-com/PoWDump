import React from 'react'

export type Item = {
  label: string
  value: any
  isActive?: boolean
}

type Props = {
  items: Item[]
  onClickItem: (item: Item) => void
}

function SwitchButtonBar(props: Props) {
  return (
    <div className="flex flex-row">
      {props.items.map((item, i) => (
        <button
          className={`
            rounded mr-2 px-4 py-1
            ${item.isActive ? 'bg-gray-300' : 'bg-white'}
          `}
          onClick={() => props.onClickItem(item)}
          key={String(item.value)}
          aria-label={(item.isActive ? 'active-' : '') + item.label.toLowerCase()}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export { SwitchButtonBar }
