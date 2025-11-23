import Head from 'next/head'
import Game from '../components/Game'

export default function Home() {
  return (
    <>
      <Head>
        <title>Kahina et l'Oracle Oublié</title>
        <meta name="description" content="Jeu d'aventure avec Kahina" />
      </Head>
      <main>
        <Game />
      </main>
    </>
  )
}
