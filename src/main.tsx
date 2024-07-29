import React from 'react'
import ReactDOM from 'react-dom/client'

import { MainView } from 'components/main-view'

chrome.storage.onChanged.addListener((...args) => {
  console.log('storage changed', args)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainView />
  </React.StrictMode>,
)
