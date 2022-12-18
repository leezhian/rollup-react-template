import type { FC } from 'react'
import styles from './App.module.scss'

const App: FC = () => {
  return <div className={styles['title']}>
    Hello, Rollup-React-Template
  </div>
}

export default App