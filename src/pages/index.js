import Head from 'next/head'
import dynamic from 'next/dynamic'

// Charger le composant Game sans SSR pour éviter les problèmes de hydration
const Game = dynamic(() => import('../components/Game'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>Kahina et l'Oracle Oublié</title>
        <meta name="description" content="Jeu d'aventure avec Kahina" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Game />
      </main>
    </>
  )
}
