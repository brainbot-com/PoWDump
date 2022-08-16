import Image from 'next/image'

type Props = {
  key: string
  onClick: (key: string) => void
  title: string
  icon: string
}

export const ConnectorButton = ({ key, onClick, title, icon }: Props) => {
  return (
    <div key={key} className={'flex flex-col space-y-4'}>
      <button
        onClick={() => onClick(key)}
        className={
          'bg-gray-900 text-white border border-transparent shrink-0 inline-flex' +
          ' items-center justify-center disabled:opacity-50 disabled:cursor-default ' +
          'focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-500' +
          ' focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition bg-white dark:bg-gray-900' +
          ' active:bg-white dark:active:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3' +
          ' rounded-lg text-gray-700 dark:text-white'
        }
      >
        <span className={'flex-1 flex items-center justify-center space-x-2'}>
          <span className={'flex flex-1 items-center justify-between'}>
            <span className={'text-lg font-medium text-gray-900 dark:text-white'}>{title}</span>
            <span className={'overflow-hidden rounded-lg'}>
              <Image src={icon} alt={icon} className={'rounded-lg'} />
            </span>
          </span>
        </span>
      </button>
    </div>
  )
}
