'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Video, MessageSquare, FileText, Users, Zap, Database, Server } from 'lucide-react'
import Link from 'next/link'
import { useQuery, gql } from '@apollo/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FadeIn } from '@/components/animations/AnimatedCard'

const HEALTH_CHECK = gql`
  query HealthCheck {
    __typename
  }
`

export default function TestPage() {
  const { data, loading, error } = useQuery(HEALTH_CHECK)
  
  const features = [
    {
      icon: Video,
      title: 'Video Meetings',
      description: 'Real-time video collaboration with HD quality',
      link: '/dashboard',
      color: 'from-primary-500 to-primary-700',
      status: 'active'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Instant messaging with typing indicators',
      link: '/meetings',
      color: 'from-accent-500 to-accent-700',
      status: 'active'
    },
    {
      icon: FileText,
      title: 'Documents',
      description: 'Collaborative document editing',
      link: '/documents',
      color: 'from-success-500 to-success-700',
      status: 'active'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together in real-time',
      link: '/calendar',
      color: 'from-warning-500 to-warning-700',
      status: 'active'
    },
  ]

  const systemStatus = [
    {
      name: 'Frontend Server',
      status: 'online',
      url: 'http://localhost:3000',
      icon: Server
    },
    {
      name: 'GraphQL API',
      status: !loading && !error ? 'online' : 'offline',
      url: 'http://localhost:4000/graphql',
      icon: Zap
    },
    {
      name: 'Database',
      status: !loading && !error ? 'online' : 'offline',
      url: 'SQLite (dev.db)',
      icon: Database
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto shadow-neon">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">System Ready!</span> 🚀
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            All systems are operational. Your AI-powered collaboration platform is ready to use.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="glow-hover">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </FadeIn>

        {/* System Status */}
        <FadeIn delay={0.2} className="mb-16">
          <Card className="glass-strong border border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {systemStatus.map((system, index) => (
                  <motion.div
                    key={system.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="glass p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-lg ${
                        system.status === 'online' 
                          ? 'bg-gradient-to-br from-success-500/20 to-success-700/20' 
                          : 'bg-gradient-to-br from-destructive-500/20 to-destructive-700/20'
                      } flex items-center justify-center`}>
                        <system.icon className={`w-6 h-6 ${
                          system.status === 'online' ? 'text-success' : 'text-destructive'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{system.name}</h3>
                        <p className="text-sm text-muted-foreground">{system.url}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        system.status === 'online'
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {system.status === 'online' ? '● Online' : '● Offline'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Features Grid */}
        <FadeIn delay={0.4}>
          <h2 className="text-3xl font-bold mb-8 text-center">Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={feature.title} href={feature.link}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="h-full"
                >
                  <Card className="glass-strong border border-white/10 h-full cursor-pointer group hover:shadow-neon transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                          Explore →
                        </span>
                        <div className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                          Active
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </FadeIn>

        {/* Quick Links */}
        <FadeIn delay={0.8} className="mt-16">
          <Card className="glass-strong border border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">Sign Up</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">Dashboard</Button>
                </Link>
                <Link href="/meetings">
                  <Button variant="outline" className="w-full">Meetings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Tech Stack */}
        <FadeIn delay={1} className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6 text-muted-foreground">Powered By</h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {['Next.js 14', 'GraphQL', 'Apollo', 'Prisma', 'SQLite', 'NextAuth', 'Framer Motion', 'TailwindCSS'].map((tech) => (
              <motion.div
                key={tech}
                whileHover={{ scale: 1.1 }}
                className="glass px-4 py-2 rounded-full"
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
