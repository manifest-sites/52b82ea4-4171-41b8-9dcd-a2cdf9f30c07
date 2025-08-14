import { useState, useEffect, useCallback } from 'react'
import { Card, Button, Progress, Statistic, Row, Col, Badge, Tooltip, notification } from 'antd'
import { GameData } from '../entities/GameData'

const LemmieClickerGame = () => {
  const [gameState, setGameState] = useState({
    points: 0,
    totalClicks: 0,
    clickPower: 1,
    autoClickerCount: 0,
    autoClickerPower: 0,
    upgrades: {
      clickMultiplier: 0,
      autoClickerEfficiency: 0,
      goldenLizard: 0,
      megaClicks: 0
    },
    achievements: [],
    clickAnimations: []
  })

  const [saveId, setSaveId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load game data on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        const response = await GameData.list()
        if (response.success && response.data.length > 0) {
          const savedGame = response.data[0]
          setSaveId(savedGame._id)
          setGameState(prev => ({
            ...prev,
            points: savedGame.points || 0,
            totalClicks: savedGame.totalClicks || 0,
            clickPower: savedGame.clickPower || 1,
            autoClickerCount: savedGame.autoClickerCount || 0,
            autoClickerPower: savedGame.autoClickerPower || 0,
            upgrades: savedGame.upgrades || {
              clickMultiplier: 0,
              autoClickerEfficiency: 0,
              goldenLizard: 0,
              megaClicks: 0
            },
            achievements: savedGame.achievements || []
          }))
        }
      } catch (error) {
        console.error('Failed to load game:', error)
      }
      setIsLoading(false)
    }
    loadGame()
  }, [])

  // Auto-save game state
  const saveGame = useCallback(async () => {
    try {
      const saveData = {
        userId: 'player1',
        points: gameState.points,
        totalClicks: gameState.totalClicks,
        clickPower: gameState.clickPower,
        autoClickerCount: gameState.autoClickerCount,
        autoClickerPower: gameState.autoClickerPower,
        upgrades: gameState.upgrades,
        achievements: gameState.achievements,
        lastSaved: new Date().toISOString()
      }

      if (saveId) {
        await GameData.update(saveId, saveData)
      } else {
        const response = await GameData.create(saveData)
        if (response.success) {
          setSaveId(response.data._id)
        }
      }
    } catch (error) {
      console.error('Failed to save game:', error)
    }
  }, [gameState, saveId])

  // Save game every 5 seconds
  useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(saveGame, 5000)
      return () => clearInterval(interval)
    }
  }, [saveGame, isLoading])

  // Auto-clicker logic
  useEffect(() => {
    if (gameState.autoClickerCount > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          points: prev.points + prev.autoClickerPower
        }))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState.autoClickerCount, gameState.autoClickerPower])

  // Click animation cleanup
  useEffect(() => {
    if (gameState.clickAnimations.length > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          clickAnimations: []
        }))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState.clickAnimations])

  const handleLizardClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const pointsGained = gameState.clickPower
    
    setGameState(prev => ({
      ...prev,
      points: prev.points + pointsGained,
      totalClicks: prev.totalClicks + 1,
      clickAnimations: [...prev.clickAnimations, { x, y, points: pointsGained, id: Date.now() }]
    }))

    // Check for achievements
    checkAchievements(gameState.totalClicks + 1, gameState.points + pointsGained)
  }

  const checkAchievements = (clicks, points) => {
    const newAchievements = []
    
    if (clicks >= 100 && !gameState.achievements.includes('first_hundred')) {
      newAchievements.push('first_hundred')
      notification.success({
        message: 'Achievement Unlocked!',
        description: 'First Hundred Clicks - You clicked Lemmie 100 times!'
      })
    }
    
    if (points >= 1000 && !gameState.achievements.includes('thousand_points')) {
      newAchievements.push('thousand_points')
      notification.success({
        message: 'Achievement Unlocked!',
        description: 'Point Collector - Reached 1,000 points!'
      })
    }

    if (newAchievements.length > 0) {
      setGameState(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements]
      }))
    }
  }

  const upgradeDefinitions = {
    clickMultiplier: {
      name: 'Stronger Fingers',
      description: 'Increases click power',
      baseCost: 50,
      costMultiplier: 1.5,
      effect: (level) => level + 1
    },
    autoClickerEfficiency: {
      name: 'Auto-Clicker Boost',
      description: 'Makes auto-clickers more powerful',
      baseCost: 500,
      costMultiplier: 2.0,
      effect: (level) => level * 0.5 + 1
    },
    goldenLizard: {
      name: 'Golden Lemmie',
      description: 'Special golden appearance with bonus points',
      baseCost: 2000,
      costMultiplier: 3.0,
      effect: (level) => level * 2 + 1
    }
  }

  const getUpgradeCost = (upgradeKey, currentLevel) => {
    const upgrade = upgradeDefinitions[upgradeKey]
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel))
  }

  const buyUpgrade = (upgradeKey) => {
    const currentLevel = gameState.upgrades[upgradeKey]
    const cost = getUpgradeCost(upgradeKey, currentLevel)
    
    if (gameState.points >= cost) {
      setGameState(prev => {
        const newUpgrades = { ...prev.upgrades, [upgradeKey]: currentLevel + 1 }
        let newClickPower = 1
        
        // Recalculate click power based on all upgrades
        newClickPower += upgradeDefinitions.clickMultiplier.effect(newUpgrades.clickMultiplier) - 1
        newClickPower += upgradeDefinitions.goldenLizard.effect(newUpgrades.goldenLizard) - 1
        
        return {
          ...prev,
          points: prev.points - cost,
          upgrades: newUpgrades,
          clickPower: newClickPower
        }
      })
    }
  }

  const buyAutoClicker = () => {
    const cost = 100 * Math.pow(1.15, gameState.autoClickerCount)
    if (gameState.points >= cost) {
      setGameState(prev => ({
        ...prev,
        points: prev.points - cost,
        autoClickerCount: prev.autoClickerCount + 1,
        autoClickerPower: (prev.autoClickerCount + 1) * upgradeDefinitions.autoClickerEfficiency.effect(prev.upgrades.autoClickerEfficiency)
      }))
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading your lizard...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
          Lemmie the Lizard Clicker 🦎
        </h1>
        
        <Row gutter={[24, 24]}>
          {/* Main Clicker Area */}
          <Col xs={24} lg={16}>
            <Card className="text-center shadow-2xl">
              <div className="relative">
                <div className="text-2xl font-bold text-green-600 mb-4">
                  Points: {Math.floor(gameState.points).toLocaleString()}
                </div>
                
                <div 
                  className="relative inline-block cursor-pointer select-none transform transition-transform hover:scale-105 active:scale-95"
                  onClick={handleLizardClick}
                >
                  <div 
                    className={`text-9xl ${gameState.upgrades.goldenLizard > 0 ? 'filter hue-rotate-45 brightness-150' : ''}`}
                    style={{ textShadow: '0 0 20px rgba(0,255,0,0.5)' }}
                  >
                    🦎
                  </div>
                  <div className="text-lg font-semibold text-gray-700 mt-2">
                    Lemmie
                  </div>
                </div>

                {/* Click Animations */}
                {gameState.clickAnimations.map(anim => (
                  <div
                    key={anim.id}
                    className="absolute pointer-events-none animate-bounce text-2xl font-bold text-yellow-500"
                    style={{ 
                      left: anim.x - 20, 
                      top: anim.y - 20,
                      animation: 'fadeUp 1s ease-out forwards'
                    }}
                  >
                    +{anim.points}
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Statistic 
                  title="Total Clicks" 
                  value={gameState.totalClicks.toLocaleString()} 
                  valueStyle={{ color: '#3f8600' }}
                />
                <Statistic 
                  title="Click Power" 
                  value={gameState.clickPower} 
                  valueStyle={{ color: '#cf1322' }}
                />
              </div>

              {gameState.autoClickerCount > 0 && (
                <div className="mt-4">
                  <Statistic 
                    title="Auto-Clickers" 
                    value={`${gameState.autoClickerCount} (${gameState.autoClickerPower.toFixed(1)}/sec)`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Shop/Upgrades */}
          <Col xs={24} lg={8}>
            <Card title="🛍️ Lizard Shop" className="shadow-2xl">
              <div className="space-y-4">
                {/* Auto-Clicker */}
                <div className="border rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Auto-Clicker 🤖</div>
                      <div className="text-sm text-gray-600">Clicks automatically every second</div>
                      <div className="text-sm text-blue-600">
                        Cost: {Math.floor(100 * Math.pow(1.15, gameState.autoClickerCount)).toLocaleString()}
                      </div>
                    </div>
                    <Button 
                      type="primary" 
                      onClick={buyAutoClicker}
                      disabled={gameState.points < 100 * Math.pow(1.15, gameState.autoClickerCount)}
                    >
                      Buy
                    </Button>
                  </div>
                </div>

                {/* Upgrades */}
                {Object.entries(upgradeDefinitions).map(([key, upgrade]) => {
                  const currentLevel = gameState.upgrades[key]
                  const cost = getUpgradeCost(key, currentLevel)
                  
                  return (
                    <div key={key} className="border rounded p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">
                            {upgrade.name} {currentLevel > 0 && <Badge count={currentLevel} />}
                          </div>
                          <div className="text-sm text-gray-600">{upgrade.description}</div>
                          <div className="text-sm text-blue-600">
                            Cost: {cost.toLocaleString()}
                          </div>
                        </div>
                        <Button 
                          type="primary" 
                          onClick={() => buyUpgrade(key)}
                          disabled={gameState.points < cost}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Achievements */}
            <Card title="🏆 Achievements" className="mt-6 shadow-2xl">
              <div className="space-y-2">
                <div className={`p-2 rounded ${gameState.achievements.includes('first_hundred') ? 'bg-green-100' : 'bg-gray-100'}`}>
                  🥉 First Hundred Clicks
                </div>
                <div className={`p-2 rounded ${gameState.achievements.includes('thousand_points') ? 'bg-green-100' : 'bg-gray-100'}`}>
                  💎 Point Collector (1,000 points)
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      <style jsx>{`
        @keyframes fadeUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px);
          }
        }
      `}</style>
    </div>
  )
}

export default LemmieClickerGame