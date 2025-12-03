'use client'

import { motion } from 'framer-motion'
import { Video, MessageSquare, Edit3, Users, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AnimatedCard } from '@/components/animations/AnimatedCard'

export default function Home() {
  const features = [
    {
      icon: Video,
      title: 'HD Video Calls',
      description: 'Crystal clear video and audio with screen sharing',
      color: 'from-primary-500 to-primary-700'
    },
    {
      icon: MessageSquare,
      title: 'Realtime Chat',
      description: 'Instant messaging with typing indicators and reactions',
      color: 'from-accent-500 to-accent-700'
    },
    {
      icon: Edit3,
      title: 'Collaborative Whiteboard',
      description: 'Draw together in real-time with multiple users',
      color: 'from-success-500 to-success-700'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together on documents with live cursors',
      color: 'from-warning-500 to-warning-700'
    },
    {
      icon: Sparkles,
      title: 'AI Summaries',
      description: 'Automatic meeting transcripts and action items',
      color: 'from-purple-500 to-purple-700'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Powered by modern tech for instant collaboration',
      color: 'from-pink-500 to-pink-700'
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="glass-strong px-6 py-3 rounded-full inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-400 animate-pulse" />
              <span className="text-sm font-medium gradient-text">AI-Powered Collaboration</span>
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 font-display">
            <span className="block text-shimmer">Collaborate</span>
            <span className="block gradient-text">in Real-Time</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Experience the future of team collaboration with HD video, realtime chat, 
            collaborative whiteboard, and AI-powered meeting insights.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 glow-hover group">
                <span>Get Started Free</span>
                <Zap className="w-5 h-5 ml-2 group-hover:animate-bounce" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass-strong border-white/20">
                Watch Demo
                <Video className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <AnimatedCard
              key={feature.title}
              delay={index * 0.1}
              className="glass-strong p-8 rounded-2xl card-hover group cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </AnimatedCard>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-32 text-center"
        >
          <div className="glass-strong p-12 rounded-3xl max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 gradient-text">Ready to Transform Your Meetings?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of teams already collaborating smarter
              </p>
              <Link href="/auth/signin">
                <Button size="lg" className="text-lg px-10 py-6 glow-primary">
                  Start Collaborating Now
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
