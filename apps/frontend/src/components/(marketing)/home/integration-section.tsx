// src/components/landing-page/integration-section.tsx
'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BgPattern } from "../../core/ui/bg-pattern";

// BigCommerce as inline SVG component
import BigCommerceIcon from "../../../../public/partners/bigcommerce.svg";

const partners = [
  { name: "Shopify",    logo: "/partners/shopify.svg",    url: "https://shopify.com/admin" },
  { name: "Amazon",     logo: "/partners/amazon.svg",     url: "https://sellercentral.amazon.com/" },
  { name: "Slack",      logo: "/partners/slack.svg",      url: "https://slack.com/signin" },
  {
    name: "BigCommerce",
    Icon: BigCommerceIcon,
    url: "https://login.bigcommerce.com/"
  },
  { name: "Shiphero",   logo: "/partners/shiphero.svg",   url: "https://shiphero.com/login" },
  { name: "WooCommerce",logo: "/partners/woocommerce.svg",url: "https://woocommerce.com/my-account/" },
];

export function IntegrationSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            <span>Integrated with Your&nbsp;</span>
            <span>Favorite Platforms</span>
          </h2>
          <p className="text-xl text-muted">
            Our PIM system connects seamlessly with all major e-commerce and marketplace platforms
          </p>
        </motion.div>

        {/* Logos Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
        >
          {partners.map((partner, i) => (
            <Link
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group bg-elevated dark:bg-white/10 border border-default dark:border-border-dark rounded-xl shadow-md p-6 hover:border-primary-300 dark:hover:border-primary-500/30 transition-all duration-300 cursor-pointer flex items-center justify-center"
              >
                {partner.Icon ? (
                  <partner.Icon
                    className="
                            h-12 w-auto
                            fill-current
                            text-gray-500            /* default gray */
                            transition-colors duration-300
                            group-hover:text-blue-800 /* blue on hover only for BigCommerce */
                    "
                  />
                ) : (
                  <Image
                    src={partner.logo!}
                    alt={partner.name}
                    width={120}
                    height={60}
                    className="
                      h-12 w-auto object-contain
                      filter grayscale        /* keep it gray */
                      transition-all duration-300
                      group-hover:grayscale-0 /* optional: bring back full color */
                    "
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Floating background elements */}
      <motion.div
        className="absolute bottom-40 left-20 w-40 h-40 bg-primary-light dark:bg-primary/10 rounded-full -z-10"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-20 right-20 w-28 h-28 bg-primary-lighter dark:bg-primary/10 rounded-full -z-10"
        animate={{ scale: [1, 1.1, 1], rotate: [0, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />
    </section>
  );
}
