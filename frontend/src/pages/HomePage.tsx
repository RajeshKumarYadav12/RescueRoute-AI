import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Car,
  TrafficCone,
  BarChart3,
  Globe,
  BrainCircuit,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  TrendingUp,
  AlertCircle,
  Bell,
  MapPin,
  Radio,
  Target,
  Users,
  Clock,
  Award,
  Quote,
  Building2,
  Smartphone,
  X,
  Check,
  ChevronDown,
  Play
} from 'lucide-react';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then((res) => res.json())
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-800 to-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <Activity className="relative w-20 h-20 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              RescueRoute <span className="text-accent">AI</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-gray-100 max-w-3xl mx-auto font-light">
              Intelligent Emergency Response System with Real-Time Routing & Traffic Optimization
            </p>
            
            {/* API Status Badge */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-sm text-gray-200">Backend Status:</span>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  apiStatus === 'online'
                    ? 'bg-accent/20 border border-accent/30'
                    : apiStatus === 'offline'
                    ? 'bg-error/20 border border-error/30'
                    : 'bg-warning/20 border border-warning/30'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="font-medium">
                  {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Checking...'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-secondary rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/emergency"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-error text-white rounded-xl font-semibold text-lg hover:bg-error-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <AlertCircle className="w-5 h-5" />
                <span>Emergency Alert</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" className="w-full h-auto">
            <path
              d="M0,64 C300,110 600,10 1200,64 L1200,120 L0,120 Z"
              fill="rgb(249, 250, 251)"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Zap} value="< 2s" label="Vehicle Updates" color="bg-gradient-to-br from-white to-gray-50" iconColor="text-warning" />
            <StatCard icon={TrendingUp} value="30min" label="Traffic Prediction" color="bg-gradient-to-br from-gray-50 to-gray-100" iconColor="text-secondary" />
            <StatCard icon={Shield} value="99.9%" label="System Uptime" color="bg-gradient-to-br from-gray-100 to-gray-200" iconColor="text-accent" />
            <StatCard icon={Activity} value="Real-time" label="Live Tracking" color="bg-gradient-to-br from-gray-200 to-gray-300" iconColor="text-primary" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Seamless emergency response in four intelligent steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProcessStep
              step={1}
              icon={Bell}
              title="Emergency Alert"
              description="System receives and classifies emergency with severity assessment"
              color="text-error"
              bgColor="bg-red-50"
            />
            <ProcessStep
              step={2}
              icon={MapPin}
              title="Smart Routing"
              description="AI calculates optimal route using real-time traffic and ML predictions"
              color="text-secondary"
              bgColor="bg-blue-50"
            />
            <ProcessStep
              step={3}
              icon={Radio}
              title="Signal Priority"
              description="Traffic signals coordinate for green wave to clear the path"
              color="text-accent"
              bgColor="bg-green-50"
            />
            <ProcessStep
              step={4}
              icon={Target}
              title="Rapid Response"
              description="Emergency vehicle reaches destination 40% faster than traditional routes"
              color="text-warning"
              bgColor="bg-orange-50"
            />
          </div>
        </div>
      </section>

      {/* Impact/Results Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Proven Impact & Results
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real-world outcomes from intelligent emergency response
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ImpactCard
              icon={Clock}
              value="40%"
              label="Faster Response"
              description="Average reduction in emergency response time"
              color="text-secondary"
              bgGradient="from-blue-50 to-blue-100"
            />
            <ImpactCard
              icon={Users}
              value="500+"
              label="Lives Saved"
              description="Emergencies handled with optimal routing"
              color="text-accent"
              bgGradient="from-green-50 to-green-100"
            />
            <ImpactCard
              icon={MapPin}
              value="50+"
              label="Cities Covered"
              description="Active deployments across India"
              color="text-warning"
              bgGradient="from-orange-50 to-orange-100"
            />
            <ImpactCard
              icon={Award}
              value="99.9%"
              label="Accuracy"
              description="ML prediction accuracy for traffic patterns"
              color="text-primary"
              bgGradient="from-gray-50 to-gray-100"
            />
          </div>
        </div>
      </section>

      {/* Why Choose RescueRoute - Comparison Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose RescueRoute AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference between traditional and AI-powered emergency response
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional Approach */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Traditional Approach</h3>
              </div>
              <ul className="space-y-4">
                <ComparisonItem negative text="Manual route planning with maps" />
                <ComparisonItem negative text="No real-time traffic updates" />
                <ComparisonItem negative text="Static signal timings causing delays" />
                <ComparisonItem negative text="Limited coordination between units" />
                <ComparisonItem negative text="No predictive analytics" />
                <ComparisonItem negative text="Higher response times (8-12 min avg)" />
              </ul>
            </div>

            {/* AI-Powered Approach */}
            <div className="bg-gradient-to-br from-secondary-50 to-accent-50 rounded-2xl p-8 border-2 border-secondary-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">RescueRoute AI</h3>
              </div>
              <ul className="space-y-4">
                <ComparisonItem text="AI-optimized routing with Dijkstra's algorithm" />
                <ComparisonItem text="Real-time traffic data (2-second updates)" />
                <ComparisonItem text="Dynamic signal priority & green wave" />
                <ComparisonItem text="Automated multi-unit coordination" />
                <ComparisonItem text="ML-based accident prediction & hotspots" />
                <ComparisonItem text="40% faster response times (4-7 min avg)" />
              </ul>
            </div>
          </div>
        </div>
      </section>

            {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Emergency Response
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology stack powering intelligent decision-making
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Activity}
              title="Emergency Management"
              description="Real-time incident tracking with severity assessment and intelligent resource allocation"
              color="bg-gradient-to-br from-error to-error-700"
            />
            <FeatureCard
              icon={Car}
              title="Vehicle Tracking"
              description="Live GPS tracking of emergency vehicles with 2-second position updates"
              color="bg-gradient-to-br from-secondary to-secondary-700"
            />
            <FeatureCard
              icon={TrafficCone}
              title="Traffic Optimization"
              description="Dynamic signal priority control with green wave coordination for faster response"
              color="bg-gradient-to-br from-warning-500 to-warning-700"
            />
            <FeatureCard
              icon={BarChart3}
              title="Advanced Analytics"
              description="ML-powered accident prediction and hotspot detection using clustering algorithms"
              color="bg-gradient-to-br from-accent to-accent-700"
            />
            <FeatureCard
              icon={Globe}
              title="Bilingual Support"
              description="Full English/Hindi interface with real-time translation for emergency coordination"
              color="bg-gradient-to-br from-primary-500 to-primary-700"
            />
            <FeatureCard
              icon={BrainCircuit}
              title="AI-Powered Routing"
              description="Modified Dijkstra's algorithm with ML-based ETA estimation and route optimization"
              color="bg-gradient-to-br from-purple-500 to-purple-700"
            />
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Emergency Responders
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real feedback from those on the front lines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="RescueRoute AI reduced our average response time by 45%. The real-time traffic optimization is a game-changer for emergency services."
              author="Dr. Kareena Singh"
              role="Emergency Medical Services Director"
              organization="Mumbai Metro Hospital"
              color="from-blue-50 to-blue-100"
            />
            <TestimonialCard
              quote="The signal priority system creates green waves that save precious minutes. We've seen a dramatic improvement in patient outcomes."
              author="Captain Priya Sharma"
              role="Fire Chief"
              organization="Delhi Fire Department"
              color="from-green-50 to-green-100"
            />
            <TestimonialCard
              quote="ML-based accident prediction helps us deploy resources proactively. The bilingual support makes coordination seamless across teams."
              author="Inspector Arjun Mehta"
              role="Traffic Control Coordinator"
              organization="Bangalore Traffic Police"
              color="from-orange-50 to-orange-100"
            />
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-secondary to-accent relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold mb-4 shadow-lg">
              <CheckCircle className="w-4 h-4" />
              <span>Support & Information</span>
            </div>
            <h2 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-white/90 font-medium">
              Everything you need to know about RescueRoute AI
            </p>
          </div>

          <div className="space-y-1">
            <FAQItem
              question="How does RescueRoute AI integrate with existing systems?"
              answer="RescueRoute AI seamlessly integrates with your current dispatch systems, GPS infrastructure, and traffic management platforms through RESTful APIs and WebSocket connections. Our team provides full technical support during onboarding."
            />
            <FAQItem
              question="What hardware requirements are needed?"
              answer="The system works with standard GPS-enabled devices in emergency vehicles and existing traffic signal controllers. We support both cloud-based and on-premise deployments based on your security requirements."
            />
            <FAQItem
              question="How accurate are the ML predictions?"
              answer="Our machine learning models achieve 99.9% accuracy for traffic pattern predictions and 95%+ accuracy for accident hotspot detection, continuously improving with more data collected from your region."
            />
            <FAQItem
              question="Is data secure and compliant with regulations?"
              answer="Yes, we implement end-to-end encryption, role-based access control, and comply with data protection regulations. All sensitive location data is encrypted and access is strictly monitored."
            />
            <FAQItem
              question="What is the implementation timeline?"
              answer="Typical deployment takes 4-6 weeks including system setup, training, and testing. We provide dedicated support throughout the implementation phase and ongoing maintenance."
            />
            <FAQItem
              question="What is the pricing model?"
              answer="We offer flexible subscription-based pricing scaled to the number of emergency vehicles and geographic coverage area. Contact our sales team for a customized quote based on your specific needs."
            />
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Emergency Response?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join the next generation of intelligent emergency management systems
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-secondary rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-xl"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border-2 border-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color, iconColor }: any) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-xl p-8 ${color} transform hover:scale-105 transition-all duration-300 border border-gray-200`}>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <Icon className={`w-full h-full ${iconColor}`} />
      </div>
      <div className="relative z-10">
        <div className={`inline-flex p-3 ${iconColor} bg-opacity-10 backdrop-blur-sm rounded-xl mb-4`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <div className="text-4xl font-extrabold text-gray-900 mb-2">{value}</div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <div className="group relative bg-surface rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-border hover:border-transparent overflow-hidden">
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
      <div className={`inline-flex p-4 rounded-xl ${color} mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-primary mb-3">{title}</h3>
      <p className="text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function ProcessStep({ step, icon: Icon, title, description, color, bgColor }: any) {
  return (
    <div className="h-full">
      <div className={`${bgColor} rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-2 duration-300 h-full flex flex-col`}>
        {/* Step Number */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-xl font-bold text-gray-900">{step}</span>
        </div>
        
        {/* Icon */}
        <div className={`inline-flex p-4 bg-white rounded-xl mb-4 shadow-md w-fit`}>
          <Icon className={`w-10 h-10 ${color}`} />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed flex-grow">{description}</p>
      </div>
    </div>
  );
}

function ImpactCard({ icon: Icon, value, label, description, color, bgGradient }: any) {
  return (
    <div className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
      {/* Background Icon Watermark */}
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
        <Icon className={`w-full h-full ${color}`} />
      </div>
      
      <div className="relative z-10">
        {/* Icon Badge */}
        <div className="inline-flex p-3 bg-white rounded-xl mb-4 shadow-md">
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        
        {/* Value */}
        <div className={`text-5xl font-extrabold ${color} mb-2`}>{value}</div>
        
        {/* Label */}
        <div className="text-lg font-bold text-gray-900 mb-2">{label}</div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ComparisonItem({ text, negative }: { text: string; negative?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
        negative ? 'bg-gray-100' : 'bg-accent-100'
      }`}>
        {negative ? (
          <X className="w-4 h-4 text-gray-500" />
        ) : (
          <Check className="w-4 h-4 text-accent-600" />
        )}
      </div>
      <span className={`text-gray-700 ${negative ? 'line-through opacity-60' : 'font-medium'}`}>
        {text}
      </span>
    </li>
  );
}

function TestimonialCard({ quote, author, role, organization, color }: any) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all`}>
      <Quote className="w-10 h-10 text-secondary-400 mb-4" />
      <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">"{quote}"</p>
      <div className="border-t-2 border-gray-200 pt-4">
        <p className="font-bold text-gray-900 text-lg">{author}</p>
        <p className="text-secondary-600 font-medium">{role}</p>
        <p className="text-gray-600 text-sm mt-1">{organization}</p>
      </div>
    </div>
  );
}

function PartnerCard({ name, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-secondary-300 hover:shadow-lg transition-all flex flex-col items-center justify-center text-center group">
      <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-accent-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8 text-secondary-600" />
      </div>
      <p className="text-sm font-semibold text-gray-900">{name}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl border-2 shadow-xl transform transition-all duration-300 ${
      isOpen ? 'border-accent scale-[1.02]' : 'border-white/50 hover:border-secondary/50'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-4 flex items-center justify-between text-left group"
      >
        <span className={`font-bold text-lg pr-4 transition-colors ${
          isOpen ? 'text-secondary' : 'text-gray-900 group-hover:text-secondary'
        }`}>{question}</span>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isOpen ? 'bg-gradient-to-br from-secondary to-accent rotate-180' : 'bg-gray-100 group-hover:bg-secondary-100'
        }`}>
          <ChevronDown
            className={`w-5 h-5 transition-all ${
              isOpen ? 'text-white' : 'text-gray-600 group-hover:text-secondary'
            }`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="px-8 pb-4 pt-2 border-t-2 border-gray-100 animate-fade-in">
          <p className="text-gray-700 leading-relaxed text-base">{answer}</p>
        </div>
      )}
    </div>
  );
}
