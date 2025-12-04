'use client'

import { useState } from 'react'

export interface PremiumPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

const PLANS: PremiumPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Premium',
    price: 9.99,
    interval: 'month',
    features: [
      'No advertisements',
      '1080p HD video quality',
      'VIP rooms access',
      'Premium stickers & gifts',
      'Call recording',
      'Priority support',
      'Custom themes',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    price: 99.99,
    interval: 'year',
    features: [
      'All monthly features',
      'Save 17% annually',
      'Exclusive yearly badges',
      'Early access to new features',
      'Unlimited cloud storage',
      '24/7 premium support',
    ],
  },
]

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: (planId: string) => void
}

export default function PremiumModal({ isOpen, onClose, onSubscribe }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Upgrade to Premium</h2>
              <p className="text-blue-100">Unlock all features and remove ads</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`border-2 rounded-xl p-6 cursor-pointer transition ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <div className="text-3xl font-bold text-blue-500">
                      ${plan.price}
                      <span className="text-sm text-gray-400">/{plan.interval}</span>
                    </div>
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Subscribe button */}
          <button
            onClick={() => onSubscribe(selectedPlan)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition transform hover:scale-[1.02]"
          >
            Subscribe Now
          </button>

          {/* Payment methods */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <div className="mb-2">Secure payment powered by Stripe</div>
            <div className="flex items-center justify-center gap-4">
              <span>💳 Credit Card</span>
              <span>•</span>
              <span>🏦 Bank Transfer</span>
              <span>•</span>
              <span>📱 Mobile Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
