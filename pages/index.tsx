import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div style={{ height: '100vh' }}>
      <iframe
        src="https://www.livelarq.com"
        id="vscraper"
        sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
        width="100%"
        height="100%"
      ></iframe>
    </div>
  )
}

export default Home
