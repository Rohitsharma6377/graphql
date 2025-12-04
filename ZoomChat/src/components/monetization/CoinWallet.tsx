'use client'

import { useState } from 'react'

export interface Gift {
  id: string
  name: string
  emoji: string
  cost: number
  animation?: string
}

const GIFTS: Gift[] = [
  { id: 'heart', name: 'Heart', emoji: '❤️', cost: 10 },
  { id: 'rose', name: 'Rose', emoji: '🌹', cost: 20 },
  { id: 'fire', name: 'Fire', emoji: '🔥', cost: 30 },
  { id: 'star', name: 'Star', emoji: '⭐', cost: 40 },
  { id: 'diamond', name: 'Diamond', emoji: '💎', cost: 100 },
  { id: 'crown', name: 'Crown', emoji: '👑', cost: 200 },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', cost: 500 },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', cost: 1000 },
]

interface CoinWalletProps {
  balance: number
  onBuyCoins: () => void
  onSendGift?: (gift: Gift) => void
  className?: string
}

export default function CoinWallet({ balance, onBuyCoins, onSendGift, className = '' }: CoinWalletProps) {
  const [showGiftMenu, setShowGiftMenu] = useState(false)

  return (
    <div className={`coin-wallet ${className}`}>
      {/* Balance display */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-yellow-100 text-sm mb-1">Your Balance</div>
            <div className="text-3xl font-bold text-white flex items-center gap-2">
              <span>🪙</span>
              {balance.toLocaleString()}
            </div>
          </div>
          <button
            onClick={onBuyCoins}
            className="bg-white hover:bg-gray-100 text-orange-600 font-semibold px-4 py-2 rounded-lg transition"
          >
            Buy Coins
          </button>
        </div>
      </div>

      {/* Gift menu toggle */}
      {onSendGift && (
        <button
          onClick={() => setShowGiftMenu(!showGiftMenu)}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
        >
          🎁 Send Gift
        </button>
      )}

      {/* Gift menu */}
      {showGiftMenu && onSendGift && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {GIFTS.map((gift) => (
            <button
              key={gift.id}
              onClick={() => {
                if (balance >= gift.cost) {
                  onSendGift(gift)
                  setShowGiftMenu(false)
                } else {
                  alert('Not enough coins!')
                }
              }}
              disabled={balance < gift.cost}
              className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition ${
                balance < gift.cost ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="text-3xl mb-1">{gift.emoji}</div>
              <div className="text-xs text-gray-400">{gift.name}</div>
              <div className="text-xs text-yellow-500 font-semibold">{gift.cost} 🪙</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Buy coins modal
interface BuyCoinsModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (amount: number, price: number) => void
}

export function BuyCoinsModal({ isOpen, onClose, onPurchase }: BuyCoinsModalProps) {
  const packages = [
    { coins: 100, price: 0.99, bonus: 0 },
    { coins: 500, price: 4.99, bonus: 50 },
    { coins: 1000, price: 9.99, bonus: 150 },
    { coins: 5000, price: 49.99, bonus: 1000 },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full mx-4 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Buy Coins</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <button
              key={pkg.coins}
              onClick={() => onPurchase(pkg.coins + pkg.bonus, pkg.price)}
              className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-yellow-500 rounded-xl p-6 transition"
            >
              <div className="text-4xl mb-2">🪙</div>
              <div className="text-2xl font-bold text-white mb-2">{pkg.coins.toLocaleString()}</div>
              {pkg.bonus > 0 && (
                <div className="text-green-400 text-sm mb-2">+{pkg.bonus} Bonus!</div>
              )}
              <div className="text-xl font-semibold text-yellow-500">${pkg.price}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Secure payment via Stripe • Instant delivery
        </div>
      </div>
    </div>
  )
}
