import { CheckCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for exploring our platform",
      features: [
        "Access to basic investor profiles",
        "Limited search functionality",
        "Weekly newsletter updates",
        "Community forum access",
      ],
      buttonText: "Get Started",
      highlighted: false,
    },
    {
      name: "Core",
      price: "$49",
      period: "per month",
      description: "Ideal for early-stage founders",
      features: [
        "All Free features",
        "Full investor database access",
        "Advanced search filters",
        "Export up to 50 contacts/month",
        "Priority email support",
      ],
      buttonText: "Subscribe Now",
      highlighted: true,
    },
    {
      name: "Premium",
      price: "$99",
      period: "per month",
      description: "For serious fundraising efforts",
      features: [
        "All Core features",
        "Unlimited contact exports",
        "Investor matching algorithm",
        "Direct messaging system",
        "1-on-1 pitch deck review",
        "Dedicated success manager",
      ],
      buttonText: "Go Premium",
      highlighted: false,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white bg-clip-text mt-10">
              Choose Your Plan
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get access to our curated network of investors with a plan that
              fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 h-full">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative h-full group rounded-xl transition-all duration-500 hover:scale-105 
                ${plan.highlighted ? "transform scale-105" : ""}`}
              >
                {/* Glass background with gradient border */}
                <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-xl rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl" />
                <div className="absolute inset-0 rounded-xl border border-gray-700 group-hover:border-blue-500/50 transition-colors duration-300" />

                {/* Content */}
                <div className="relative h-full p-8 flex flex-col">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-400">/{plan.period}</span>
                    </div>
                    <p className="text-gray-400">{plan.description}</p>
                  </div>

                  <div className="space-y-4 flex-grow mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/subscription-plans")}
                    className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-300 
                    ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }
                    transform hover:-translate-y-1`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPage;
