import { useState, useEffect, useCallback } from 'react'
import styles from '../styles/Game.module.css'

const Game = () => {
  const [gameState, setGameState] = useState({
    player: { x: 50, y: 400, width: 30, height: 50 },
    platforms: [
      { x: 0, y: 500, width: 300, height: 20, visible: true },
      { x: 350, y: 500, width: 200, height: 20, visible: true },
      { x: 600, y: 500, width: 200, height: 20, visible: true },
      { x: 200, y: 400, width: 100, height: 20, visible: true },
      { x: 400, y: 350, width: 100, height: 20, visible: true },
      { x: 600, y: 300, width: 150, height: 20, visible: true },
      { x: 300, y: 200, width: 80, height: 15, visible: false },
      { x: 500, y: 250, width: 80, height: 15, visible: false }
    ],
    oracle: { x: 700, y: 250, width: 50, height: 50 },
    visionActive: false,
    gameStatus: 'playing',
    velocityY: 0,
    onGround: false
  })

  const GRAVITY = 0.8
  const JUMP_POWER = -15
  const SPEED = 5

  const checkCollision = useCallback((rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }, [])

  const updateGame = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      let newX = prev.player.x
      let newY = prev.player.y
      let newVelocityY = prev.velocityY
      let newOnGround = false

      // Appliquer la gravité
      newVelocityY += GRAVITY
      newY += newVelocityY

      // Vérifier les collisions avec les plateformes
      const playerRect = { 
        x: newX, 
        y: newY, 
        width: prev.player.width, 
        height: prev.player.height 
      }

      prev.platforms.forEach(platform => {
        if ((platform.visible || prev.visionActive) && checkCollision(playerRect, platform)) {
          if (newVelocityY > 0 && playerRect.bottom > platform.y && playerRect.top < platform.y) {
            newY = platform.y - prev.player.height
            newVelocityY = 0
            newOnGround = true
          }
        }
      })

      // Vérifier la victoire
      if (checkCollision(playerRect, prev.oracle)) {
        return { ...prev, gameStatus: 'win' }
      }

      // Vérifier la défaite (trop bas)
      if (newY > 600) {
        return { ...prev, gameStatus: 'lose' }
      }

      return {
        ...prev,
        player: { ...prev.player, x: newX, y: newY },
        velocityY: newVelocityY,
        onGround: newOnGround
      }
    })
  }, [gameState.gameStatus, gameState.visionActive, checkCollision])

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'r' || event.key === 'R') {
      if (gameState.gameStatus !== 'playing') {
        setGameState({
          player: { x: 50, y: 400, width: 30, height: 50 },
          platforms: [
            { x: 0, y: 500, width: 300, height: 20, visible: true },
            { x: 350, y: 500, width: 200, height: 20, visible: true },
            { x: 600, y: 500, width: 200, height: 20, visible: true },
            { x: 200, y: 400, width: 100, height: 20, visible: true },
            { x: 400, y: 350, width: 100, height: 20, visible: true },
            { x: 600, y: 300, width: 150, height: 20, visible: true },
            { x: 300, y: 200, width: 80, height: 15, visible: false },
            { x: 500, y: 250, width: 80, height: 15, visible: false }
          ],
          oracle: { x: 700, y: 250, width: 50, height: 50 },
          visionActive: false,
          gameStatus: 'playing',
          velocityY: 0,
          onGround: false
        })
      }
      return
    }

    if (event.key === 'v' || event.key === 'V') {
      setGameState(prev => ({ ...prev, visionActive: !prev.visionActive }))
      return
    }

    if (gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      let newX = prev.player.x

      switch (event.key) {
        case 'ArrowLeft':
          newX = Math.max(0, prev.player.x - SPEED)
          break
        case 'ArrowRight':
          newX = Math.min(800 - prev.player.width, prev.player.x + SPEED)
          break
        case ' ':
          if (prev.onGround) {
            return {
              ...prev,
              velocityY: JUMP_POWER,
              onGround: false
            }
          }
          break
        default:
          return prev
      }

      return {
        ...prev,
        player: { ...prev.player, x: newX }
      }
    })
  }, [gameState.gameStatus])

  useEffect(() => {
    const gameLoop = setInterval(updateGame, 16)
    return () => clearInterval(gameLoop)
  }, [updateGame])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <div className={styles.container}>
      <h1>Kahina et l'Oracle Oublié</h1>
      
      <div className={`${styles.gameContainer} ${gameState.visionActive ? styles.visionActive : ''}`}>
        <div className={styles.background}></div>

        {/* Plateformes */}
        {gameState.platforms.map((platform, index) => (
          (platform.visible || gameState.visionActive) && (
            <div
              key={index}
              className={`${styles.platform} ${!platform.visible ? styles.hiddenPlatform : ''}`}
              style={{
                left: platform.x,
                top: platform.y,
                width: platform.width,
                height: platform.height
              }}
            />
          )
        ))}

        {/* Oracle */}
        <div
          className={styles.oracle}
          style={{
            left: gameState.oracle.x,
            top: gameState.oracle.y,
            width: gameState.oracle.width,
            height: gameState.oracle.height
          }}
        />

        {/* Joueur */}
        <div
          className={styles.player}
          style={{
            left: gameState.player.x,
            top: gameState.player.y,
            width: gameState.player.width,
            height: gameState.player.height
          }}
        />

        {/* UI */}
        <div className={styles.ui}>
          <div className={styles.visionStatus}>
            Vision: {gameState.visionActive ? 'ACTIVE' : 'READY'}
          </div>
          <div className={styles.instructions}>
            V: Vision | R: Recommencer
          </div>
        </div>

        {/* Écrans de fin */}
        {gameState.gameStatus === 'win' && (
          <div className={styles.endScreen}>
            <h2>Félicitations Kahina !</h2>
            <p>L'Oracle est retrouvé !</p>
            <button onClick={() => handleKeyPress({ key: 'r' })}>Recommencer</button>
          </div>
        )}

        {gameState.gameStatus === 'lose' && (
          <div className={styles.endScreen}>
            <h2>Kahina a échoué...</h2>
            <button onClick={() => handleKeyPress({ key: 'r' })}>Recommencer</button>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <p>← → : Déplacer | Espace : Sauter | V : Vision | R : Recommencer</p>
      </div>
    </div>
  )
}

export default Game
