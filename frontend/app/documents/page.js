'use client'

import { motion } from 'framer-motion'
import { FileText, Clock, Download, Search, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@apollo/client'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { FadeIn } from '@/components/animations/AnimatedCard'
import { formatDate } from '@/lib/utils'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { GET_DOCUMENTS, CREATE_DOCUMENT } from '@/graphql/queries'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentName, setDocumentName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  
  const { data: docsData, loading, refetch } = useQuery(GET_DOCUMENTS, {
    pollInterval: 10000,
  })
  
  const [createDocument] = useMutation(CREATE_DOCUMENT, {
    refetchQueries: [{ query: GET_DOCUMENTS }],
  })

  const documents = docsData?.documents || []
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setDocumentName(file.name)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)

    try {
      const result = await uploadToCloudinary(selectedFile, 'documents')
      
      if (result.success) {
        await createDocument({
          variables: {
            input: {
              name: documentName,
              content: result.url,
            },
          },
        })

        toast.success('📁 Document uploaded with Cloudinary!')
        setShowUploadModal(false)
        setDocumentName('')
        setSelectedFile(null)
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Sidebar />
        
        <main className="lg:ml-64 pt-16">
          <div className="container mx-auto px-4 py-8">
            <FadeIn className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    <FileText className="inline-block mr-3 text-primary-500" size={40} />
                    Documents
                  </h1>
                  <p className="text-muted-foreground">
                    Real GraphQL + Cloudinary Integration • {documents.length} files
                  </p>
                </div>
                <Button size="lg" onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload to Cloudinary
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </FadeIn>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-6">Upload via Cloudinary to get started</p>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc, index) => (
                  <FadeIn key={doc.id} delay={0.1 * (index + 2)}>
                    <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-accent-700 flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-xl">{doc.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>☁️ Cloudinary</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(new Date(doc.updatedAt))}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Avatar
                              src={doc.author?.avatar}
                              fallback={doc.author?.name || 'U'}
                              size="sm"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(doc.content, '_blank')}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </main>

        <Modal
          isOpen={showUploadModal}
          onClose={() => !uploading && setShowUploadModal(false)}
          title="Upload to Cloudinary"
        >
          <div className="space-y-4">
            <div>
              <Label>Document Name</Label>
              <Input
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
              />
            </div>
            <div>
              <Label>Select File</Label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="glass rounded-xl p-8 border-2 border-dashed border-white/20 hover:border-primary-500/50 cursor-pointer transition-colors text-center"
              >
                {selectedFile ? (
                  <p className="font-medium">☁️ {selectedFile.name}</p>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to select</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
