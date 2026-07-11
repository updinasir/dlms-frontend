import { useState } from 'react'
import { HelpCircle, BookOpen, MessageSquare, Phone, Search, ChevronRight, ExternalLink, Video, FileText, Mail, AlertCircle } from 'lucide-react'

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: BookOpen, count: 8 },
    { id: 'user-guide', name: 'User Guide', icon: FileText, count: 12 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: AlertCircle, count: 6 },
    { id: 'video-tutorials', name: 'Video Tutorials', icon: Video, count: 4 },
  ]

  const articles = [
    { id: 1, title: 'How to create a driver account', category: 'getting-started', description: 'Learn how to register a new driver in the system' },
    { id: 2, title: 'Managing driver licenses', category: 'user-guide', description: 'Complete guide to managing driver licenses' },
    { id: 3, title: 'Scheduling appointments', category: 'user-guide', description: 'How to schedule and manage examination appointments' },
    { id: 4, title: 'Payment processing', category: 'user-guide', description: 'Understanding payment workflows' },
    { id: 5, title: 'Login issues', category: 'troubleshooting', description: 'Common login problems and solutions' },
    { id: 6, title: 'System requirements', category: 'getting-started', description: 'Browser and system requirements' },
    { id: 7, title: 'Exam configuration', category: 'user-guide', description: 'Setting up theory and practical exams' },
    { id: 8, title: 'Report generation', category: 'user-guide', description: 'Creating and exporting reports' },
    { id: 9, title: 'API integration', category: 'getting-started', description: 'Using the DLMS API' },
    { id: 10, title: 'Data backup', category: 'troubleshooting', description: 'Backup and restore procedures' },
  ]

  const faqs = [
    { question: 'How do I reset my password?', answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.' },
    { question: 'What are the system requirements?', answer: 'DLMS works on any modern browser (Chrome, Firefox, Safari, Edge) with JavaScript enabled.' },
    { question: 'How do I contact support?', answer: 'You can reach our support team via email at support@dlms.com or call +1-234-567-8900.' },
    { question: 'Is my data secure?', answer: 'Yes, all data is encrypted and stored securely. We follow industry-standard security practices.' },
  ]

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
          <p className="text-sm text-gray-500">Find answers and get support</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900">Documentation</h3>
          <p className="mt-1 text-sm text-gray-500">Browse our guides</p>
        </div>
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <Video className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900">Video Tutorials</h3>
          <p className="mt-1 text-sm text-gray-500">Watch step-by-step guides</p>
        </div>
        <div className="card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900">Live Chat</h3>
          <p className="mt-1 text-sm text-gray-500">Chat with support</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Categories */}
        <div className="card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                selectedCategory === 'all' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">All Articles</span>
              <span className="text-sm text-gray-500">{articles.length}</span>
            </button>
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg p-3 text-left transition ${
                    selectedCategory === category.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{category.count}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Articles */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          {filteredArticles.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No articles found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  className="flex w-full items-start gap-4 rounded-lg border border-gray-200 p-4 text-left transition hover:bg-gray-50 hover:border-gray-300"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{article.title}</h4>
                    <p className="mt-1 text-sm text-gray-600">{article.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAQs */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
              <h4 className="font-semibold text-gray-900">{faq.question}</h4>
              <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Still need help?</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Email Support</p>
              <p className="text-sm text-gray-500">support@dlms.com</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Phone Support</p>
              <p className="text-sm text-gray-500">+1-234-567-8900</p>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:bg-gray-50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Live Chat</p>
              <p className="text-sm text-gray-500">Available 24/7</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpCenter
