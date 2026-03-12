import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  BookOpen, 
  Search, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const features = [
    {
      icon: Search,
      title: "Smart Paper Search",
      description: "Find research papers across multiple databases with AI-powered search"
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Ask questions about your research papers and get intelligent responses"
    },
    {
      icon: FileText,
      title: "DocSpace Editor",
      description: "Create and edit documents with rich text formatting like Google Docs"
    },
    {
      icon: BookOpen,
      title: "Literature Review",
      description: "Generate comprehensive literature reviews from selected papers"
    }
  ]

  const benefits = [
    "Save 80% time on literature review",
    "Access millions of research papers",
    "AI-powered insights and summaries", 
    "Collaborative workspace features",
    "Export to multiple formats"
  ]

  const faqs = [
    {
      question: "How do I search for research papers?",
      answer: "Use the Search Papers feature to find papers by title, author, or keywords. Our AI will help you discover relevant research across multiple databases."
    },
    {
      question: "Can I chat with my research papers?",
      answer: "Yes! Import papers to your workspace and use the AI Chat feature to ask questions, get summaries, and extract key insights from your research."
    },
    {
      question: "What is DocSpace?",
      answer: "DocSpace is our built-in document editor where you can write your thesis, research proposals, or any document with rich formatting options similar to Google Docs."
    },
    {
      question: "How do I create a literature review?",
      answer: "Select multiple papers in your workspace and click 'Generate Literature Review'. Our AI will create a comprehensive review analyzing the papers."
    },
    {
      question: "Is my research data secure?",
      answer: "Absolutely! All your data is encrypted and stored securely. We follow industry-standard security practices to protect your research."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">ResearchHub AI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}!</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered <span className="gradient-text">Research Assistant</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Accelerate your research with intelligent paper discovery, AI-powered insights, 
            and collaborative document editing - all in one platform.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/search')}
              className="btn-primary btn-lg"
            >
              Start Researching
            </button>
            <button
              onClick={() => navigate('/docspace')}
              className="btn-secondary btn-lg"
            >
              Try DocSpace
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Modern Research
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-violet-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">Why Choose ResearchHub AI?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How to Use ResearchHub AI
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-violet-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Search & Import</h4>
              <p className="text-gray-600">Find relevant research papers and import them to your workspace</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-violet-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Analyze & Chat</h4>
              <p className="text-gray-600">Use AI to analyze papers, generate summaries, and ask questions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-violet-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Write & Export</h4>
              <p className="text-gray-600">Create documents in DocSpace and export your research</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Accelerate Your Research?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of researchers who are already using ResearchHub AI
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary btn-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  )
}
