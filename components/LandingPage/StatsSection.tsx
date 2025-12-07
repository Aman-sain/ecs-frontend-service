"use client";

import { motion } from "framer-motion";
import { Building2, Users, Globe, Award } from "lucide-react";

const stats = [
  { icon: Building2, label: "Companies", value: "500+", color: "text-blue-600" },
  { icon: Users, label: "Active Users", value: "50K+", color: "text-green-600" },
  { icon: Globe, label: "Countries", value: "25+", color: "text-purple-600" },
  { icon: Award, label: "Satisfaction", value: "98%", color: "text-orange-600" },
];

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by Organizations Worldwide
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of companies that streamline their workforce management with us
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <stat.icon className="h-12 w-12 mx-auto mb-4" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
